package com.shop.demo.config;

import com.shop.demo.logMaintain.FilterLogger;
import com.shop.demo.logMaintain.SslAndSecurityLogger;
import com.shop.demo.security.jwt.JwtTokenProvider;
import com.shop.demo.server.filter.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final FilterLogger filterLogger;
    private final SslAndSecurityLogger sslLogger;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                          OAuth2SuccessHandler oAuth2SuccessHandler,
                          FilterLogger filterLogger,
                          SslAndSecurityLogger sslLogger) {
        this.jwtTokenProvider     = jwtTokenProvider;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.filterLogger         = filterLogger;
        this.sslLogger            = sslLogger;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, filterLogger);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            // IF_REQUIRED allows Spring OAuth2 to store state/nonce in session
            // during the Google exchange; JWT API calls remain effectively stateless
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )

            .authorizeHttpRequests(auth -> auth
                // OAuth2 exchange endpoints — always public
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                // Public backend endpoints (direct + via ApiForwardingFilter)
                .requestMatchers("/server/auth/**",      "/api/auth/**").permitAll()
                .requestMatchers("/server/user/register","/api/user/register").permitAll()
                .requestMatchers("/server/garments",          "/api/garments").permitAll()
                .requestMatchers("/server/garments/featured", "/api/garments/featured").permitAll()
                .requestMatchers("/server/garments/**",       "/api/garments/**").permitAll()
                .requestMatchers("/server/categories",        "/api/categories").permitAll()
                // Payment webhooks — must be public (Razorpay / Shiprocket call these)
                .requestMatchers("/server/webhook/**").permitAll()
                // All other backend API calls require authentication
                .requestMatchers("/server/**", "/api/**").authenticated()
                // Everything else = Next.js static files and SPA page routes — permit all
                .anyRequest().permitAll()
            )

            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())

            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    sslLogger.logError("[OAUTH2-ERROR] Google authentication failed: {} - {}",
                            exception.getClass().getSimpleName(), exception.getMessage(), exception);
                    response.sendRedirect("/auth/login/?error=oauth_failed");
                })
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    sslLogger.logWarn("Unauthorized access: {} {}", request.getMethod(), request.getRequestURI());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Please login\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    sslLogger.logWarn("Access denied: {} {}", request.getMethod(), request.getRequestURI());
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Access denied\"}");
                })
            )

            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
