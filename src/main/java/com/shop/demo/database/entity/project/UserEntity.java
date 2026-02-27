package com.shop.demo.database.entity.project;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "active")
    private String active;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "mobile_number", unique = true)
    private String mobileNumber;

    @Column(name = "password")
    private String password;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "gender")
    private Integer gender;

    @Column(name = "role", nullable = false)
    private Integer role;

    @Column(name = "creation_time", nullable = false)
    private LocalDateTime creationTime;

    @Column(name = "valid_till")
    private LocalDateTime validTill;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "refresh_token_expiry")
    private LocalDateTime refreshTokenExpiry;

    @Column(name = "token")
    private String token;

    @Column(name = "session_id", unique = true)
    private String sessionId;

    @Column(name = "session_creation_time")
    private Long sessionCreationTime;

    @Column(name = "session_last_access_time")
    private Long sessionLastAccessTime;

    @Column(name = "session_max_inactive_interval")
    private Integer sessionMaxInactiveInterval;

    @Column(name = "session_expiry_time")
    private Long sessionExpiryTime;

    @Column(name = "session_principal_name")
    private String sessionPrincipalName;

    @Column(name = "session_attributes", columnDefinition = "JSON")
    private String sessionAttributes;

    @Column(name = "last_access_time")
    private LocalDateTime lastAccessTime;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getActive() { return active; }
    public void setActive(String active) { this.active = active; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Integer getGender() { return gender; }
    public void setGender(Integer gender) { this.gender = gender; }
    public Integer getRole() { return role; }
    public void setRole(Integer role) { this.role = role; }
    public LocalDateTime getCreationTime() { return creationTime; }
    public void setCreationTime(LocalDateTime creationTime) { this.creationTime = creationTime; }
    public LocalDateTime getValidTill() { return validTill; }
    public void setValidTill(LocalDateTime validTill) { this.validTill = validTill; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public LocalDateTime getRefreshTokenExpiry() { return refreshTokenExpiry; }
    public void setRefreshTokenExpiry(LocalDateTime refreshTokenExpiry) { this.refreshTokenExpiry = refreshTokenExpiry; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Long getSessionCreationTime() { return sessionCreationTime; }
    public void setSessionCreationTime(Long sessionCreationTime) { this.sessionCreationTime = sessionCreationTime; }
    public Long getSessionLastAccessTime() { return sessionLastAccessTime; }
    public void setSessionLastAccessTime(Long sessionLastAccessTime) { this.sessionLastAccessTime = sessionLastAccessTime; }
    public Integer getSessionMaxInactiveInterval() { return sessionMaxInactiveInterval; }
    public void setSessionMaxInactiveInterval(Integer sessionMaxInactiveInterval) { this.sessionMaxInactiveInterval = sessionMaxInactiveInterval; }
    public Long getSessionExpiryTime() { return sessionExpiryTime; }
    public void setSessionExpiryTime(Long sessionExpiryTime) { this.sessionExpiryTime = sessionExpiryTime; }
    public String getSessionPrincipalName() { return sessionPrincipalName; }
    public void setSessionPrincipalName(String sessionPrincipalName) { this.sessionPrincipalName = sessionPrincipalName; }
    public String getSessionAttributes() { return sessionAttributes; }
    public void setSessionAttributes(String sessionAttributes) { this.sessionAttributes = sessionAttributes; }
    public LocalDateTime getLastAccessTime() { return lastAccessTime; }
    public void setLastAccessTime(LocalDateTime lastAccessTime) { this.lastAccessTime = lastAccessTime; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
}