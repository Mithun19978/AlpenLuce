package com.shop.demo.propertiesReader;

import com.shop.demo.logMaintain.ApplicationLogger;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

@Component
public class SecurityProperties {
    private final Properties properties = new Properties();
    private final ApplicationLogger logger = new ApplicationLogger();
    private final String mysocksHome;

    public SecurityProperties() {
        this.mysocksHome = resolveMysocksHome();
        loadPropertiesFromFile();
    }

    private String resolveMysocksHome() {
        String home = System.getenv("SHOP_HOME");
        if (home == null || home.trim().isEmpty()) {
            home = "D:/devops/mysocks";
            logger.warn("SHOP_HOME not set. Using default: {}", home);
        }
        return home;
    }

    private void loadPropertiesFromFile() {
        String filePath = mysocksHome + "/config/security.properties";
        try (FileInputStream fis = new FileInputStream(filePath)) {
            Properties fileProps = new Properties();
            fileProps.load(fis);
            loadProperties(fileProps);
            logger.info("Successfully loaded properties from: {}", filePath);
        } catch (IOException e) {
            logger.error("Failed to load security.properties from {}", filePath, e);
            throw new RuntimeException("Failed to load security.properties", e);
        }
    }

    public void loadProperties(Properties props) {
        properties.clear();
        Properties resolvedProps = new Properties();
        for (String key : props.stringPropertyNames()) {
            String value = props.getProperty(key);
            if (value != null && value.contains("${MYSOCKS_HOME}")) {
                value = value.replace("${MYSOCKS_HOME}", mysocksHome);
            }
            resolvedProps.setProperty(key, value);
        }
        properties.putAll(resolvedProps);
        logger.info("Loaded security properties. JWT secret key path: {}", getJwtSecretKeyPath());
    }

    public String getRequiredProperty(String key, String propertyName) {
        String value = properties.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            logger.error("Required property {} is missing or empty", propertyName);
            throw new IllegalStateException("Required property " + propertyName + " is missing or empty");
        }
        return value;
    }

    public String getProperty(String key) {
        return properties.getProperty(key);
    }

    public CorsProperties getCors() {
        return new CorsProperties(
            getCorsAllowedOrigins(),
            getCorsAllowedMethods(),
            getCorsAllowedHeaders(),
            isCorsAllowCredentials()
        );
    }

    public String[] getCorsAllowedOrigins() {
        return split("security.cors.allowed-origins");
    }

    public String[] getCorsAllowedMethods() {
        return split("security.cors.allowed-methods");
    }

    public String[] getCorsAllowedHeaders() {
        return split("security.cors.allowed-headers");
    }

    public boolean isCorsAllowCredentials() {
        return Boolean.parseBoolean(properties.getProperty("security.cors.allow-credentials", "false"));
    }

    public String getJwtSecretKeyPath() {
        return properties.getProperty("security.jwt.secret-key-path");
    }

    public String getJwtSecretKeyRotation() {
        return properties.getProperty("security.jwt.secret-key-rotation");
    }

    public long getJwtTokenExpirationMs() {
        return Long.parseLong(properties.getProperty("security.jwt.token-expiration-ms", "600000"));
    }

    public long getJwtRefreshTokenExpirationMs() {
        return Long.parseLong(properties.getProperty("security.jwt.refresh-token-expiration-ms", "18000000"));
    }

    public String getContentSecurityPolicy() {
        return properties.getProperty("security.headers.content-security-policy");
    }

    public String getStrictTransportSecurity() {
        return properties.getProperty("security.headers.strict-transport-security");
    }

    public String getXFrameOptions() {
        return properties.getProperty("security.headers.x-frame-options");
    }

    public String getXContentTypeOptions() {
        return properties.getProperty("security.headers.x-content-type-options");
    }

    public String getXXssProtection() {
        return properties.getProperty("security.headers.x-xss-protection");
    }

    public String getCacheControl() {
        return properties.getProperty("security.headers.cache-control");
    }

    public String getReferrerPolicy() {
        return properties.getProperty("security.headers.referrer-policy");
    }

    public String getSetCookie() {
        return properties.getProperty("security.headers.set-cookie");
    }

    public String getEncryptionKeyFile() {
        return properties.getProperty("encryption.key.file");
    }

    private String[] split(String key) {
        String value = properties.getProperty(key, "");
        return value.isEmpty() ? new String[0] : value.split("\\s*,\\s*");
    }

    public static class CorsProperties {
        private final String[] allowedOrigins;
        private final String[] allowedMethods;
        private final String[] allowedHeaders;
        private final boolean allowCredentials;

        public CorsProperties(String[] allowedOrigins, String[] allowedMethods, String[] allowedHeaders, boolean allowCredentials) {
            this.allowedOrigins = allowedOrigins;
            this.allowedMethods = allowedMethods;
            this.allowedHeaders = allowedHeaders;
            this.allowCredentials = allowCredentials;
        }

        public String[] getAllowedOrigins() {
            return allowedOrigins;
        }

        public String[] getAllowedMethods() {
            return allowedMethods;
        }

        public String[] getAllowedHeaders() {
            return allowedHeaders;
        }

        public boolean isAllowCredentials() {
            return allowCredentials;
        }
    }
}