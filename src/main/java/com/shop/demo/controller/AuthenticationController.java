package com.shop.demo.controller;

import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.security.jwt.JwtTokenProvider;
import com.shop.demo.service.auth.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/server/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthenticationController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationLogger logger;

    public AuthenticationController(
            AuthService authService,
            JwtTokenProvider jwtTokenProvider,
            ApplicationLogger logger) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.logger = logger;
    }

    // ────────────────────────────────────────────────
    //                  LOGIN
    // ────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody @Valid LoginRequest request) {

        try {
            Map<String, String> tokens = authService.login(
                    request.getUsername(),
                    request.getPassword()
            );

            logger.info("Successful login for user: {}", request.getUsername());
            return ResponseEntity.ok(tokens);

        } catch (BadCredentialsException e) {
            logger.warn("Failed login attempt for user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));

        } catch (RuntimeException e) {
            logger.error("Login error for user: {}", request.getUsername(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            logger.error("Unexpected error during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    // ────────────────────────────────────────────────
    //                  REFRESH TOKEN
    // ────────────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(
            @RequestBody @Valid RefreshRequest request) {

        try {
            Map<String, String> tokens = authService.refreshToken(
                    request.getRefreshToken()
            );

            logger.info("Access token refreshed successfully");
            return ResponseEntity.ok(tokens);

        } catch (RuntimeException e) {
            logger.warn("Invalid or expired refresh token attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            logger.error("Unexpected error during token refresh", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    // ────────────────────────────────────────────────
    //                  LOGOUT
    // ────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid or missing Authorization header"));
            }

            String token = authHeader.substring(7);
            String username = jwtTokenProvider.getUsername(token);

            authService.logout(username);

            logger.info("User logged out successfully: {}", username);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));

        } catch (RuntimeException e) {
            logger.warn("Logout failed - invalid token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));

        } catch (Exception e) {
            logger.error("Unexpected error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Logout failed"));
        }
    }

    // ────────────────────────────────────────────────
    //                  DTOs with validation
    // ────────────────────────────────────────────────
    public static class LoginRequest {

        @jakarta.validation.constraints.NotBlank(message = "Username is required")
        private String username;

        @jakarta.validation.constraints.NotBlank(message = "Password is required")
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RefreshRequest {

        @jakarta.validation.constraints.NotBlank(message = "Refresh token is required")
        private String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }
}