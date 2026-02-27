package com.shop.demo.controller;

import com.shop.demo.database.entity.gateway.ServerUrlEntity;
import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.service.url.ServerUrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class ServerUrlController {
    private final ServerUrlService serverUrlService;
    private final ApplicationLogger logger;

    public ServerUrlController(ServerUrlService serverUrlService, ApplicationLogger logger) {
        this.serverUrlService = serverUrlService;
        this.logger = logger;
    }

    public void addServerUrl(HttpServletRequest request, HttpServletResponse response) {
        try {
            ServerUrlEntity entity = new ServerUrlEntity();
            entity.setRequestUrl(request.getParameter("requestUrl"));
            entity.setTargetUrl(request.getParameter("targetUrl"));
            entity.setMethod(request.getParameter("method"));
            entity.setService(request.getParameter("service"));
            entity.setAccessUsers(Integer.parseInt(request.getParameter("accessUsers")));
            entity.setPermitAll(Integer.parseInt(request.getParameter("permitAll")));
            entity.setRequestEncrypted(Integer.parseInt(request.getParameter("requestEncrypted")));
            entity.setAllowUserEdit(Integer.parseInt(request.getParameter("allowUserEdit")));

            serverUrlService.addServerUrl(entity);
            response.setStatus(HttpServletResponse.SC_CREATED);
            logger.info("Added server URL: {}", entity.getRequestUrl());
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            logger.error("Error serving home page: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    public void getServerUrl(HttpServletRequest request, HttpServletResponse response) {
        String requestUrl = request.getParameter("requestUrl");
        try {
            ServerUrlEntity entity = serverUrlService.getServerUrlByRequestUrl(requestUrl);
            if (entity != null) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"requestUrl\":\"" + entity.getRequestUrl() + "\",\"targetUrl\":\"" + entity.getTargetUrl() + "\"}");
                logger.info("Retrieved server URL: {}", requestUrl);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                logger.warn("Server URL not found: {}", requestUrl);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            // Line 53 - Fixed: Concatenate message and include stack trace
            logger.error("Error retrieving server URL " + requestUrl + ": " + 
                        (e.getMessage() != null ? e.getMessage() : "Unknown error"), e);
        }
    }
}