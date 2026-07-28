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
import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
@Service
public class BackupService {
    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private final BackupJobRepository backupJobRepository;
    @Value("${spring.datasource.username}")
    private String dbUsername;
    @Value("${spring.datasource.password:}")
    private String dbPassword;
    @Value("${spring.datasource.url}")
    private String dbUrl;
    @Value("${backup.encryption.secret}")
    private String encryptionSecret;
    public BackupService(BackupJobRepository backupJobRepository) {
        this.backupJobRepository = backupJobRepository;
    }
    public BackupJob createBackup(BackupJob backupJob) {
        log.info("Backup started");
        if (backupJob.getDatabaseName() == null || backupJob.getDatabaseName().isBlank()) {
            throw new IllegalArgumentException("Database name is required.");
        }
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
        backupJob.setBackupName(encFilename);
        backupJob.setFilePath(encFile.getPath());
        try {
            log.info("mysqldump started");
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
        backupJob.setStatus("SCHEDULED");
        if (backupJob.getBackupTime() == null) {
            backupJob.setBackupTime(LocalDateTime.now());
        }
        return backupJobRepository.save(backupJob);
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
    private void executeMysqlDump(String dbName, File sqlFile) throws Exception {
        String dumpPath = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe";
        List<String> command = new ArrayList<>();
        command.add(dumpPath);
        command.add("-u" + dbUsername);
        if (dbPassword != null && !dbPassword.trim().isEmpty()) {
            command.add("-p" + dbPassword.trim());
        }
        command.add(dbName);
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectOutput(sqlFile);
        File errFile = File.createTempFile("mysqldump_err", ".log");
        pb.redirectError(errFile);
        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            String errorMsg = "";
            try {
                errorMsg = new String(java.nio.file.Files.readAllBytes(errFile.toPath()));
            } catch (Exception ex) {
                // Ignore
            } finally {
                errFile.delete();
            }
            throw new RuntimeException("mysqldump failed with exit code " + exitCode + ". Error: " + errorMsg);
        }
        errFile.delete();
    }
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
