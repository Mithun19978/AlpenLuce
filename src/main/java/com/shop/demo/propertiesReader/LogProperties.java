package com.shop.demo.propertiesReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LogProperties {
    private static final Logger logger = LoggerFactory.getLogger(LogProperties.class);
    private final ConcurrentHashMap<String, String> properties = new ConcurrentHashMap<>();
    private static final String PROPERTIES_FILE = System.getenv("SHOP_HOME") + "/config/log.properties";

    public LogProperties() {
        loadPropertiesFromFile();
        validateProperties();
    }

    private void loadPropertiesFromFile() {
        FileSystemResource resource = new FileSystemResource(PROPERTIES_FILE);
        if (!resource.exists()) {
            logger.error("Log properties file not found: {}", PROPERTIES_FILE);
            throw new IllegalStateException("Log properties file not found: " + PROPERTIES_FILE);
        }

        Properties props = new Properties();
        try (FileInputStream fileInputStream = new FileInputStream(PROPERTIES_FILE)) {
            props.load(fileInputStream);
            loadProperties(props);
            logger.info("Successfully loaded properties from: {}", PROPERTIES_FILE);
        } catch (IOException e) {
            logger.error("Failed to load log properties from: {}", PROPERTIES_FILE, e);
            throw new RuntimeException("Failed to load log properties", e);
        }
    }

    public void loadProperties(Properties props) {
        if (props != null) {
            props.forEach((k, v) -> properties.put(k.toString(), v.toString()));
        }
    }

    private void validateProperties() {
        String[] requiredProperties = {
            "logging.config",
            "logging.level.root",
            "logging.level.org.springframework",
            "logging.level.org.hibernate.sql",
            "logging.level.org.springframework.orm.jpa",
            "logging.level.com.shop.demo",
            "logging.file.path",
            "logging.pattern.file",
            "logging.file.max-size",
            "logging.file.total-size-cap",
            "logging.file.name.application",
            "logging.file.name.application-exception",
            "logging.file.name.database",
            "logging.file.name.database-exception",
            "logging.file.name.filter",
            "logging.file.name.filter-exception",
            "logging.file.name.http",
            "logging.file.name.http-exception",
            "logging.file.name.session",
            "logging.file.name.session-exception"
        };

        for (String key : requiredProperties) {
            if (!properties.containsKey(key) || properties.get(key).trim().isEmpty()) {
                logger.error("Missing or empty log property: {}", key);
                throw new IllegalStateException("Missing or empty log property: " + key);
            }
        }
        logger.info("All log properties validated successfully");
    }

    public String getLogConfig() {
        return properties.getOrDefault("logging.config", "file:" + System.getenv("SHOP_HOME") + "/config/logback-spring.xml");
    }

    public String getRootLogLevel() {
        return properties.getOrDefault("logging.level.root", "DEBUG");
    }

    public String getSpringLogLevel() {
        return properties.getOrDefault("logging.level.org.springframework", "DEBUG");
    }

    public String getHibernateSqlLogLevel() {
        return properties.getOrDefault("logging.level.org.hibernate.sql", "DEBUG");
    }

    public String getJpaLogLevel() {
        return properties.getOrDefault("logging.level.org.springframework.orm.jpa", "DEBUG");
    }

    public String getMysocksLogLevel() {
        return properties.getOrDefault("logging.level.com.shop.demo", "DEBUG");
    }

    public String getFilePath() {
        return properties.getOrDefault("logging.file.path", System.getenv("SHOP_HOME") + "/logs");
    }

    public String getFilePattern() {
        return properties.getOrDefault("logging.pattern.file", "%d{yyyy-MM-dd HH:mm:ss.SSS} %p %c{1} [%t] %m%n");
    }

    public String getMaxFileSize() {
        return properties.getOrDefault("logging.file.max-size", "10MB");
    }

    public String getTotalSizeCap() {
        return properties.getOrDefault("logging.file.total-size-cap", "100MB");
    }

    public String getApplicationLogFile() {
        return properties.getOrDefault("logging.file.name.application", "application-service.log");
    }

    public String getApplicationExceptionLogFile() {
        return properties.getOrDefault("logging.file.name.application-exception", "application-exception.log");
    }

    public String getDatabaseLogFile() {
        return properties.getOrDefault("logging.file.name.database", "database-service.log");
    }

    public String getDatabaseExceptionLogFile() {
        return properties.getOrDefault("logging.file.name.database-exception", "database-exception.log");
    }

    public String getFilterLogFile() {
        return properties.getOrDefault("logging.file.name.filter", "filter-service.log");
    }

    public String getFilterExceptionLogFile() {
        return properties.getOrDefault("logging.file.name.filter-exception", "filter-exception.log");
    }

    public String getHttpLogFile() {
        return properties.getOrDefault("logging.file.name.http", "SSL-service.log");
    }

    public String getHttpExceptionLogFile() {
        return properties.getOrDefault("logging.file.name.http-exception", "SSL-exception.log");
    }

    public String getSessionLogFile() {
        return properties.getOrDefault("logging.file.name.session", "session-service.log");
    }

    public String getSessionExceptionLogFile() {
        return properties.getOrDefault("logging.file.name.session-exception", "session-exception.log");
    }

    public ConcurrentHashMap<String, String> getProperties() {
        return new ConcurrentHashMap<>(properties);
    }
}