package com.sarthakgaba.backupmanagementsystem.util;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
public class ZipUtil {
    public static void zipFile(File sourceFile, File destZipFile) throws IOException {
        if (!sourceFile.exists()) {
            throw new IllegalArgumentException("Source file does not exist: " + sourceFile.getAbsolutePath());
        }
        try (FileOutputStream fos = new FileOutputStream(destZipFile);
             ZipOutputStream zos = new ZipOutputStream(fos);
             FileInputStream fis = new FileInputStream(sourceFile)) {
            ZipEntry zipEntry = new ZipEntry(sourceFile.getName());
            zos.putNextEntry(zipEntry);
            byte[] buffer = new byte[4096];
            int length;
            while ((length = fis.read(buffer)) != -1) {
                zos.write(buffer, 0, length);
            }
            zos.closeEntry();
        }
    }
}