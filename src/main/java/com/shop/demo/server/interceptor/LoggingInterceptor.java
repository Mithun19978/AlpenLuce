package com.shop.demo.server.interceptor;

import com.shop.demo.logMaintain.ApplicationLogger;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class LoggingInterceptor {
    private final ApplicationLogger logger;

    public LoggingInterceptor(ApplicationLogger logger) {
        this.logger = logger;
    }

    public void handle(HttpServletRequest request, HttpServletResponse response) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        logger.info("Processing request: {} {}", method, uri);
    }
}