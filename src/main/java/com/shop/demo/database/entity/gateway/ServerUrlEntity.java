package com.shop.demo.database.entity.gateway;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ServerUrlEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String description;
    private String requestUrl;
    private String targetUrl;
    private String method;
    private String service;
    private int requestEncrypted;
    private int allowUserEdit;
    private int permitAll;
    private int accessUsers; // Bitwise roles: 1=User, 2=Admin, 4=Superadmin
    private LocalDateTime createdAt;

    public ServerUrlEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequestUrl() {
        return requestUrl;
    }

    public void setRequestUrl(String requestUrl) {
        this.requestUrl = requestUrl;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public int getRequestEncrypted() {
        return requestEncrypted;
    }

    public void setRequestEncrypted(int requestEncrypted) {
        this.requestEncrypted = requestEncrypted;
    }

    public int getAllowUserEdit() {
        return allowUserEdit;
    }

    public void setAllowUserEdit(int allowUserEdit) {
        this.allowUserEdit = allowUserEdit;
    }

    public int getPermitAll() {
        return permitAll;
    }

    public void setPermitAll(int permitAll) {
        this.permitAll = permitAll;
    }

    public int getAccessUsers() {
        return accessUsers;
    }

    public void setAccessUsers(int accessUsers) {
        this.accessUsers = accessUsers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}