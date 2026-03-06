package com.shop.demo.server.filter;

import com.shop.demo.logMaintain.FilterLogger;
import com.shop.demo.security.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final FilterLogger filterLogger;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, FilterLogger filterLogger) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.filterLogger     = filterLogger;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        // Skip filter for public endpoints (fast path)
        if (isPublicEndpoint(uri)) {
            filterLogger.debug("Public endpoint - skipping JWT validation: {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        String token = getJwtFromRequest(request);

        if (token == null) {
            filterLogger.debug("No JWT token found in request: {}", uri);
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtTokenProvider.validateToken(token)) {
            filterLogger.warn("Invalid or expired JWT token for request: {}", uri);
            filterLogger.logJwtValidation(token, false);
            filterChain.doFilter(request, response);
            return;
        }

        // Token is valid → set authentication
        try {
            String username = jwtTokenProvider.getUsername(token);
            Long userId = jwtTokenProvider.getUserId(token);
            String role = jwtTokenProvider.getRole(token);

            filterLogger.info("Authenticated user: username={}, userId={}, role={}", username, userId, role);
            filterLogger.logJwtValidation(token, true);

            List<SimpleGrantedAuthority> authorities =
                role != null ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                             : Collections.emptyList();

            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    authorities
                );

            SecurityContextHolder.getContext().setAuthentication(authToken);

            if (userId != null) {
                request.setAttribute("userId", userId);
            }
            if (role != null) {
                try {
                    request.setAttribute("userRole", Integer.parseInt(role));
                } catch (NumberFormatException ignored) {}
            }

        } catch (Exception e) {
            filterLogger.error("Failed to set authentication from valid JWT", e);
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

    private boolean isPublicEndpoint(String uri) {
        if (uri.equals("/server/auth/login") ||
            uri.equals("/server/auth/refresh") ||
            uri.equals("/server/auth/logout") ||
            uri.equals("/server/user/register")) {
            return true;
        }
        if (uri.startsWith("/oauth2/") || uri.startsWith("/login/oauth2/")) {
            return true;
        }
        return uri.startsWith("/css/") ||
               uri.startsWith("/js/") ||
               uri.startsWith("/images/") ||
               uri.startsWith("/html/") ||
               uri.matches(".+\\.html$") ||
               uri.equals("/") ||
               uri.equals("/Index") ||
               uri.equals("/Dashboard");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return isPublicEndpoint(request.getRequestURI());
    }
}
