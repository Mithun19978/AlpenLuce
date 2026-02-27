package com.shop.demo.resourceMapper;

import com.shop.demo.propertiesReader.EnvironmentProperties;

public class EnvironmentMapper {

    private final EnvironmentProperties environmentProperties;

    public EnvironmentMapper() {
        this.environmentProperties = new EnvironmentProperties();
    }

    public void mapEnvironmentProperties() {
        // Mapping environment properties to variables or performing further actions
        boolean encryptionEnabled = environmentProperties.isEncryptionEnabled();
        String serverConfiguration = environmentProperties.getServerConfiguration();
        String serviceConfiguration = environmentProperties.getServiceConfiguration();
        String springBannerMode = environmentProperties.getSpringMainBannerMode();

        // Example logic: Print out or use these mapped properties
        System.out.println("Encryption Enabled: " + encryptionEnabled);
        System.out.println("Server Configuration: " + serverConfiguration);
        System.out.println("Service Configuration: " + serviceConfiguration);
        System.out.println("Spring Banner Mode: " + springBannerMode);
    }
}