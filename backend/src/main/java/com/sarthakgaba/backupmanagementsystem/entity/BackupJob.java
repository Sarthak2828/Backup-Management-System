package com.sarthakgaba.backupmanagementsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "backup_jobs")
public class BackupJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String backupName;

    private String databaseName;

    private String filePath;

    private Long fileSize;

    private String status;

    private LocalDateTime backupTime;

    private String scheduledFrequency;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public BackupJob() {
    }

    public Long getId() {
        return id;
    }

    public String getBackupName() {
        return backupName;
    }

    public void setBackupName(String backupName) {
        this.backupName = backupName;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getBackupTime() {
        return backupTime;
    }

    public void setBackupTime(LocalDateTime backupTime) {
        this.backupTime = backupTime;
    }

    public String getScheduledFrequency() {
        return scheduledFrequency;
    }

    public void setScheduledFrequency(String scheduledFrequency) {
        this.scheduledFrequency = scheduledFrequency;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}