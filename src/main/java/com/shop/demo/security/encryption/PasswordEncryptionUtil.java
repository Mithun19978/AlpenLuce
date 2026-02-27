package com.shop.demo.security.encryption;

import com.shop.demo.logMaintain.ApplicationLogger;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Utility class for password encryption and verification using BCrypt.
 * Handles passwords with special characters, numbers, and uppercase letters.
 */
@Component
public class PasswordEncryptionUtil {
    private final ApplicationLogger logger;
    private final BCryptPasswordEncoder encoder;

    public PasswordEncryptionUtil(ApplicationLogger logger) {
        this.logger = logger;
        this.encoder = new BCryptPasswordEncoder(10); // Explicitly set strength to 10 for consistency
    }

    /**
     * Encodes a raw password using BCrypt.
     *
     * @param rawPassword The raw password to encode (supports special characters, numbers, uppercase).
     * @return The BCrypt hash of the password.
     * @throws IllegalArgumentException if the password is null or empty.
     * @throws RuntimeException if encoding fails.
     */
    public String encode(CharSequence rawPassword) {
        try {
            if (rawPassword == null || rawPassword.length() == 0) {
                logger.error("[APP-ERROR] Attempted to encode null or empty password");
                throw new IllegalArgumentException("Password cannot be null or empty");
            }
            String hash = encoder.encode(rawPassword);
            logger.info("[APP-INFO] Password encoded successfully (length: {})", rawPassword.length());
            return hash;
        } catch (Exception e) {
            logger.error("[APP-ERROR] Failed to encode password: {}", e.getMessage(), e);
            throw new RuntimeException("Password encoding failed", e);
        }
    }

    /**
     * Verifies if a raw password matches a stored BCrypt hash.
     *
     * @param rawPassword     The raw password to check (supports special characters, numbers, uppercase).
     * @param encodedPassword The stored BCrypt hash.
     * @return true if the password matches the hash, false otherwise.
     */
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        try {
            if (rawPassword == null || encodedPassword == null) {
                logger.error("[APP-ERROR] Null input: rawPassword={}, encodedPassword={}",
                        rawPassword == null ? "null" : "non-null", encodedPassword);
                return false;
            }
            boolean result = encoder.matches(rawPassword, encodedPassword);
            logger.info("[APP-INFO] Password match checked with BCrypt: result={}, passwordLength={}",
                    result, rawPassword.length());
            return result;
        } catch (Exception e) {
            logger.error("[APP-ERROR] Error checking password match: {}", e.getMessage(), e);
            return false;
        }
    }
}