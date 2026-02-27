package com.shop.demo.database.entity.gateway;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ServiceUrlsEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String serviceName;
    private String url;
    private LocalDateTime createdAt;

    public ServiceUrlsEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}