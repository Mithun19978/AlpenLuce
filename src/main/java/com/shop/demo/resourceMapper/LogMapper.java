package com.shop.demo.resourceMapper;

import com.shop.demo.propertiesReader.LogProperties;
import org.springframework.stereotype.Component;

@Component
public class LogMapper {
    private final LogProperties logProperties;

    public LogMapper(LogProperties logProperties) {
        this.logProperties = logProperties;
    }

    public String getLogConfig() {
        return logProperties.getLogConfig();
    }

    public String getRootLogLevel() {
        return logProperties.getRootLogLevel();
    }

    public String getSpringLogLevel() {
        return logProperties.getSpringLogLevel();
    }

    public String getHibernateSqlLogLevel() {
        return logProperties.getHibernateSqlLogLevel();
    }

    public String getJpaLogLevel() {
        return logProperties.getJpaLogLevel();
    }

    public String getMysocksLogLevel() {
        return logProperties.getMysocksLogLevel();
    }

    public String getLogFilePath() {
        return logProperties.getFilePath();
    }

    public String getLogFilePattern() {
        return logProperties.getFilePattern();
    }

    public String getMaxLogFileSize() {
        return logProperties.getMaxFileSize();
    }

    public String getTotalLogSizeCap() {
        return logProperties.getTotalSizeCap();
    }

    public String getApplicationLogFile() {
        return logProperties.getApplicationLogFile();
    }

    public String getApplicationExceptionLogFile() {
        return logProperties.getApplicationExceptionLogFile();
    }

    public String getDatabaseLogFile() {
        return logProperties.getDatabaseLogFile();
    }

    public String getDatabaseExceptionLogFile() {
        return logProperties.getDatabaseExceptionLogFile();
    }

    public String getFilterLogFile() {
        return logProperties.getFilterLogFile();
    }

    public String getFilterExceptionLogFile() {
        return logProperties.getFilterExceptionLogFile();
    }

    public String getHttpLogFile() {
        return logProperties.getHttpLogFile();
    }

    public String getHttpExceptionLogFile() {
        return logProperties.getHttpExceptionLogFile();
    }

    public String getSessionLogFile() {
        return logProperties.getSessionLogFile();
    }

    public String getSessionExceptionLogFile() {
        return logProperties.getSessionExceptionLogFile();
    }

    public void printLogSettings() {
        System.out.println("Log Config: " + getLogConfig());
        System.out.println("Root Log Level: " + getRootLogLevel());
        System.out.println("Spring Log Level: " + getSpringLogLevel());
        System.out.println("Hibernate SQL Log Level: " + getHibernateSqlLogLevel());
        System.out.println("JPA Log Level: " + getJpaLogLevel());
        System.out.println("Mysocks Log Level: " + getMysocksLogLevel());
        System.out.println("Log File Path: " + getLogFilePath());
        System.out.println("Log File Pattern: " + getLogFilePattern());
        System.out.println("Max File Size: " + getMaxLogFileSize());
        System.out.println("Total Size Cap: " + getTotalLogSizeCap());
        System.out.println("Application Log File: " + getApplicationLogFile());
        System.out.println("Application Exception Log File: " + getApplicationExceptionLogFile());
        System.out.println("Database Log File: " + getDatabaseLogFile());
        System.out.println("Database Exception Log File: " + getDatabaseExceptionLogFile());
        System.out.println("Filter Log File: " + getFilterLogFile());
        System.out.println("Filter Exception Log File: " + getFilterExceptionLogFile());
        System.out.println("SSL Log File: " + getHttpLogFile());
        System.out.println("SSL Exception Log File: " + getHttpExceptionLogFile());
        System.out.println("Session Log File: " + getSessionLogFile());
        System.out.println("Session Exception Log File: " + getSessionExceptionLogFile());
    }
}