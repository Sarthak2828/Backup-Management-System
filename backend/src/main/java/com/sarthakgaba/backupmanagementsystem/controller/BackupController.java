package com.sarthakgaba.backupmanagementsystem.controller;
import com.sarthakgaba.backupmanagementsystem.entity.BackupJob;
import com.sarthakgaba.backupmanagementsystem.service.BackupService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/backups")
public class BackupController {
    private final BackupService backupService;
    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }
    @GetMapping
    public ResponseEntity<List<BackupJob>> getAllBackups() {
        List<BackupJob> backups = backupService.getAllBackups();
        return ResponseEntity.ok(backups);
    }
    @PostMapping
    public ResponseEntity<BackupJob> createBackup(@RequestBody BackupJob backupJob) {
        BackupJob created = backupService.createBackup(backupJob);
        return ResponseEntity.ok(created);
    }
    @PostMapping("/schedule")
    public ResponseEntity<BackupJob> scheduleBackup(@RequestBody BackupJob backupJob) {
        BackupJob scheduled = backupService.scheduleBackup(backupJob);
        return ResponseEntity.ok(scheduled);
    }
    @PostMapping("/{id}/run")
    public ResponseEntity<BackupJob> runBackup(@PathVariable Long id) {
        BackupJob created = backupService.runBackup(id);
        return ResponseEntity.ok(created);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBackup(@PathVariable Long id) {
        try {
            backupService.deleteBackup(id);
            return ResponseEntity.ok("Backup deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/{id}/restore")
    public ResponseEntity<String> restoreBackup(@PathVariable Long id) {
        try {
            backupService.restoreBackup(id);
            return ResponseEntity.ok("Database restored successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body("Restore failed: " + e.getMessage());
        }
    }
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadBackup(@PathVariable Long id) {
        try {
            Resource resource = backupService.downloadBackup(id);
            String filename = resource.getFilename() != null ? resource.getFilename() : "backup.zip.enc";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
