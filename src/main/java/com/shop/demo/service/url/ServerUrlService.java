package com.shop.demo.service.url;

import com.shop.demo.database.entity.gateway.ServerUrlEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface ServerUrlService {
    void addServerUrl(ServerUrlEntity serverUrl);
    ServerUrlEntity getServerUrlByRequestUrl(String requestUrl);
    void routeRequest(String requestUri, String method, HttpServletRequest request, HttpServletResponse response);
}