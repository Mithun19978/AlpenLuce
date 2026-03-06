package com.shop.demo.config;

import com.shop.demo.database.entity.project.UserEntity;
import com.shop.demo.database.repository.projectRepository.UserRepository;
import com.shop.demo.logMaintain.SslAndSecurityLogger;
import com.shop.demo.security.jwt.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final SslAndSecurityLogger sslLogger;

    public OAuth2SuccessHandler(JwtTokenProvider jwtTokenProvider,
                                UserRepository userRepository,
                                SslAndSecurityLogger sslLogger) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository   = userRepository;
        this.sslLogger        = sslLogger;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();
        String email    = oauthUser.getAttribute("email");
        String name     = oauthUser.getAttribute("name");
        String googleId = (String) oauthUser.getAttribute("sub");

        sslLogger.logInfo("Google OAuth2 success - email: {}, name: {}", email, name);

        // 1. Find by googleId → find by email → create new
        UserEntity user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .orElseGet(() -> createOAuthUser(email, name, googleId)));

        // 2. Link googleId if user was found by email only
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            userRepository.save(user);
            sslLogger.logInfo("Linked Google ID to existing account: {}", user.getUsername());
        }

        // 3. Generate tokens
        String accessToken  = jwtTokenProvider.generateToken(
                user.getId(), user.getUsername(), String.valueOf(user.getRole()));
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());

        // 4. Persist tokens
        user.setToken(accessToken);
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        sslLogger.logAuthEvent(user.getUsername(), true);

        // 5. Redirect to frontend callback with tokens in query params
        String redirectUrl = UriComponentsBuilder.fromUriString("/auth/callback/")
                .queryParam("accessToken",  URLEncoder.encode(accessToken,  StandardCharsets.UTF_8))
                .queryParam("refreshToken", URLEncoder.encode(refreshToken, StandardCharsets.UTF_8))
                .queryParam("username",     URLEncoder.encode(user.getUsername(), StandardCharsets.UTF_8))
                .queryParam("role",         user.getRole())
                .build(true)
                .toUriString();

        sslLogger.logInfo("Redirecting Google user {} to callback", user.getUsername());
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private UserEntity createOAuthUser(String email, String name, String googleId) {
        // Derive username from email prefix, deduplicate if taken
        String base     = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        String username = base;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + "_" + suffix++;
        }

        sslLogger.logInfo("Creating new OAuth2 user: username={}, email={}", username, email);

        UserEntity u = new UserEntity();
        u.setUsername(username);
        u.setEmail(email);
        u.setGoogleId(googleId);
        u.setPassword(null);
        u.setMobileNumber(null);
        u.setRole(1);
        u.setActive("true");
        u.setCreationTime(LocalDateTime.now());
        return userRepository.save(u);
    }
}
