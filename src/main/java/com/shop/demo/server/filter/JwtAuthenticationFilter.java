package com.shop.demo.server.filter;

import com.shop.demo.security.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        // Skip filter for public endpoints (fast path)
        if (isPublicEndpoint(uri)) {
            logger.debug("Public endpoint - skipping JWT validation: {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        String token = getJwtFromRequest(request);

        if (token == null) {
            logger.debug("No JWT token found in request: {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtTokenProvider.validateToken(token)) {
            logger.warn("Invalid or expired JWT token for request: {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        // Token is valid → set authentication
        try {
            String username = jwtTokenProvider.getUsername(token);
            Long userId = jwtTokenProvider.getUserId(token);
            String role = jwtTokenProvider.getRole(token);

            logger.info("Authenticated user: username={}, userId={}, role={}", username, userId, role);

            // Build authorities from role (you can extend this for multiple roles/permissions)
            List<SimpleGrantedAuthority> authorities = 
                role != null ? List.of(new SimpleGrantedAuthority("ROLE_" + role)) 
                             : Collections.emptyList();

            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(
                    username,           // principal
                    null,               // credentials (not needed after validation)
                    authorities         // roles/authorities
                );

            // Optional: you can attach custom details if needed
            // authToken.setDetails(new CustomUserDetails(username, userId, role));

            SecurityContextHolder.getContext().setAuthentication(authToken);

            // Expose userId as request attribute for @RequestAttribute("userId") in controllers
            if (userId != null) {
                request.setAttribute("userId", userId);
            }

        } catch (Exception e) {
            logger.error("Failed to set authentication from valid JWT", e);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Public endpoints that should bypass JWT validation.
     * Keep this list in sync with SecurityConfig permitAll() rules.
     */
    private boolean isPublicEndpoint(String uri) {
        // Auth endpoints
        if (uri.equals("/server/auth/login") ||
            uri.equals("/server/auth/refresh") ||
            uri.equals("/server/auth/logout") ||
            uri.equals("/server/user/register")) {
            return true;
        }

        // OAuth2 exchange paths
        if (uri.startsWith("/oauth2/") || uri.startsWith("/login/oauth2/")) {
            return true;
        }

        // Static resources & frontend pages
        return uri.startsWith("/css/") ||
               uri.startsWith("/js/") ||
               uri.startsWith("/images/") ||
               uri.startsWith("/html/") ||
               uri.matches(".+\\.html$") ||
               uri.equals("/") ||
               uri.equals("/Index") ||
               uri.equals("/Dashboard");
    }

    /**
     * Optimization: skip filter execution for public paths
     * (reduces log spam and processing overhead)
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return isPublicEndpoint(request.getRequestURI());
    }
}