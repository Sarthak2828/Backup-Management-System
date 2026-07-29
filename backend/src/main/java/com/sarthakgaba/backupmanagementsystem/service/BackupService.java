package com.sarthakgaba.backupmanagementsystem.service;
import com.sarthakgaba.backupmanagementsystem.entity.BackupJob;
import com.sarthakgaba.backupmanagementsystem.repository.BackupJobRepository;
import com.sarthakgaba.backupmanagementsystem.util.DatabaseUtil;
import com.sarthakgaba.backupmanagementsystem.util.EncryptionUtil;
import com.sarthakgaba.backupmanagementsystem.util.ZipUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class BackupService {
    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private static final Pattern DB_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]+$");

    private final BackupJobRepository backupJobRepository;
    private final DataSource dataSource;

    @Value("${spring.datasource.username}")
    private String dbUsername;
    @Value("${spring.datasource.password:}")
    private String dbPassword;
    @Value("${spring.datasource.url}")
    private String dbUrl;
    @Value("${backup.encryption.secret}")
    private String encryptionSecret;
    @Value("${backup.mysql.path}")
    private String mysqlPath;
    @Value("${backup.mysqldump.path}")
    private String dumpPath;
    @Value("${backup.metadata.database:backup_meta}")
    private String metadataDatabase;

    public BackupService(BackupJobRepository backupJobRepository, DataSource dataSource) {
        this.backupJobRepository = backupJobRepository;
        this.dataSource = dataSource;
    }

    // ===== Validation =====

    /**
     * Validates the user-provided database name for safety and existence.
     * 1. Regex: only alphanumeric and underscores
     * 2. Blocks the application metadata database
     * 3. Verifies the database exists on the MySQL server
     */
    private void validateDatabaseName(String databaseName) {
        if (databaseName == null || databaseName.isBlank()) {
            throw new IllegalArgumentException("Database name is required.");
        }
        if (!DB_NAME_PATTERN.matcher(databaseName).matches()) {
            throw new IllegalArgumentException(
                "Invalid database name: '" + databaseName +
                "'. Only alphanumeric characters and underscores are allowed.");
        }
        if (databaseName.equalsIgnoreCase(metadataDatabase)) {
            throw new IllegalArgumentException(
                "Cannot backup or restore the application metadata database: " + metadataDatabase);
        }
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?")) {
            ps.setString(1, databaseName);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException(
                        "Database '" + databaseName + "' does not exist on the MySQL server.");
                }
            }
        } catch (SQLException e) {
            log.error("Failed to validate database existence for: {}", databaseName, e);
            throw new RuntimeException("Failed to validate database: " + e.getMessage(), e);
        }
    }

    // ===== Backup Operations =====

    public BackupJob createBackup(BackupJob backupJob) {
        log.info("Backup started");

        // Validate the user-provided database name
        validateDatabaseName(backupJob.getDatabaseName());

        File backupsDir = new File("backups");
        if (!backupsDir.exists()) {
            if (backupsDir.mkdirs()) {
                log.info("Created directory: backups/");
            }
        }

        String dbName;
        try {
            dbName = DatabaseUtil.extractDatabaseName(dbUrl);
        } catch (Exception e) {
            log.error("Failure reason: Parsing database name failed", e);
            backupJob.setStatus("FAILED");
            backupJobRepository.save(backupJob);
            throw new RuntimeException("Failed to extract database name from datasource URL", e);
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String baseName = "backup_" + timestamp;
        String sqlFilename = baseName + ".sql";
        String zipFilename = baseName + ".zip";
        String encFilename = baseName + ".zip.enc";
        File sqlFile = new File(backupsDir, sqlFilename);
        File zipFile = new File(backupsDir, zipFilename);
        File encFile = new File(backupsDir, encFilename);
        if (backupJob.getBackupName() == null || backupJob.getBackupName().isBlank()) {
            backupJob.setBackupName(encFilename);
        }
        backupJob.setFilePath(encFile.getPath());
        try {
            log.info("mysqldump started for database: {}", dbName);
            executeMysqlDump(dbName, sqlFile);
            log.info("mysqldump completed");
            ZipUtil.zipFile(sqlFile, zipFile);
            log.info("ZIP completed");
            EncryptionUtil.encryptFile(zipFile, encFile, encryptionSecret);
            log.info("Encryption completed");
            if (backupJob.getBackupTime() == null) {
                backupJob.setBackupTime(LocalDateTime.now());
            }
            backupJob.setStatus("COMPLETED");
            backupJob.setFileSize(encFile.length());
            BackupJob saved = backupJobRepository.save(backupJob);
            log.info("Metadata updated");
            return saved;
        } catch (Exception e) {
            log.error("Failure reason: Backup execution error", e);
            backupJob.setStatus("FAILED");
            backupJobRepository.save(backupJob);
            throw new RuntimeException("Backup execution failed", e);
        } finally {
            cleanupTempFiles(sqlFile, zipFile);
        }
    }

    public List<BackupJob> getAllBackups() {
        return backupJobRepository.findAll();
    }

    public BackupJob scheduleBackup(BackupJob backupJob) {
        // Validate the user-provided database name before saving the schedule
        validateDatabaseName(backupJob.getDatabaseName());

        backupJob.setStatus("SCHEDULED");
        if (backupJob.getBackupTime() == null) {
            backupJob.setBackupTime(LocalDateTime.now());
        }
        return backupJobRepository.save(backupJob);
    }

    public BackupJob runBackup(Long id) {
        BackupJob originalJob = backupJobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup job not found with id: " + id));

        BackupJob newJob = new BackupJob();
        newJob.setDatabaseName(originalJob.getDatabaseName());
        newJob.setBackupName(originalJob.getBackupName());
        newJob.setScheduledFrequency(originalJob.getScheduledFrequency());
        newJob.setStatus("PENDING");

        return createBackup(newJob);
    }

    public void deleteBackup(Long id) {
        BackupJob backupJob = backupJobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup job not found with id: " + id));

        String filePath = backupJob.getFilePath();
        if (filePath != null && !filePath.isEmpty()) {
            File file = new File(filePath);
            if (file.exists()) {
                if (file.delete()) {
                    log.info("Deleted backup file from disk: {}", filePath);
                } else {
                    log.warn("Failed to delete backup file from disk: {}", filePath);
                }
            } else {
                log.info("Backup file not found on disk, skipping file deletion: {}", filePath);
            }
        }

        backupJobRepository.delete(backupJob);
        log.info("Deleted backup job from database: {}", id);
    }

    public Resource downloadBackup(Long id) {
        log.info("Download requested");
        BackupJob backupJob = backupJobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup job not found with id: " + id));
        String filePath = backupJob.getFilePath();
        if (filePath == null || filePath.isEmpty()) {
            throw new RuntimeException("Backup file path is missing in job record");
        }
        File file = new File(filePath);
        if (!file.exists()) {
            log.error("Failure reason: Backup file does not exist on disk");
            throw new RuntimeException("Backup file not found on disk");
        }
        return new FileSystemResource(file);
    }

    // ===== Restore Operations =====

    public void restoreBackup(Long id) {
        log.info("Restore started for job id: {}", id);
        BackupJob backupJob = backupJobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup job not found with id: " + id));

        // Validate the target database name before proceeding
        validateDatabaseName(backupJob.getDatabaseName());

        String filePath = backupJob.getFilePath();
        if (filePath == null || filePath.isEmpty()) {
            throw new RuntimeException("Backup file path is missing in job record");
        }
        File encFile = new File(filePath);
        if (!encFile.exists()) {
            log.error("Failure reason: Encrypted backup file does not exist on disk: {}", filePath);
            throw new RuntimeException("Encrypted backup file not found on disk");
        }
        File tempDir = new File("backups/temp_restore_" + id);
        if (!tempDir.exists()) {
            tempDir.mkdirs();
        }

        String dbName;
        try {
            dbName = DatabaseUtil.extractDatabaseName(dbUrl);
        } catch (Exception e) {
            log.error("Failure reason: Parsing database name failed", e);
            throw new RuntimeException("Failed to extract database name from datasource URL", e);
        }

        File zipFile = new File(tempDir, "temp_backup.zip");
        File sqlFile = null;
        try {
            log.info("Decryption started for restore");
            EncryptionUtil.decryptFile(encFile, zipFile, encryptionSecret);
            log.info("Decryption completed for restore");
            log.info("Unzipping started for restore");
            ZipUtil.unzipFile(zipFile, tempDir);
            log.info("Unzipping completed for restore");
            File[] files = tempDir.listFiles((dir, name) -> name.endsWith(".sql"));
            if (files == null || files.length == 0) {
                throw new RuntimeException("No SQL dump file found inside decrypted backup zip archive");
            }
            sqlFile = files[0];
            log.info("Database restore started for database: {}", dbName);
            executeMysqlRestore(dbName, sqlFile);
            log.info("Database restore completed for database: {}", dbName);
        } catch (Exception e) {
            log.error("Failure reason: Database restore execution error", e);
            throw new RuntimeException("Database restore failed: " + e.getMessage(), e);
        } finally {
            // Ensure all temporary files are cleaned up
            if (zipFile.exists()) {
                zipFile.delete();
            }
            if (sqlFile != null && sqlFile.exists()) {
                sqlFile.delete();
            }
            File[] remainingFiles = tempDir.listFiles();
            if (remainingFiles != null) {
                for (File f : remainingFiles) {
                    f.delete();
                }
            }
            tempDir.delete();
        }
    }

    // ===== Process Execution (Security-hardened) =====

    /**
     * Executes mysql CLI to restore a database from a SQL dump file.
     *
     * Security measures:
     * - ProcessBuilder: no shell execution, arguments passed as separate list elements
     * - --one-database: ignores USE statements targeting other databases
     * - "--" separator: prevents database name from being interpreted as a flag
     * - Temp error file wrapped in try/finally for guaranteed cleanup
     */
    private void executeMysqlRestore(String dbName, File sqlFile) throws Exception {
        String host = DatabaseUtil.extractHost(dbUrl);
        String port = DatabaseUtil.extractPort(dbUrl);

        List<String> command = new ArrayList<>();
        command.add(mysqlPath);
        command.add("-h" + host);
        command.add("-P" + port);
        command.add("-u" + dbUsername);
        if (dbPassword != null && !dbPassword.trim().isEmpty()) {
            command.add("-p" + dbPassword.trim());
        }
        command.add("--one-database");
        command.add("--");
        command.add(dbName);

        log.info("Executing mysql restore: {} args (password hidden)", command.size());

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectInput(sqlFile);

        File errFile = File.createTempFile("mysql_restore_err", ".log");
        try {
            pb.redirectError(errFile);
            Process process = pb.start();
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                String errorMsg = new String(java.nio.file.Files.readAllBytes(errFile.toPath()));
                throw new RuntimeException(
                    "mysql restore failed with exit code " + exitCode + ". Error: " + errorMsg);
            }
        } finally {
            errFile.delete();
        }
    }

    /**
     * Executes mysqldump to create a SQL dump of the specified database.
     *
     * Security measures:
     * - ProcessBuilder: no shell execution, arguments passed as separate list elements
     * - --single-transaction: consistent InnoDB snapshot without locking
     * - --quick: streams rows instead of buffering in memory
     * - --routines: includes stored procedures
     * - --triggers: includes triggers
     * - "--" separator: prevents database name from being interpreted as a flag
     * - Temp error file wrapped in try/finally for guaranteed cleanup
     */
    private void executeMysqlDump(String dbName, File sqlFile) throws Exception {
        String host = DatabaseUtil.extractHost(dbUrl);
        String port = DatabaseUtil.extractPort(dbUrl);

        List<String> command = new ArrayList<>();
        command.add(dumpPath);
        command.add("-h" + host);
        command.add("-P" + port);
        command.add("-u" + dbUsername);
        if (dbPassword != null && !dbPassword.trim().isEmpty()) {
            command.add("-p" + dbPassword.trim());
        }
        command.add("--single-transaction");
        command.add("--quick");
        command.add("--routines");
        command.add("--triggers");
        command.add("--");
        command.add(dbName);

        log.info("Executing mysqldump: {} args (password hidden)", command.size());

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectOutput(sqlFile);

        File errFile = File.createTempFile("mysqldump_err", ".log");
        try {
            pb.redirectError(errFile);
            Process process = pb.start();
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                String errorMsg = new String(java.nio.file.Files.readAllBytes(errFile.toPath()));
                throw new RuntimeException(
                    "mysqldump failed with exit code " + exitCode + ". Error: " + errorMsg);
            }
        } finally {
            errFile.delete();
        }
    }

    // ===== Utilities =====

    private void cleanupTempFiles(File... files) {
        for (File file : files) {
            if (file != null && file.exists()) {
                if (!file.delete()) {
                    log.warn("Failed to delete temporary file: {}", file.getAbsolutePath());
                }
            }
        }
    }
}
