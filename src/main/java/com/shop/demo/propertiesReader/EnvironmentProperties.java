package com.shop.demo.propertiesReader;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class EnvironmentProperties {
    private final Properties properties = new Properties();
    private String protocol;
    private String port;

    public EnvironmentProperties() {
        String basePath = System.getenv("SHOP_HOME");
        if (basePath == null || basePath.isEmpty()) {
            throw new RuntimeException("SHOP_HOME environment variable is not set");
        }

        String configPath = basePath + "/config/environment.properties";

        try (FileInputStream input = new FileInputStream(configPath)) {
            properties.load(input);
            parseServerConfiguration();
        } catch (IOException e) {
            throw new RuntimeException("Failed to load environment.properties from " + configPath, e);
        }
    }


    private void parseServerConfiguration() {
        String serverConfig = getServerConfiguration();
        if (serverConfig != null) {
            serverConfig = serverConfig.trim();
            if (serverConfig.startsWith("[") && serverConfig.endsWith("]")) {
                serverConfig = serverConfig.substring(1, serverConfig.length() - 1);
                String[] parts = serverConfig.split(",");
                for (String part : parts) {
                    if (part.contains("\"protocol\"")) {
                        protocol = part.split(":")[1].replace("\"", "").trim();
                    } else if (part.contains("\"port\"")) {
                        port = part.split(":")[1].replace("\"", "").trim();
                    }
                }
            }
        }
    }

    public String getProtocol() {
        return protocol != null ? protocol : "http";
    }

    public String getPort() {
        return port != null ? port : "8080";
    }

    public String get(String key) {
        return properties.getProperty(key);
    }

    public String get(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public SecurityProperties getSecurity() {
        return new SecurityProperties();
    }

    public String getServerConfiguration() {
        return get("server-configuration");
    }

    public String getServiceConfiguration() {
        return get("service-configuration");
    }

    public String getSpringMainBannerMode() {
        return get("spring.main.banner-mode");
    }

    public boolean isEncryptionEnabled() {
        return Boolean.parseBoolean(get("must-encrypt"));
    }

    public void init() {
        // Initialization logic if needed
    }
}