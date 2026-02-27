package com.shop.demo.database.repository.gatewayRepository;

import com.shop.demo.database.entity.gateway.ServerUrlEntity;

import java.util.Optional;

public class ServerUrlRepository {
    // Placeholder for database operations
    public Optional<ServerUrlEntity> findByRequestUrl(String requestUrl) {
        // Simulate DB query
        return Optional.empty();
    }

    public Optional<ServerUrlEntity> findByUrl(String url) {
        // Simulate DB query
        return Optional.empty();
    }

    public void save(ServerUrlEntity entity) {
        // Simulate DB save
    }

    public void deleteByUrl(String url) {
        // Simulate DB delete
    }
}