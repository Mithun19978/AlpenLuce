package com.shop.demo.propertiesReader;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ServerSSLProperties {
    private final Properties properties = new Properties();
    private boolean sslEnabled;

    public ServerSSLProperties(EnvironmentProperties environmentProperties) {
        loadProperties();
        // Override sslEnabled based on protocol
        this.sslEnabled = "https".equalsIgnoreCase(environmentProperties.getProtocol());
        // Resolve ${MYSOCKS_HOME} in properties
        resolvePlaceholders();
    }

    private void loadProperties() {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("config/server-ssl.properties")) {
            if (input == null) {
                throw new RuntimeException("server-ssl.properties file not found in classpath");
            }
            properties.load(input);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load server-ssl.properties", e);
        }
    }

    private void resolvePlaceholders() {
        String keyStore = properties.getProperty("server.ssl.key-store");
        if (keyStore != null && keyStore.contains("${SHOP_HOME}")) {
            String mysocksHome = System.getenv("SHOP_HOME");
            if (mysocksHome != null) {
                keyStore = keyStore.replace("${SHOP_HOME}", mysocksHome);
                properties.setProperty("server.ssl.key-store", keyStore);
            } else {
                throw new RuntimeException("SHOP_HOME environment variable is not set");
            }
        }
    }

    public boolean isSslEnabled() {
        return sslEnabled;
    }

    public String getKeyStore() {
        return properties.getProperty("server.ssl.key-store");
    }

    public String getKeyStoreType() {
        return properties.getProperty("server.ssl.key-store-type", "PKCS12");
    }

    public String getKeyStorePassword() {
        return properties.getProperty("server.ssl.key-store-password");
    }

    public String getKeyAlias() {
        return properties.getProperty("server.ssl.key-alias");
    }

    public Properties getProperties() {
        return properties;
    }
}