package com.shop.demo.resourceMapper;

import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.propertiesReader.ApplicationProperties;

public class ApplicationMapper {
    private final ApplicationProperties applicationProperties;
    private final ApplicationLogger logger;

    public ApplicationMapper(ApplicationProperties applicationProperties, ApplicationLogger logger) {
        if (applicationProperties == null) {
            throw new IllegalArgumentException("ApplicationProperties cannot be null");
        }
        this.applicationProperties = applicationProperties;
        this.logger = logger;
    }

    // General
    public String getAppName() {
        return applicationProperties.getAppName();
    }

    public String getAppVersion() {
        return applicationProperties.getAppVersion();
    }

    public String getAppBaseUrl() {
        return applicationProperties.getAppBaseUrl();
    }

    // Super Admin
    public String getSupremeUserName() {
        return applicationProperties.getSupremeUserName();
    }

    public String getSupremeUserPassword() {
        return applicationProperties.getSupremeUserPassword();
    }

    public String getSupremeUserMobileNumber() {
        return applicationProperties.getSupremeUserMobileNumber();
    }

    public String getSupremeUserMail() {
        return applicationProperties.getSupremeUserMail();
    }

    public int getSupremeUserGender() {
        return applicationProperties.getSupremeUserGender();
    }

    public int getSupremeUserRole() {
        return applicationProperties.getSupremeUserRole();
    }

    // Roles & Genders
    public String[] getAllowedRoles() {
        return applicationProperties.getAllowedRoles().stream()
                .map(String::valueOf)
                .toArray(String[]::new);
    }

    public String[] getAllowedGenders() {
        return applicationProperties.getAllowedGenders().stream()
                .map(String::valueOf)
                .toArray(String[]::new);
    }

    // Password Policy
    public int getPasswordMinLength() {
        return applicationProperties.getPasswordMinLength();
    }

    public int getPasswordMinNumbers() {
        return applicationProperties.getPasswordMinNumbers();
    }

    public int getPasswordMinUpper() {
        return applicationProperties.getPasswordMinUpper();
    }

    public int getPasswordMinLower() {
        return applicationProperties.getPasswordMinLower();
    }

    public int getPasswordMinAlphabets() {
        return applicationProperties.getPasswordMinAlphabets();
    }

    public int getPasswordMinSpecialChars() {
        return applicationProperties.getPasswordMinSpecialChars();
    }

    public String getPasswordAllowedSpecialChars() {
        return applicationProperties.getPasswordAllowedSpecialChars();
    }

    // Mail
    public String getMailHost() {
        return applicationProperties.getMailHost();
    }

    public int getMailPort() {
        return applicationProperties.getMailPort();
    }

    public String getMailUsername() {
        return applicationProperties.getMailUsername();
    }

    public String getMailPassword() {
        return applicationProperties.getMailPassword();
    }

    public boolean isMailAuthEnabled() {
        return applicationProperties.isMailAuthEnabled();
    }

    public boolean isMailStarttlsEnabled() {
        return applicationProperties.isMailStarttlsEnabled();
    }

    // File Upload
    public String getMaxFileSize() {
        return applicationProperties.getMaxFileSize();
    }

    public String getMaxRequestSize() {
        return applicationProperties.getMaxRequestSize();
    }

    // Utility: Log all application settings
    public void logApplicationSettings() {
        logger.info("Application Settings:");
        logger.info("Application Name: {}", getAppName());
        logger.info("Application Version: {}", getAppVersion());
        logger.info("Application Base URL: {}", getAppBaseUrl());
        logger.info("Supreme User Name: {}", getSupremeUserName());
        logger.info("Supreme User Mobile Number: {}", getSupremeUserMobileNumber());
        logger.info("Supreme User Mail: {}", getSupremeUserMail());
        logger.info("Supreme User Gender: {}", getSupremeUserGender());
        logger.info("Supreme User Role: {}", getSupremeUserRole());
        logger.info("Allowed Roles: {}", String.join(", ", getAllowedRoles()));
        logger.info("Allowed Genders: {}", String.join(", ", getAllowedGenders()));
        logger.info("Password Minimum Length: {}", getPasswordMinLength());
        logger.info("Password Minimum Numbers: {}", getPasswordMinNumbers());
        logger.info("Password Minimum Uppercase: {}", getPasswordMinUpper());
        logger.info("Password Minimum Lowercase: {}", getPasswordMinLower());
        logger.info("Password Minimum Alphabets: {}", getPasswordMinAlphabets());
        logger.info("Password Minimum Special Characters: {}", getPasswordMinSpecialChars());
        logger.info("Password Allowed Special Characters: {}", getPasswordAllowedSpecialChars());
        logger.info("Mail Host: {}", getMailHost());
        logger.info("Mail Port: {}", getMailPort());
        logger.info("Mail Username: {}", getMailUsername());
        logger.info("Mail SMTP Auth Enabled: {}", isMailAuthEnabled());
        logger.info("Mail StartTLS Enabled: {}", isMailStarttlsEnabled());
        logger.info("Max File Size: {}", getMaxFileSize());
        logger.info("Max Request Size: {}", getMaxRequestSize());
    }
}