package com.shop.demo.propertiesReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

public class DatabaseProperties {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseProperties.class);
    private final ConcurrentHashMap<String, String> properties = new ConcurrentHashMap<>();
    private static final String PROPERTIES_FILE = System.getenv("SHOP_HOME") + "/config/database.properties";  // Using the environment variable

    public DatabaseProperties() {
        loadPropertiesFromFile();
        init();
    }

    private void loadPropertiesFromFile() {
        FileSystemResource resource = new FileSystemResource(PROPERTIES_FILE);
        if (!resource.exists()) {
            logger.error("Database properties file not found: {}", PROPERTIES_FILE);
            throw new IllegalStateException("Database properties file not found: " + PROPERTIES_FILE);
        }

        Properties props = new Properties();
        try (FileInputStream fileInputStream = new FileInputStream(PROPERTIES_FILE)) {
            props.load(fileInputStream);
            loadProperties(props);
            logger.info("Successfully loaded properties from: {}", PROPERTIES_FILE);
        } catch (IOException e) {
            logger.error("Failed to load database properties from: {}", PROPERTIES_FILE, e);
            throw new RuntimeException("Failed to load database properties", e);
        }
    }

    public void loadProperties(Properties props) {
        if (props != null) {
            props.forEach((k, v) -> properties.put(k.toString(), v.toString()));
        }
    }

    public void init() {
        validateProperties();
    }

    private void validateProperties() {
        // Validate JDBC properties


        if (getProjectJdbcUrl() == null || getProjectJdbcUrl().trim().isEmpty()) {
            throw new IllegalStateException("Project JDBC URL is missing");
        }
        if (getProjectUsername() == null || getProjectUsername().trim().isEmpty()) {
            throw new IllegalStateException("Project username is missing");
        }
        if (getProjectDriverClassName() == null || getProjectDriverClassName().trim().isEmpty()) {
            throw new IllegalStateException("Project driver class name is missing");
        }

        // Validate SQL file paths
        String[] sqlPaths = {
            getProjectTableSqlPath(),
            getProjectDataSqlPath()
        };
        for (String path : sqlPaths) {
            if (path == null || path.trim().isEmpty()) {
                logger.error("SQL file path is null or empty: {}", path);
                throw new IllegalStateException("SQL file path is null or empty: " + path);
            }
            File file = new File(path);
            if (!file.exists() || !file.canRead()) {
                logger.error("SQL file does not exist or is not readable: {}", path);
                throw new IllegalStateException("SQL file does not exist or is not readable: " + path);
            }
        }
        logger.info("All SQL file paths validated successfully");
    }

    // --- Session Config ---
    public String getSessionStoreType() {
        return properties.get("spring.session.store-type");
    }

    public long getSessionTimeoutMillis() {
        String timeout = properties.getOrDefault("spring.session.timeout", "1800s");
        try {
            long timeoutValue = Long.parseLong(timeout.replace("s", ""));
            if (timeoutValue <= 0) {
                logger.warn("spring.session.timeout is invalid ({}), using default: 1800000ms", timeout);
                return 1800000L; // Default 30 minutes in milliseconds
            }
            return timeoutValue * 1000; // Convert seconds to milliseconds
        } catch (NumberFormatException e) {
            logger.warn("spring.session.timeout is not a valid number ({}), using default: 1800000ms", timeout);
            return 1800000L; // Default 30 minutes in milliseconds
        }
    }

    public long getSessionCleanupInterval() {
        String value = properties.getOrDefault("session.cleanup.interval", "60000");
        try {
            long result = Long.parseLong(value);
            if (result <= 0) {
                logger.warn("session.cleanup.interval is invalid ({}), using default: 60000", value);
                return 60000L;
            }
            return result;
        } catch (NumberFormatException e) {
            logger.warn("session.cleanup.interval is not a valid number ({}), using default: 60000", value);
            return 60000L;
        }
    }



    // --- Project DB ---
    public String getProjectJdbcUrl() {
        return properties.get("datasource.project.jdbc-url");
    }

    public String getProjectUsername() {
        return properties.get("datasource.project.username");
    }

    public String getProjectPassword() {
        return properties.get("datasource.project.password");
    }

    public String getProjectDriverClassName() {
        return properties.get("datasource.project.driver-class-name");
    }

    public int getProjectMaxPoolSize() {
        return Integer.parseInt(properties.getOrDefault("datasource.project.maximum-pool-size", "15"));
    }

    public int getProjectMinIdle() {
        return Integer.parseInt(properties.getOrDefault("datasource.project.minimum-idle", "5"));
    }

    public String getProjectHbm2ddlAuto() {
        return properties.get("datasource.project.hibernate.hbm2ddl-auto");
    }

    public String getProjectDialect() {
        return properties.get("datasource.project.hibernate.dialect");
    }

    public String getProjectTableSqlPath() {
        return properties.get("datasource.project.table-sql-path");
    }

    public String getProjectDataSqlPath() {
        return properties.get("datasource.project.data-sql-path");
    }

    // --- JPA Config ---
    public boolean isJpaOpenInView() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.open-in-view", "false"));
    }

    public boolean isJpaDeferInitialization() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.defer-datasource-initialization", "true"));
    }

    public String getJpaDdlAuto() {
        return properties.get("spring.jpa.hibernate.ddl-auto");
    }

    public String getJpaDialect() {
        return properties.get("spring.jpa.properties.hibernate-dialect");
    }

    public boolean isLazyLoadEnabled() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.enable-lazy-load-no-trans", "true"));
    }

    public boolean isFormatSql() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.format-sql", "true"));
    }

    public boolean isDiscriminatorIgnoreExplicitForJoined() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.discriminator-ignore-explicit-for-joined", "true"));
    }

    public int getJpaBatchSize() {
        return Integer.parseInt(properties.getOrDefault("spring.jpa.properties.jdbc-batch-size", "50"));
    }

    public boolean isOrderInserts() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.order-inserts", "true"));
    }

    public boolean isOrderUpdates() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.order-updates", "true"));
    }

    public boolean isSecondLevelCacheEnabled() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.cache-use-second-level-cache", "false"));
    }

    public boolean isQueryCacheEnabled() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.cache-use-query-cache", "false"));
    }

    public boolean isGenerateStatistics() {
        return Boolean.parseBoolean(properties.getOrDefault("spring.jpa.properties.generate-statistics", "false"));
    }

    public String get(String key) {
        return properties.get(key);
    }

 // Add this to DatabaseProperties.java (only this line)
    public boolean isProjectExecutionEnabled() {
        return Boolean.parseBoolean(properties.getOrDefault("datasource.project.execution", "true"));
    }
    
    
    
    public ConcurrentHashMap<String, String> getProperties() {
        return new ConcurrentHashMap<>(properties);
    }

    public static class DbProperties {
        private String jdbcUrl;
        private String username;
        private String password;
        private String driverClassName;
        private int maximumPoolSize;
        private int minimumIdle;
        private String hibernateHbm2ddlAuto;
        private String hibernateDialect;
        private String tableSqlPath;
        private String dataSqlPath;

        public String getJdbcUrl() { return jdbcUrl; }
        public void setJdbcUrl(String jdbcUrl) { this.jdbcUrl = jdbcUrl; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getDriverClassName() { return driverClassName; }
        public void setDriverClassName(String driverClassName) { this.driverClassName = driverClassName; }
        public int getMaximumPoolSize() { return maximumPoolSize; }
        public void setMaximumPoolSize(int maximumPoolSize) { this.maximumPoolSize = maximumPoolSize; }
        public int getMinimumIdle() { return minimumIdle; }
        public void setMinimumIdle(int minimumIdle) { this.minimumIdle = minimumIdle; }
        public String getHibernateHbm2ddlAuto() { return hibernateHbm2ddlAuto; }
        public void setHibernateHbm2ddlAuto(String hibernateHbm2ddlAuto) { this.hibernateHbm2ddlAuto = hibernateHbm2ddlAuto; }
        public String getHibernateDialect() { return hibernateDialect; }
        public void setHibernateDialect(String hibernateDialect) { this.hibernateDialect = hibernateDialect; }
        public String getTableSqlPath() { return tableSqlPath; }
        public void setTableSqlPath(String tableSqlPath) { this.tableSqlPath = tableSqlPath; }
        public String getDataSqlPath() { return dataSqlPath; }
        public void setDataSqlPath(String dataSqlPath) { this.dataSqlPath = dataSqlPath; }
    }
}