# Backup Management System

A full-stack, enterprise-grade application for managing database backups with automated scheduling, secure JCE AES encryption, ZIP compression, and stateless role-based authentication.

---

## Project Structure

```
backup-management-system/
│
├── backend/                  # Java Spring Boot 3.x Backend Application
│   ├── src/                  # Application source code
│   └── pom.xml               # Maven configuration
│
├── frontend/                 # React (Vite) + Bootstrap Frontend Application
│   ├── src/                  # React source files
│   └── package.json          # Node dependencies
│
├── README.md                 # Project documentation
└── .gitignore                # Global git ignore configuration
```

---

## Tech Stack

### Backend
- **Core**: Java 21 / Spring Boot 3.5.4
- **Security**: Spring Security 6 / Stateless JWT Authentication (JJWT 0.12.x)
- **Database Access**: Spring Data JPA / Hibernate
- **Database**: MySQL 8.x
- **Backup Execution**: MySQL `mysqldump` Process Integration
- **Compression**: Java Standard ZIP Utilities
- **Encryption**: AES-256 (JCE Cryptography API)

### Frontend
- **Framework**: React 18 / Vite
- **Styling**: Bootstrap 5 / Bootstrap Icons
- **Routing**: React Router DOM 6
- **API Client**: Axios (with Bearer Token Interceptors)

---

## Getting Started

### 1. Backend Configuration
Navigate to the `backend/` directory:
- Update `src/main/resources/application.properties` with your database URL, credentials, and JWT configuration:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/backup_system
  spring.datasource.username=YOUR_MYSQL_USERNAME
  spring.datasource.password=YOUR_MYSQL_PASSWORD
  backup.encryption.secret=ChangeThisToAStrongSecretKey123
  jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  jwt.expiration=86400000
  ```
- Make sure `mysqldump.exe` path in `BackupService.java` is correct for your OS installation (defaults to `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe`).
- Build and run:
  ```bash
  mvn clean install
  mvn spring-boot:run
  ```

### 2. Frontend Configuration
Navigate to the `frontend/` directory:
- Install packages:
  ```bash
  npm install
  ```
- Run local server:
  ```bash
  npm run dev
  ```
- Use the credentials `admin` / `password` on the Login page to gain dashboard access.
