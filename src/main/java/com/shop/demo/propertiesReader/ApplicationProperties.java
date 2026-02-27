package com.shop.demo.propertiesReader;

import com.shop.demo.logMaintain.ApplicationLogger;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

public class ApplicationProperties {
    private final Properties properties = new Properties();
    private final ApplicationLogger logger;
    private List<Integer> allowedRoles;
    private List<Integer> allowedGenders;

    public ApplicationProperties(ApplicationLogger logger) {
        this.logger = logger;
        loadPropertiesFromFile();
    }

    private void loadPropertiesFromFile() {
        String filePath = System.getenv("SHOP_HOME") != null 
            ? System.getenv("SHOP_HOME") + "/config/application.properties"
            : "D:/devops/mysocks/config/application.properties";
        logger.info("[APP-INFO] Attempting to load properties from: {}", filePath);
        try (FileInputStream fis = new FileInputStream(filePath)) {
            Properties tempProps = new Properties();
            tempProps.load(fis);
            logger.info("[APP-INFO] Successfully loaded properties from: {}", filePath);
            logger.debug("[APP-DEBUG] Raw loaded properties: {}", tempProps);
            loadProperties(tempProps);
        } catch (IOException e) {
            logger.error("[APP-ERROR] Failed to load application.properties from {}: {}", filePath, e.getMessage(), e);
            throw new RuntimeException("Failed to load application.properties", e);
        }
    }

    public void loadProperties(Properties props) {
        logger.debug("[APP-DEBUG] Input properties: {}", props);
        properties.putAll(props); // Avoid clearing to preserve any existing properties
        logger.debug("[APP-DEBUG] Properties after merging: {}", properties);
        if (properties.isEmpty()) {
            logger.error("[APP-ERROR] Properties are empty after loading");
            throw new IllegalStateException("Properties are empty after loading");
        }
        this.allowedRoles = loadAllowedRoles();
        this.allowedGenders = loadAllowedGenders();
    }

    public String get(String key) {
        return properties.getProperty(key);
    }

    private String getRequiredProperty(String key, String propertyName) {
        String value = properties.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            logger.error("[APP-ERROR] Required property {} is missing or empty. Current properties: {}", propertyName, properties);
            throw new IllegalStateException("Required property " + propertyName + " is missing or empty");
        }
        logger.debug("[APP-DEBUG] Retrieved property {}: {}", propertyName, value);
        return value;
    }

    // General
    public String getAppName() {
        return getApplication().getName();
    }

    public String getAppVersion() {
        return getApplication().getVersion();
    }

    public String getAppBaseUrl() {
        return getApplication().getBaseUrl();
    }

    public Application getApplication() {
        return new Application(
            getRequiredProperty("application.name", "application.name"),
            getRequiredProperty("application.version", "application.version"),
            getRequiredProperty("application.base-url", "application.base-url")
        );
    }

    public static class Application {
        private final String name;
        private final String version;
        private final String baseUrl;

        public Application(String name, String version, String baseUrl) {
            this.name = name;
            this.version = version;
            this.baseUrl = baseUrl;
        }

        public String getName() { return name; }
        public String getVersion() { return version; }
        public String getBaseUrl() { return baseUrl; }
    }

    // Super Admin
    public String getSupremeUserName() {
        return getSupremeUser().getName();
    }

    public String getSupremeUserPassword() {
        return getSupremeUser().getPassword();
    }

    public String getSupremeUserMobileNumber() {
        return getSupremeUser().getMobileNumber();
    }

    public String getSupremeUserMail() {
        return getSupremeUser().getMail();
    }

    public int getSupremeUserGender() {
        return getSupremeUser().getGender();
    }

    public int getSupremeUserRole() {
        return getSupremeUser().getRole();
    }

    public SupremeUser getSupremeUser() {
        String name = getRequiredProperty("supreme-user.name", "supreme-user.name");
        String password = System.getenv("SUPREME_USER_PASSWORD");
        logger.debug("[APP-DEBUG] Environment SUPREME_USER_PASSWORD: {}", password);
        if (password == null || password.trim().isEmpty()) {
            password = getRequiredProperty("supreme-user.password", "supreme-user.password");
            logger.debug("[APP-DEBUG] Loaded supreme-user.password from properties: {}", password);
        } else {
            logger.debug("[APP-DEBUG] Using SUPREME_USER_PASSWORD from environment");
        }
        String mobileNumber = getRequiredProperty("supreme-user.mobilenumber", "supreme-user.mobilenumber");
        String mail = getRequiredProperty("supreme-user.mail", "supreme-user.mail");
        String genderStr = getRequiredProperty("supreme-user.gender", "supreme-user.gender");
        String roleStr = getRequiredProperty("supreme-user.role", "supreme-user.role");
        int gender = parseIntSafely(genderStr, "supreme-user.gender");
        int role = parseIntSafely(roleStr, "supreme-user.role");
        return new SupremeUser(name, password, mobileNumber, mail, gender, role);
    }

    private int parseIntSafely(String value, String propertyName) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            logger.error("[APP-ERROR] Invalid integer format for property {}: {}", propertyName, value, e);
            throw new IllegalStateException("Invalid integer format for property " + propertyName + ": " + value, e);
        }
    }

    public static class SupremeUser {
        private final String name;
        private final String password;
        private final String mobileNumber;
        private final String mail;
        private final int gender;
        private final int role;

        public SupremeUser(String name, String password, String mobileNumber, String mail, int gender, int role) {
            this.name = name;
            this.password = password;
            this.mobileNumber = mobileNumber;
            this.mail = mail;
            this.gender = gender;
            this.role = role;
        }

        public String getName() { return name; }
        public String getPassword() { return password; }
        public String getMobileNumber() { return mobileNumber; }
        public String getMail() { return mail; }
        public int getGender() { return gender; }
        public int getRole() { return role; }
    }

    // Roles & Genders
    private List<Integer> loadAllowedRoles() {
        String roles = getRequiredProperty("allowed-roles", "allowed-roles");
        logger.debug("[APP-DEBUG] Loaded allowed-roles: {}", roles);
        return Arrays.stream(roles.split(","))
                .filter(s -> !s.trim().isEmpty())
                .map(s -> parseIntSafely(s, "allowed-roles"))
                .collect(Collectors.toList());
    }

    private List<Integer> loadAllowedGenders() {
        String genders = getRequiredProperty("allowed-genders", "allowed-genders");
        logger.debug("[APP-DEBUG] Loaded allowed-genders: {}", genders);
        return Arrays.stream(genders.split(","))
                .filter(s -> !s.trim().isEmpty())
                .map(s -> parseIntSafely(s, "allowed-genders"))
                .collect(Collectors.toList());
    }

    public List<Integer> getAllowedRoles() {
        return allowedRoles;
    }

    public List<Integer> getAllowedGenders() {
        return allowedGenders;
    }

    // Password Policy
    public int getPasswordMinLength() {
        return getPassword().getMinLength();
    }

    public int getPasswordMinNumbers() {
        return getPassword().getMinNumbers();
    }

    public int getPasswordMinUpper() {
        return getPassword().getMinUpper();
    }

    public int getPasswordMinLower() {
        return getPassword().getMinLower();
    }

    public int getPasswordMinAlphabets() {
        return getPassword().getMinAlphabets();
    }

    public int getPasswordMinSpecialChars() {
        return getPassword().getMinSpecialChars();
    }

    public String getPasswordAllowedSpecialChars() {
        return getPassword().getAllowedSpecialChars();
    }

    public Password getPassword() {
        String minLengthStr = getRequiredProperty("password.minimum-length", "password.minimum-length");
        String minNumbersStr = getRequiredProperty("password.minimum-numbers", "password.minimum-numbers");
        String minUpperStr = getRequiredProperty("password.minimum-upper", "password.minimum-upper");
        String minLowerStr = getRequiredProperty("password.minimum-lower", "password.minimum-lower");
        String minAlphabetsStr = getRequiredProperty("password.minimum-alphabets", "password.minimum-alphabets");
        String minSpecialCharsStr = getRequiredProperty("password.min-special-characters", "password.min-special-characters");
        String allowedSpecialChars = getRequiredProperty("password.allowed-special-characters", "password.allowed-special-characters");
        logger.debug("[APP-DEBUG] Password policy: minLength={}, minNumbers={}, minUpper={}, minLower={}, minAlphabets={}, minSpecialChars={}, allowedSpecialChars={}",
            minLengthStr, minNumbersStr, minUpperStr, minLowerStr, minAlphabetsStr, minSpecialCharsStr, allowedSpecialChars);
        return new Password(
            parseIntSafely(minLengthStr, "password.minimum-length"),
            parseIntSafely(minNumbersStr, "password.minimum-numbers"),
            parseIntSafely(minUpperStr, "password.minimum-upper"),
            parseIntSafely(minLowerStr, "password.minimum-lower"),
            parseIntSafely(minAlphabetsStr, "password.minimum-alphabets"),
            parseIntSafely(minSpecialCharsStr, "password.min-special-characters"),
            allowedSpecialChars
        );
    }

    public static class Password {
        private final int minLength;
        private final int minNumbers;
        private final int minUpper;
        private final int minLower;
        private final int minAlphabets;
        private final int minSpecialChars;
        private final String allowedSpecialChars;

        public Password(int minLength, int minNumbers, int minUpper, int minLower, int minAlphabets, int minSpecialChars, String allowedSpecialChars) {
            this.minLength = minLength;
            this.minNumbers = minNumbers;
            this.minUpper = minUpper;
            this.minLower = minLower;
            this.minAlphabets = minAlphabets;
            this.minSpecialChars = minSpecialChars;
            this.allowedSpecialChars = allowedSpecialChars;
        }

        public int getMinLength() { return minLength; }
        public int getMinNumbers() { return minNumbers; }
        public int getMinUpper() { return minUpper; }
        public int getMinLower() { return minLower; }
        public int getMinAlphabets() { return minAlphabets; }
        public int getMinSpecialChars() { return minSpecialChars; }
        public String getAllowedSpecialChars() { return allowedSpecialChars; }
    }

    // Mail
    public String getMailHost() {
        return getMail().getHost();
    }

    public int getMailPort() {
        return getMail().getPort();
    }

    public String getMailUsername() {
        return getMail().getUsername();
    }

    public String getMailPassword() {
        return getMail().getPassword();
    }

    public boolean isMailAuthEnabled() {
        return getMail().isAuthEnabled();
    }

    public boolean isMailStarttlsEnabled() {
        return getMail().isMailStarttlsEnabled();
    }

    public Mail getMail() {
        String host = getRequiredProperty("mail.host", "mail.host");
        String portStr = getRequiredProperty("mail.port", "mail.port");
        String username = getRequiredProperty("mail.username", "mail.username");
        String password = System.getenv("MAIL_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            password = getRequiredProperty("mail.password", "mail.password");
        }
        String authStr = getRequiredProperty("mail.properties.mail-smtp-auth", "mail.properties.mail-smtp-auth");
        String starttlsStr = getRequiredProperty("mail.properties.mail-smtp-starttls-enable", "mail.properties.mail-smtp-starttls-enable");
        return new Mail(
            host,
            parseIntSafely(portStr, "mail.port"),
            username,
            password,
            Boolean.parseBoolean(authStr),
            Boolean.parseBoolean(starttlsStr)
        );
    }

    public static class Mail {
        private final String host;
        private final int port;
        private final String username;
        private final String password;
        private final Properties properties;

        public Mail(String host, int port, String username, String password, boolean authEnabled, boolean starttlsEnabled) {
            this.host = host;
            this.port = port;
            this.username = username;
            this.password = password;
            this.properties = new Properties();
            this.properties.setProperty("mail-smtp-auth", String.valueOf(authEnabled));
            this.properties.setProperty("mail-smtp-starttls-enable", String.valueOf(starttlsEnabled));
        }

        public String getHost() { return host; }
        public int getPort() { return port; }
        public String getUsername() { return username; }
        public String getPassword() { return password; }
        public boolean isAuthEnabled() { return Boolean.parseBoolean(properties.getProperty("mail-smtp-auth")); }
        public boolean isMailStarttlsEnabled() { return Boolean.parseBoolean(properties.getProperty("mail-smtp-starttls-enable")); }
    }

    public String getMaxFileSize() {
        return getRequiredProperty("max-file-size", "max-file-size");
    }

    public String getMaxRequestSize() {
        return getRequiredProperty("max-request-size", "max-request-size");
    }

    public void init() {
        try {
            Application app = getApplication();
            SupremeUser user = getSupremeUser();
            Mail mail = getMail();
            Password passwordPolicy = getPassword();
            String maxFileSize = getMaxFileSize();
            String maxRequestSize = getMaxRequestSize();
            logger.info("[APP-INFO] ApplicationProperties initialized:");
            logger.info("[APP-INFO] App: name={}, version={}, baseUrl={}", app.getName(), app.getVersion(), app.getBaseUrl());
            logger.info("[APP-INFO] SupremeUser: name={}, password=[HIDDEN], mobileNumber={}, mail={}, gender={}, role={}",
                user.getName(), user.getMobileNumber(), user.getMail(), user.getGender(), user.getRole());
            logger.info("[APP-INFO] Password Policy: minLength={}, minNumbers={}, minUpper={}, minLower={}, minAlphabets={}, minSpecialChars={}, allowedSpecialChars={}",
                passwordPolicy.getMinLength(), passwordPolicy.getMinNumbers(), passwordPolicy.getMinUpper(),
                passwordPolicy.getMinLower(), passwordPolicy.getMinAlphabets(), passwordPolicy.getMinSpecialChars(),
                passwordPolicy.getAllowedSpecialChars());
            logger.info("[APP-INFO] Mail: host={}, port={}, username={}, authEnabled={}, starttlsEnabled={}",
                mail.getHost(), mail.getPort(), mail.getUsername(), mail.isAuthEnabled(), mail.isMailStarttlsEnabled());
            logger.info("[APP-INFO] File Upload: maxFileSize={}, maxRequestSize={}", maxFileSize, maxRequestSize);
            logger.info("[APP-INFO] Allowed Roles: {}", getAllowedRoles());
            logger.info("[APP-INFO] Allowed Genders: {}", getAllowedGenders());
            if (getAllowedRoles().isEmpty()) {
                logger.warn("[APP-WARN] No allowed roles defined in properties");
            }
            if (getAllowedGenders().isEmpty()) {
                logger.warn("[APP-WARN] No allowed genders defined in properties");
            }
            logger.info("[APP-INFO] ApplicationProperties initialized successfully");
        } catch (Exception e) {
            logger.error("[APP-ERROR] Failed to initialize ApplicationProperties: {}", e.getMessage(), e);
            throw e;
        }
    }
}