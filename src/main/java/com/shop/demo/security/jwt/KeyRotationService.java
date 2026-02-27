package com.shop.demo.security.jwt;

import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.propertiesReader.SecurityProperties;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.security.SecureRandom;

@Service
public class KeyRotationService {
    private final SecurityProperties secProps;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationLogger logger;

    public KeyRotationService(SecurityProperties secProps, JwtTokenProvider jwtTokenProvider, ApplicationLogger logger) {
        this.secProps = secProps;
        this.jwtTokenProvider = jwtTokenProvider;
        this.logger = logger;
        logger.info("[KEY-ROTATION-INIT] JWT key rotation cron: {}", secProps.getJwtSecretKeyRotation());
    }

    @Scheduled(cron = "#{@securityProperties.getJwtSecretKeyRotation()}")
    public void rotateKey() {
        try {
            logger.info("[KEY-ROTATION-INFO] Starting JWT key rotation");
            SecureRandom random = SecureRandom.getInstanceStrong();
            byte[] newKey = new byte[64];
            random.nextBytes(newKey);
            logger.debug("[KEY-ROTATION-DEBUG] Generated new key, length: {} bytes", newKey.length);
            jwtTokenProvider.updateSigningKey(newKey);
            String keyPath = secProps.getJwtSecretKeyPath();
            try (FileOutputStream fos = new FileOutputStream(keyPath)) {
                fos.write(newKey);
                logger.info("[KEY-ROTATION-INFO] JWT key written to: {}", keyPath);
            }
            logger.info("[KEY-ROTATION-INFO] JWT key rotated successfully");
        } catch (Exception e) {
            logger.error("[KEY-ROTATION-ERROR] Key rotation failed for path {}: {}", secProps.getJwtSecretKeyPath(), e.getMessage(), e);
            throw new RuntimeException("Key rotation failed", e);
        }
    }
}