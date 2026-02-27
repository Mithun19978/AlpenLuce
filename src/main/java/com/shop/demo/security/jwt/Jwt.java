package com.shop.demo.security.jwt;


public class Jwt {
    private String secretKeyPath;
    private String secretKeyRotation;
    private long tokenExpirationMs;
    private long refreshTokenExpirationMs;

    public String getSecretKeyPath() {
        return secretKeyPath;
    }

    public void setSecretKeyPath(String secretKeyPath) {
        this.secretKeyPath = secretKeyPath; // Fixed: Changed 'secrets' to 'secretKeyPath'
    }

    public String getSecretKeyRotation() {
        return secretKeyRotation;
    }

    public void setSecretKeyRotation(String secretKeyRotation) {
        this.secretKeyRotation = secretKeyRotation;
    }

    public long getTokenExpirationMs() {
        return tokenExpirationMs;
    }

    public void setTokenExpirationMs(long tokenExpirationMs) {
        this.tokenExpirationMs = tokenExpirationMs;
    }

    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpirationMs;
    }

    public void setRefreshTokenExpirationMs(long refreshTokenExpirationMs) {
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }
}