package com.shop.demo.server.filter;

import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.propertiesReader.EnvironmentProperties;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class CustomCorsFilter implements Filter {
    private final EnvironmentProperties envProps;
    private final ApplicationLogger logger;

    public CustomCorsFilter(EnvironmentProperties envProps, ApplicationLogger logger) {
        this.envProps = envProps;
        this.logger = logger;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, jakarta.servlet.ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Apply CORS headers
        for (String origin : envProps.getSecurity().getCors().getAllowedOrigins()) {
            httpResponse.setHeader("Access-Control-Allow-Origin", origin);
        }
        httpResponse.setHeader("Access-Control-Allow-Methods", String.join(",", envProps.getSecurity().getCors().getAllowedMethods()));
        httpResponse.setHeader("Access-Control-Allow-Headers", String.join(",", envProps.getSecurity().getCors().getAllowedHeaders()));
        httpResponse.setHeader("Access-Control-Allow-Credentials", String.valueOf(envProps.getSecurity().getCors().isAllowCredentials()));

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            logger.info("Handled CORS preflight request for {}", httpRequest.getRequestURI());
            return;
        }

        chain.doFilter(request, response);
    }
}