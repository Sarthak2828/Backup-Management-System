# Changelog

All notable changes to the **Backup Management System** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-29

### Added
- **Authentication & Security**:
  - JWT (JSON Web Token) authentication with stateless session management.
  - Role-Based Access Control (RBAC) supporting `ADMIN` (full operations) and `AUDITOR` (read-only monitoring).
  - AES-256 / CBC encryption with PKCS5 padding and random Initialization Vectors (IV) for file confidentiality.
  - Automatic SHA-256 key derivation for secure key management.
- **Backup Engine**:
  - On-demand backup execution using MySQL `mysqldump` system binary.
  - ProcessBuilder execution with multi-argument array isolation against shell injection.
  - Automated ZIP compression for database dump archives.
  - Backup scheduling with custom frequency settings (`HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`).
  - Automated TCP connection parameters parsing for remote host and custom port connections.
- **Restore Engine**:
  - Database restoration from encrypted ZIP backup archives.
  - Temporary archive extraction with automatic cleanup in `finally` blocks.
  - `--one-database` restore flag isolation to prevent cross-database target pollution.
  - Standardized `--` CLI separator protection against argument injection.
- **Production Input & Schema Validation**:
  - Database name pattern regex validation (`^[a-zA-Z0-9_]+$`).
  - Target database existence verification via `INFORMATION_SCHEMA.SCHEMATA`.
  - Configurable metadata database protection (`backup.metadata.database`) to reject self-backup or self-restore attempts.
- **User Interface**:
  - React (Vite) single-page web dashboard.
  - High-level metrics visualization (total backups, success rate, storage size, last backup timestamp).
  - Search, status filtering, frequency filtering, column sorting, and paginated backup history.
  - Action progress overlays for instant user feedback.
- **Deployment & Infrastructure**:
  - Multi-stage Dockerfile bundling OpenJDK 21 and `mysql-client`.
  - Deployment configuration for Railway (backend API + MySQL) and Vercel (React frontend).

### Fixed & Hardened
- Corrected backup naming logic to prevent custom backup names from being overwritten by auto-generated timestamp filenames.
- Hardened resource management using explicit `try/finally` blocks for temporary process log files and extracted archives.
