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

    public static String extractHost(String jdbcUrl) {
        String prefix = "jdbc:mysql://";
        if (jdbcUrl == null || !jdbcUrl.startsWith(prefix)) {
            return "localhost";
        }
        String hostPortDb = jdbcUrl.substring(prefix.length());
        int slashIndex = hostPortDb.indexOf('/');
        String hostPort = (slashIndex != -1) ? hostPortDb.substring(0, slashIndex) : hostPortDb;
        int colonIndex = hostPort.indexOf(':');
        return (colonIndex != -1) ? hostPort.substring(0, colonIndex) : hostPort;
    }

    public static String extractPort(String jdbcUrl) {
        String prefix = "jdbc:mysql://";
        if (jdbcUrl == null || !jdbcUrl.startsWith(prefix)) {
            return "3306";
        }
        String hostPortDb = jdbcUrl.substring(prefix.length());
        int slashIndex = hostPortDb.indexOf('/');
        String hostPort = (slashIndex != -1) ? hostPortDb.substring(0, slashIndex) : hostPortDb;
        int colonIndex = hostPort.indexOf(':');
        return (colonIndex != -1) ? hostPort.substring(colonIndex + 1) : "3306";
    }
}