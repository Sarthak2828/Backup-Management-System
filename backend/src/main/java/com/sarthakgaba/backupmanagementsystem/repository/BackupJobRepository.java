package com.sarthakgaba.backupmanagementsystem.repository;

import com.sarthakgaba.backupmanagementsystem.entity.BackupJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BackupJobRepository extends JpaRepository<BackupJob, Long> {

    List<BackupJob> findByStatus(String status);

    List<BackupJob> findByDatabaseName(String databaseName);

}