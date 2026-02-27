package com.shop.demo.service.auth;

import com.shop.demo.database.entity.project.UserEntity;
import com.shop.demo.database.repository.projectRepository.UserRepository;
import com.shop.demo.security.encryption.PasswordEncryptionUtil;
import com.shop.demo.security.jwt.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncryptionUtil passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncryptionUtil passwordEncoder,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository   = userRepository;
        this.passwordEncoder  = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public Map<String, String> login(String username, String password) {
        try {
            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid username"));
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new IllegalArgumentException("Invalid password");
            }
            String accessToken  = jwtTokenProvider.generateToken(user.getId(), username, String.valueOf(user.getRole()));
            String refreshToken = jwtTokenProvider.generateRefreshToken(username);
            user.setToken(accessToken);
            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
            user.setSessionId(UUID.randomUUID().toString());
            userRepository.save(user);
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("role", String.valueOf(user.getRole()));
            return response;
        } catch (Exception e) {
            logger.error("[AUTH-ERROR] Login failed for {}: {}", username, e.getMessage());
            throw new RuntimeException("Login failed", e);
        }
    }

    @Override
    public Map<String, String> refreshToken(String refreshToken) {
        try {
            String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
            if (!refreshToken.equals(user.getRefreshToken())
                    || user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Invalid or expired refresh token");
            }
            String newAccessToken = jwtTokenProvider.generateToken(user.getId(), username, String.valueOf(user.getRole()));
            user.setToken(newAccessToken);
            if (user.getSessionId() == null) {
                user.setSessionId(UUID.randomUUID().toString());
            }
            userRepository.save(user);
            logger.info("[AUTH-INFO] Token refreshed for: {}", username);
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", refreshToken);
            response.put("role", String.valueOf(user.getRole()));
            return response;
        } catch (Exception e) {
            logger.error("[AUTH-ERROR] Refresh failed: {}", e.getMessage());
            throw new RuntimeException("Token refresh failed", e);
        }
    }

    @Override
    public void logout(String username) {
        try {
            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
            user.setToken(null);
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            user.setSessionId(null);
            userRepository.save(user);
            logger.info("[AUTH-INFO] User logged out: {}", username);
        } catch (Exception e) {
            logger.error("[AUTH-ERROR] Logout failed for {}: {}", username, e.getMessage());
            throw new RuntimeException("Logout failed", e);
        }
    }
}
