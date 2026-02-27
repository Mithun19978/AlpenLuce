package com.shop.demo.resourceMapper;

import com.shop.demo.logMaintain.DatabaseLogger;
import com.shop.demo.propertiesReader.DatabaseProperties;

import java.util.Properties;

public class DatabaseMapper {

    private final DatabaseProperties.DbProperties project = new DatabaseProperties.DbProperties();
    private final DatabaseLogger logger;
    private boolean isMapped = false;
    private long sessionTimeoutMillis;
    private long sessionCleanupInterval;

    public DatabaseMapper(DatabaseLogger logger) {
        if (logger == null) {
            throw new IllegalArgumentException("DatabaseLogger cannot be null");
        }
        this.logger = logger;
    }

    public void map(Properties props) {
        if (props == null) {
            logger.logError("Properties cannot be null", null);
            throw new IllegalArgumentException("Properties cannot be null");
        }

        // Project DB
        project.setJdbcUrl(props.getProperty("datasource.project.jdbc-url"));
        project.setUsername(props.getProperty("datasource.project.username"));
        project.setPassword(props.getProperty("datasource.project.password"));
        project.setDriverClassName(props.getProperty("datasource.project.driver-class-name"));
        project.setMaximumPoolSize(parseInt(props.getProperty("datasource.project.maximum-pool-size"), 15, "Project maximum-pool-size"));
        project.setMinimumIdle(parseInt(props.getProperty("datasource.project.minimum-idle"), 5, "Project minimum-idle"));
        project.setHibernateHbm2ddlAuto(props.getProperty("datasource.project.hibernate.hbm2ddl-auto"));
        project.setHibernateDialect(props.getProperty("datasource.project.hibernate.dialect"));
        project.setTableSqlPath(props.getProperty("datasource.project.table-sql-path"));
        project.setDataSqlPath(props.getProperty("datasource.project.data-sql-path"));

       
        // Session Config
        String timeout = props.getProperty("spring.session.timeout", "1800s");
        sessionTimeoutMillis = parseLong(timeout.replace("s", ""), 1800000L, "spring.session.timeout");
        sessionCleanupInterval = parseLong(props.getProperty("session.cleanup.interval", "60000"), 60000L, "session.cleanup.interval");

        logger.logInfo("Successfully mapped database properties");
        validateProperties();
        isMapped = true;
    }

    private int parseInt(String value, int defaultValue, String propertyName) {
        if (value == null || value.trim().isEmpty()) {
            logger.logWarn(propertyName + " not specified, using default: " + defaultValue);
            return defaultValue;
        }
        try {
            int result = Integer.parseInt(value);
            if (result <= 0) {
                logger.logWarn(propertyName + " is invalid (" + value + "), using default: " + defaultValue);
                return defaultValue;
            }
            return result;
        } catch (NumberFormatException e) {
            logger.logWarn(propertyName + " is not a valid number (" + value + "), using default: " + defaultValue);
            return defaultValue;
        }
    }

    private long parseLong(String value, long defaultValue, String propertyName) {
        if (value == null || value.trim().isEmpty()) {
            logger.logWarn(propertyName + " not specified, using default: " + defaultValue);
            return defaultValue;
        }
        try {
            long result = Long.parseLong(value);
            if (result <= 0) {
                logger.logWarn(propertyName + " is invalid (" + value + "), using default: " + defaultValue);
                return defaultValue;
            }
            return result;
        } catch (NumberFormatException e) {
            logger.logWarn(propertyName + " is not a valid number (" + value + "), using default: " + defaultValue);
            return defaultValue;
        }
    }

    private void validateProperties() {


        // Validate Project
        if (project.getJdbcUrl() == null || project.getJdbcUrl().trim().isEmpty()) {
            throw new IllegalStateException("Project JDBC URL is missing");
        }
        if (project.getUsername() == null || project.getUsername().trim().isEmpty()) {
            throw new IllegalStateException("Project username is missing");
        }
        if (project.getDriverClassName() == null || project.getDriverClassName().trim().isEmpty()) {
            throw new IllegalStateException("Project driver class name is missing");
        }
    }

    public DatabaseProperties.DbProperties getProject() {
        if (!isMapped) {
            logger.logError("Database properties not mapped. Call map() first.", null);
            throw new IllegalStateException("Database properties not mapped");
        }
        return project;
    }


    public long getSessionTimeoutMillis() {
        if (!isMapped) {
            logger.logError("Database properties not mapped. Call map() first.", null);
            throw new IllegalStateException("Database properties not mapped");
        }
        return sessionTimeoutMillis;
    }

    public long getSessionCleanupInterval() {
        if (!isMapped) {
            logger.logError("Database properties not mapped. Call map() first.", null);
            throw new IllegalStateException("Database properties not mapped");
        }
        return sessionCleanupInterval;
    }
}