package com.shop.demo.service.url;

import com.shop.demo.database.entity.gateway.ServerUrlEntity;
import com.shop.demo.database.repository.gatewayRepository.ServerUrlRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Optional;

public class ServerUrlServiceImpl implements ServerUrlService {
    private final ServerUrlRepository repository;
    private final ApplicationLogger logger;

    public ServerUrlServiceImpl(ServerUrlRepository repository, ApplicationLogger logger) {
        this.repository = repository;
        this.logger = logger;
    }

    @Override
    public void addServerUrl(ServerUrlEntity serverUrl) {
        // Validate role-based access
        if (serverUrl.getAccessUsers() <= 0 || (serverUrl.getAccessUsers() & 7) == 0) { // 7 = 1|2|4 (user|admin|superadmin)
            throw new IllegalArgumentException("Invalid access_users: must include at least one valid role (1, 2, or 4)");
        }
        repository.save(serverUrl);
        logger.info("Saved server URL: {}", serverUrl.getRequestUrl());
    }

    @Override
    public ServerUrlEntity getServerUrlByRequestUrl(String requestUrl) {
        Optional<ServerUrlEntity> entity = repository.findByRequestUrl(requestUrl);
        return entity.orElse(null);
    }

    @Override
    public void routeRequest(String requestUri, String method, HttpServletRequest request, HttpServletResponse response) {
        Optional<ServerUrlEntity> entityOpt = repository.findByRequestUrl(requestUri);
        if (entityOpt.isPresent()) {
            ServerUrlEntity entity = entityOpt.get();
            if (entity.getMethod().equalsIgnoreCase(method)) {
                if (entity.getPermitAll() == 1 || checkRoleAccess(entity.getAccessUsers(), getUserRole(request))) {
                    forwardRequest(entity.getTargetUrl(), request, response);
                } else {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    logger.warn("Access denied for {} {} - Required roles: {}", method, requestUri, entity.getAccessUsers());
                }
            } else {
                response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
                logger.warn("Method {} not allowed for {}", method, requestUri);
            }
        } else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            logger.warn("No route found for {} {}", method, requestUri);
        }
    }

    private boolean checkRoleAccess(int accessUsers, int userRole) {
        return (accessUsers & userRole) != 0;
    }

    private int getUserRole(HttpServletRequest request) {
        // Placeholder: Extract role from JWT or session
        // For demo, assume user role (1)
        return 1; // USER role
    }

    private void forwardRequest(String targetUrl, HttpServletRequest request, HttpServletResponse response) {
        // Placeholder for forwarding logic (e.g., using RestTemplate or HttpClient)
        try {
            response.getWriter().write("Forwarded to: " + targetUrl);
            logger.info("Forwarded request to: {}", targetUrl);
        } catch (Exception e) {
            // Line 74 - Fixed: Concatenate message and include stack trace
            logger.error("Failed to forward request to " + targetUrl + ": " + 
                        (e.getMessage() != null ? e.getMessage() : "Unknown error"), e);
        }
    }
}