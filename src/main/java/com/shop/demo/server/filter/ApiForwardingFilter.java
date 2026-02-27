package com.shop.demo.server.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Forwards /api/** requests to /server/** so the static Next.js frontend
 * can call /api/... and reach Spring Boot controllers mapped at /server/...
 *
 * Runs before JwtAuthenticationFilter (Order(1)) so Security checks
 * are applied against the original /api/** path.
 */
@Component
@Order(1)
public class ApiForwardingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/api/")) {
            String newPath = "/server/" + path.substring(5); // strip "/api/"
            String query = request.getQueryString();
            String forwardPath = (query != null) ? newPath + "?" + query : newPath;

            RequestDispatcher dispatcher = request.getRequestDispatcher(forwardPath);
            dispatcher.forward(request, response);
        } else {
            chain.doFilter(request, response);
        }
    }
}
