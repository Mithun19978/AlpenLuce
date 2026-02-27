package com.shop.demo.database.entity.gateway;

import java.io.Serializable;
import java.time.LocalDateTime;

public class EndpointPermissionsEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String endpoint;
    private PermissionType permission;
    private LocalDateTime createdAt;

    public EndpointPermissionsEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public enum PermissionType {
        READ, WRITE, DELETE, EXECUTE
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public PermissionType getPermission() {
        return permission;
    }

    public void setPermission(PermissionType permission) {
        this.permission = permission;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}