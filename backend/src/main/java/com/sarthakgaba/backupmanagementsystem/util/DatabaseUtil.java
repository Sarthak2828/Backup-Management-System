package com.sarthakgaba.backupmanagementsystem.util;
public class DatabaseUtil {
    public static String extractDatabaseName(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.isEmpty()) {
            throw new IllegalArgumentException("JDBC URL cannot be null or empty");
        }
        String prefix = "jdbc:mysql://";
        if (!jdbcUrl.startsWith(prefix)) {
            throw new IllegalArgumentException("Unsupported JDBC URL format: " + jdbcUrl);
        }
        int pathStartIndex = jdbcUrl.indexOf('/', prefix.length());
        if (pathStartIndex == -1) {
            throw new IllegalArgumentException("Database name not found in JDBC URL: " + jdbcUrl);
        }
        String dbPath = jdbcUrl.substring(pathStartIndex + 1);
        int paramIndex = dbPath.indexOf('?');
        if (paramIndex != -1) {
            dbPath = dbPath.substring(0, paramIndex);
        }
        dbPath = dbPath.trim();
        if (dbPath.isEmpty()) {
            throw new IllegalArgumentException("Database name is empty in JDBC URL: " + jdbcUrl);
        }
        return dbPath;
    }
}