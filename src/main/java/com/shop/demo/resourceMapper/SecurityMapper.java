package com.shop.demo.resourceMapper;

import com.shop.demo.propertiesReader.SecurityProperties;


public class SecurityMapper {
    private final SecurityProperties securityProperties;

    public SecurityMapper(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    // CORS Configuration
    public String[] getCorsAllowedOrigins() {
        return securityProperties.getCorsAllowedOrigins();
    }

    public String[] getCorsAllowedMethods() {
        return securityProperties.getCorsAllowedMethods();
    }

    public String[] getCorsAllowedHeaders() {
        return securityProperties.getCorsAllowedHeaders();
    }

    public boolean isCorsAllowCredentials() {
        return securityProperties.isCorsAllowCredentials();
    }

    // JWT Configuration
    public String getJwtSecretKeyPath() {
        return securityProperties.getJwtSecretKeyPath();
    }

    public String getJwtSecretKeyRotation() {
        return securityProperties.getJwtSecretKeyRotation();
    }

    public long getJwtTokenExpirationMs() {
        return securityProperties.getJwtTokenExpirationMs();
    }

    public long getJwtRefreshTokenExpirationMs() {
        return securityProperties.getJwtRefreshTokenExpirationMs();
    }

    // Security Headers Configuration
    public String getContentSecurityPolicy() {
        return securityProperties.getContentSecurityPolicy();
    }

    public String getStrictTransportSecurity() {
        return securityProperties.getStrictTransportSecurity();
    }

    public String getXFrameOptions() {
        return securityProperties.getXFrameOptions();
    }

    public String getXContentTypeOptions() {
        return securityProperties.getXContentTypeOptions();
    }

    public String getXXssProtection() {
        return securityProperties.getXXssProtection();
    }

    public String getCacheControl() {
        return securityProperties.getCacheControl();
    }

    public String getReferrerPolicy() {
        return securityProperties.getReferrerPolicy();
    }

    public String getSetCookie() {
        return securityProperties.getSetCookie();
    }

    // Encryption Key File
    public String getEncryptionKeyFile() {
        return securityProperties.getEncryptionKeyFile();
    }

    // Utility: Print all security configurations (for debugging)
    public void printSecuritySettings() {
        System.out.println("Encryption Key File: " + getEncryptionKeyFile());
        System.out.println("CORS Allowed Origins: " + String.join(", ", getCorsAllowedOrigins()));
        System.out.println("CORS Allowed Methods: " + String.join(", ", getCorsAllowedMethods()));
        System.out.println("CORS Allowed Headers: " + String.join(", ", getCorsAllowedHeaders()));
        System.out.println("CORS Allow Credentials: " + isCorsAllowCredentials());
        System.out.println("JWT Secret Key Path: " + getJwtSecretKeyPath());
        System.out.println("JWT Secret Key Rotation: " + getJwtSecretKeyRotation());
        System.out.println("JWT Token Expiration (ms): " + getJwtTokenExpirationMs());
        System.out.println("JWT Refresh Token Expiration (ms): " + getJwtRefreshTokenExpirationMs());
        System.out.println("Content Security Policy: " + getContentSecurityPolicy());
        System.out.println("Strict Transport Security: " + getStrictTransportSecurity());
        System.out.println("X-Frame-Options: " + getXFrameOptions());
        System.out.println("X-Content-Type-Options: " + getXContentTypeOptions());
        System.out.println("X-XSS-Protection: " + getXXssProtection());
        System.out.println("Cache-Control: " + getCacheControl());
        System.out.println("Referrer-Policy: " + getReferrerPolicy());
        System.out.println("Set-Cookie: " + getSetCookie());
    }
}