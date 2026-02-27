package com.shop.demo.database.entity.gateway;

import java.io.Serializable;
import java.time.LocalDateTime;

public class FiltersEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String filterName;
    private String filterValue;
    private LocalDateTime createdAt;

    public FiltersEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilterName() {
        return filterName;
    }

    public void setFilterName(String filterName) {
        this.filterName = filterName;
    }

    public String getFilterValue() {
        return filterValue;
    }

    public void setFilterValue(String filterValue) {
        this.filterValue = filterValue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}