package com.shop.demo.security.encryption;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

public class DataEncryptionUtil {
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    // 32-byte key for AES-256 (replace with secure key management in production)
    private static final String KEY = "MySecretKey1234567890123456789012"; 
    private static final SecretKeySpec secretKey = new SecretKeySpec(KEY.getBytes(StandardCharsets.UTF_8), "AES");

    public static String encrypt(String data) throws Exception {
        if (data == null) return null;
        SecureRandom random = new SecureRandom();
        byte[] iv = new byte[16];
        random.nextBytes(iv);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, new javax.crypto.spec.IvParameterSpec(iv));
        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(encrypted);
    }

    public static String decrypt(String encryptedData) throws Exception {
        if (encryptedData == null) return null;
        String[] parts = encryptedData.split(":");
        if (parts.length != 2) throw new IllegalArgumentException("Invalid encrypted data");
        byte[] iv = Base64.getDecoder().decode(parts[0]);
        byte[] encrypted = Base64.getDecoder().decode(parts[1]);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, new javax.crypto.spec.IvParameterSpec(iv));
        byte[] decrypted = cipher.doFinal(encrypted);
        return new String(decrypted, StandardCharsets.UTF_8);
    }
}