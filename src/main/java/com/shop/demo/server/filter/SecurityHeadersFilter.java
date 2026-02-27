package com.shop.demo.server.filter;

import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.resourceMapper.SecurityMapper;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class SecurityHeadersFilter implements Filter {
    private final SecurityMapper securityMapper;
    private final ApplicationLogger logger;

    public SecurityHeadersFilter(SecurityMapper securityMapper, ApplicationLogger logger) {
        this.securityMapper = securityMapper;
        this.logger = logger;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, jakarta.servlet.ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Apply security headers using SecurityMapper
        setHeaderIfNotEmpty(httpResponse, "Content-Security-Policy", securityMapper.getContentSecurityPolicy());
        setHeaderIfNotEmpty(httpResponse, "Strict-Transport-Security", securityMapper.getStrictTransportSecurity());
        setHeaderIfNotEmpty(httpResponse, "X-Frame-Options", securityMapper.getXFrameOptions());
        setHeaderIfNotEmpty(httpResponse, "X-Content-Type-Options", securityMapper.getXContentTypeOptions());
        setHeaderIfNotEmpty(httpResponse, "X-XSS-Protection", securityMapper.getXXssProtection());
        setHeaderIfNotEmpty(httpResponse, "Cache-Control", securityMapper.getCacheControl());
        setHeaderIfNotEmpty(httpResponse, "Referrer-Policy", securityMapper.getReferrerPolicy());
        setHeaderIfNotEmpty(httpResponse, "Set-Cookie", securityMapper.getSetCookie());

        logger.info("Applied security headers to response");
        chain.doFilter(request, response);
    }

    private void setHeaderIfNotEmpty(HttpServletResponse response, String name, String value) {
        if (value != null && !value.trim().isEmpty()) {
            response.setHeader(name, value);
        }
    }
}