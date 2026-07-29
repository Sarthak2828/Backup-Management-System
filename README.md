# Backup Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

An enterprise-grade, secure **Database Backup & Restoration Management System** designed to streamline MySQL database operations. Built with a modern **Spring Boot** REST backend, an interactive **React** single-page web dashboard, **AES-256 / CBC** file encryption, **ZIP** compression, and robust **Role-Based Access Control (RBAC)**.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Folder Structure](#-folder-structure)
- [Screenshots](#-screenshots)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Variables](#-environment-variables)
- [Deployment Guide](#-deployment-guide)
- [API Documentation](#-api-documentation)
- [Security Architecture](#-security-architecture)
- [Future Improvements Roadmap](#-future-improvements-roadmap)
- [License](#-license)

---

## 🌟 Project Overview

The **Backup Management System** provides centralized database administration, scheduling, encryption, download, and restoration services. It isolates database administration tasks behind strict JWT authentication and granular user roles, preventing accidental data loss or unauthorized access.

### Key Highlights:
- **AES-256 Encryption & ZIP Compression**: Backups are archived into standard `.zip` files and encrypted using AES-256 in CBC mode with random Initialization Vectors (IV) before storage.
- **Restore Isolation**: Restores are executed using the MySQL CLI with `--one-database` protection to guarantee zero cross-database script execution.
- **Process Security**: Native `mysqldump` and `mysql` processes are executed using Java `ProcessBuilder` with array-separated arguments to prevent argument injection.
- **Granular RBAC**: Distinguishes between `ADMIN` users (full execution capabilities) and `AUDITOR` users (read-only audit logging and monitoring).

---

## ⚡ Features

### 🔑 Authentication & Access Control
- **JWT Authentication**: Stateless authentication using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Create, run, schedule, download, restore, and delete backups.
  - `AUDITOR`: View dashboard analytics, examine logs, and monitor execution history (read-only).

### 💾 Backup Management
- **Create Backup**: Instantly trigger on-demand backups for target MySQL databases.
- **Run Scheduled Backup**: Manually re-trigger pre-configured backup schedules on demand.
- **Schedule Backup**: Configure recurring backup schedules (`HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`).
- **Download Backup**: Securely download encrypted backup artifacts (`.zip.enc`) over HTTPS.
- **Delete Backup**: Safely purge backup metadata records and associated disk files.

### 🔄 Database Restoration
- **Restore Database**: Decrypt, extract, and restore encrypted backup archives directly into target databases.
- **Restore Safeguards**: Enforces schema existence validation and metadata database exclusion.

### 📊 Dashboard & UI Analytics
- **Analytics Cards**: Total Backups, Success Rate, Cumulative Storage Usage, and Last Backup Timestamp.
- **Backup History Table**: Paginated view of backup jobs with quick action menus.
- **Search & Filter**: Real-time searching by backup name, status filtering (`COMPLETED`, `FAILED`, `PENDING`, `SCHEDULED`), and frequency filtering.
- **Sorting**: Multi-column sorting by timestamp, name, size, or status in ascending/descending order.

---

## 🏗️ Architecture

```
                  +-----------------------------------+
                  |   React Frontend (Vite Single Page)|
                  |     (Deployed on Vercel)          |
                  +-----------------+-----------------+
                                    |
                                    | REST API (HTTPS / JWT)
                                    v
                  +-----------------+-----------------+
                  |    Spring Boot Backend API        |
                  |    (Deployed on Railway)          |
                  +--------+----------------+---------+
                           |                |
             (JDBC / JPA)  |                | (ProcessBuilder Execution)
                           v                v
      +--------------------+----+    +-----+--------------------+
      |  MySQL Database Server  |    | Native Binaries (CLI)    |
      |  (Metadata & Schemas)   |    | mysqldump / mysql        |
      +-------------------------+    +--------------------------+
```

### Backup Flow

```
[User Request] 
     │
     ▼
[Input Validation] (Regex check, DB existence query, Metadata DB block)
     │
     ▼
[mysqldump Execution] (CLI: --single-transaction --quick --routines --triggers)
     │
     ▼
[Zip Archive Creation] (.sql ──> .zip)
     │
     ▼
[AES-256 Encryption] (.zip ──> .zip.enc with random 16-byte IV)
     │
     ▼
[Database Metadata Persistence] (Status: COMPLETED, file path, size, timestamp)
     │
     ▼
[Temp Resource Cleanup] (Deletes .sql and unencrypted .zip files)
```

### Restore Flow

```
[User Request] (Job ID)
     │
     ▼
[Target Database Validation] (Schema existence & Metadata DB protection)
     │
     ▼
[AES-256 Decryption] (.zip.enc ──> .zip in temp folder)
     │
     ▼
[Zip Archive Extraction] (.zip ──> .sql with Zip-Slip path checks)
     │
     ▼
[mysql CLI Restore] (CLI: --one-database -- <db_name>)
     │
     ▼
[Temp Resource Cleanup] (Deletes extracted SQL, zip, and temp directory)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Component-driven UI framework with fast HMR build |
| **Styling** | Bootstrap 5, CSS3 | Clean, responsive enterprise UI layout |
| **Backend** | Java 21, Spring Boot 3.4 | Robust RESTful Web Service architecture |
| **Security** | Spring Security, JJWT | JWT authentication and RBAC filter chain |
| **Database** | MySQL 8.0, Spring Data JPA | Relational persistence and schema validation |
| **CLI Tooling** | `mysqldump`, `mysql` | Native MySQL dump & restore CLI utilities |
| **Encryption** | Java Cryptography Extension (JCE) | AES-256 / CBC mode with PKCS5 padding |

---

## 📁 Folder Structure

```
backup-management-system/
├── LICENSE
├── README.md
├── CHANGELOG.md
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── src/
│       ├── main/
│       │   ├── java/com/sarthakgaba/backupmanagementsystem/
│       │   │   ├── BackupManagementSystemApplication.java
│       │   │   ├── config/
│       │   │   │   ├── DatabaseSeeder.java
│       │   │   │   └── SecurityConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java
│       │   │   │   └── BackupController.java
│       │   │   ├── dto/
│       │   │   │   ├── LoginRequest.java
│       │   │   │   ├── LoginResponse.java
│       │   │   │   └── RegisterRequest.java
│       │   │   ├── entity/
│       │   │   │   ├── BackupJob.java
│       │   │   │   ├── Role.java
│       │   │   │   └── User.java
│       │   │   ├── repository/
│       │   │   │   ├── BackupJobRepository.java
│       │   │   │   └── UserRepository.java
│       │   │   ├── security/
│       │   │   │   ├── AuthenticationConfig.java
│       │   │   │   ├── CustomUserDetailsService.java
│       │   │   │   ├── JwtAuthenticationEntryPoint.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   └── JwtUtil.java
│       │   │   ├── service/
│       │   │   │   ├── BackupService.java
│       │   │   │   └── UserService.java
│       │   │   └── util/
│       │   │       ├── DatabaseUtil.java
│       │   │       ├── EncryptionUtil.java
│       │   │       └── ZipUtil.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Layout.jsx
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   └── Sidebar.jsx
        ├── pages/
        │   ├── BackupHistory.jsx
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   └── ScheduleBackup.jsx
        └── services/
            └── api.js
```

---

## 🖼️ Screenshots

### 1. Login View
*Clean login screen with role credentials support (`ADMIN` and `AUDITOR`).*

### 2. Dashboard View
*System dashboard featuring metrics summary cards, storage usage, success rate, and recent backup logs.*

### 3. Backup History View
*Complete history list with real-time search, status/frequency filters, pagination, and action controls.*

### 4. Schedule Backup Form
*Interface to configure database targets and scheduled backup frequencies.*

### 5. Create Backup Execution
*On-demand backup trigger with real-time feedback indicator.*

### 6. Database Restoration Modal
*Confirmation prompt ensuring safe database restoration operations.*

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **JDK 21** or later
- **Node.js 18+** & `npm`
- **MySQL Server 8.0+** with `mysqldump` and `mysql` tools installed locally.

### 1. Database Setup
Create the target MySQL database:
```sql
CREATE DATABASE backup_system;
```

### 2. Backend Configuration
Navigate to the `backend/` directory:
```bash
cd backend
```
Update `src/main/resources/application.properties` (or set environment variables):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/backup_system?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password

backup.encryption.secret=MySuperSecretKeyForAES256Encryption!
backup.mysql.path=C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe
backup.mysqldump.path=C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe
```

Run the Spring Boot application using Maven wrapper:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```
The backend server will start at `http://localhost:8080`.

### 3. Frontend Setup
Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The React development server will start at `http://localhost:5173`.

### 4. Default Credentials
The `DatabaseSeeder` automatically initializes default test users on first launch:
- **Admin**: `username: admin` | `password: password` (Full Permissions)
- **Auditor**: `username: auditor` | `password: password` (Read-only Access)

---

## 🔑 Environment Variables

### Backend Environment Variables (Railway / Production)

| Variable Name | Description | Default Value / Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC Connection URL | `jdbc:mysql://host:port/dbname` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `secret` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `Base64_Encoded_Secret_Key...` |
| `BACKUP_ENCRYPTION_SECRET` | Secret key for AES-256 encryption | `AES_Secret_Key_32_Chars...` |
| `MYSQL_PATH` | Path to `mysql` binary | `mysql` (Docker container) |
| `MYSQLDUMP_PATH` | Path to `mysqldump` binary | `mysqldump` (Docker container) |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend CORS origins | `https://your-frontend.vercel.app` |
| `BACKUP_METADATA_DATABASE` | Application metadata schema name | `backup_meta` |

### Frontend Environment Variables (Vercel / Production)

| Variable Name | Description | Default Value / Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base API URL of Spring Boot backend | `https://your-backend.up.railway.app/api` |

---

## 🚀 Deployment Guide

### Backend Deployment (Railway)
1. The repository includes a production multi-stage `backend/Dockerfile` that installs `mysql-client` and compiles the Spring Boot app into an executable JAR.
2. Link your GitHub repository to Railway.
3. Configure environment variables in Railway settings (`SPRING_DATASOURCE_URL`, `JWT_SECRET`, etc.).
4. Railway will automatically build the container using the provided `Dockerfile`.

### Frontend Deployment (Vercel)
1. Link the `frontend/` directory to Vercel.
2. Set Framework Preset to **Vite**.
3. Configure `VITE_API_BASE_URL` pointing to your Railway backend URL.
4. Deploy the application.

> [!TIP]
> **Railway Storage Recommendation**: By default, container storage on cloud platforms is ephemeral. For production persistence, attach a **Railway Volume** mounted at `/app/backups` or integrate cloud object storage (Amazon S3 / Google Cloud Storage).

---

## 🌐 API Documentation

All endpoints (except `/api/auth/*`) require a valid JWT Bearer token passed in the `Authorization` header: `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose | Required Role | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public | `{ username, email, password }` | String confirmation |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public | `{ username, password }` | `{ token, username, role }` |
| `GET` | `/api/backups` | List all backup jobs | `ADMIN`, `AUDITOR` | None | `List<BackupJob>` |
| `POST` | `/api/backups` | Create & execute a backup | `ADMIN` | `{ databaseName, backupName }` | Created `BackupJob` |
| `POST` | `/api/backups/schedule` | Save a backup schedule | `ADMIN` | `{ databaseName, scheduledFrequency }` | Scheduled `BackupJob` |
| `POST` | `/api/backups/{id}/run` | Re-run an existing job schedule | `ADMIN` | None | Created `BackupJob` |
| `DELETE` | `/api/backups/{id}` | Delete backup metadata & file | `ADMIN` | None | String confirmation |
| `POST` | `/api/backups/{id}/restore`| Restore database from backup | `ADMIN` | None | String confirmation |
| `GET` | `/api/backups/download/{id}`| Download encrypted `.zip.enc` | `ADMIN` | None | Binary File Stream |

---

## 🔒 Security Architecture

1. **JWT Stateless Authentication**: User identity and authorities are signed using HMAC-SHA key algorithms.
2. **AES-256 CBC Encryption**: Backup archives are encrypted with random 16-byte IVs written to file headers, ensuring ciphertext randomness even for identical SQL dumps.
3. **Zip Slip Prevention**: Unzipping utilities validate target extraction paths against canonical directory boundaries (`!newFilePath.startsWith(destDirPath + File.separator)`).
4. **Input Sanitization & Injection Defense**:
   - `databaseName` inputs are validated against `^[a-zA-Z0-9_]+$`.
   - `ProcessBuilder` passes arguments as explicit array elements without shell interpreter invocation.
   - CLI execution uses the `--` argument separator.
5. **Database Protection**: Restores enforce `--one-database` isolation and restrict self-backup/restore of application metadata tables.

---

## 🛣️ Future Improvements Roadmap

- **Metadata Database Separation**: Migrate metadata tables (`users`, `backup_jobs`) to a dedicated `backup_meta` schema.
- **Persistent Volume Integration**: Attach persistent volumes (e.g., Railway Volumes) for multi-host container file retention.
- **Cloud Object Storage (Amazon S3)**: Stream encrypted backups directly to AWS S3 or Google Cloud Storage buckets.
- **Automated Alerts & Monitoring**: Integrate Webhook and email notifications for failed backup/restore events.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
