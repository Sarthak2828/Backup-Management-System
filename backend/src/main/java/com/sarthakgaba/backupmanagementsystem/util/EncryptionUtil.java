package com.sarthakgaba.backupmanagementsystem.util;
import javax.crypto.Cipher;
import javax.crypto.CipherOutputStream;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;
public class EncryptionUtil {
    public static void encryptFile(File sourceFile, File destFile, String secret) throws Exception {
        if (!sourceFile.exists()) {
            throw new IllegalArgumentException("Source file does not exist: " + sourceFile.getAbsolutePath());
        }
        SecretKeySpec secretKey = deriveKey(secret);
        byte[] ivBytes = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(ivBytes);
        IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
        try (FileInputStream fis = new FileInputStream(sourceFile);
             FileOutputStream fos = new FileOutputStream(destFile)) {
            fos.write(ivBytes);
            try (CipherOutputStream cos = new CipherOutputStream(fos, cipher)) {
                byte[] buffer = new byte[4096];
                int length;
                while ((length = fis.read(buffer)) != -1) {
                    cos.write(buffer, 0, length);
                }
                cos.flush();
            }
        }
    }
    public static void decryptFile(File sourceFile, File destFile, String secret) throws Exception {
        if (!sourceFile.exists()) {
            throw new IllegalArgumentException("Source file does not exist: " + sourceFile.getAbsolutePath());
        }
        SecretKeySpec secretKey = deriveKey(secret);
        try (FileInputStream fis = new FileInputStream(sourceFile);
             FileOutputStream fos = new FileOutputStream(destFile)) {
            byte[] ivBytes = new byte[16];
            int ivBytesRead = fis.read(ivBytes);
            if (ivBytesRead != 16) {
                throw new IllegalArgumentException("Invalid encrypted file: IV is missing or truncated.");
            }
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            try (javax.crypto.CipherInputStream cis = new javax.crypto.CipherInputStream(fis, cipher)) {
                byte[] buffer = new byte[4096];
                int length;
                while ((length = cis.read(buffer)) != -1) {
                    fos.write(buffer, 0, length);
                }
                fos.flush();
            }
        }
    }
    private static SecretKeySpec deriveKey(String secret) throws NoSuchAlgorithmException {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        byte[] hashedKey = sha.digest(keyBytes);
        int maxAllowedKeyLengthBits;
        try {
            maxAllowedKeyLengthBits = Cipher.getMaxAllowedKeyLength("AES");
        } catch (Exception e) {
            maxAllowedKeyLengthBits = 128;
        }
        if (maxAllowedKeyLengthBits < 256) {
            byte[] truncatedKey = Arrays.copyOf(hashedKey, 16);
            return new SecretKeySpec(truncatedKey, "AES");
        } else {
            return new SecretKeySpec(hashedKey, "AES");
        }
    }
}

