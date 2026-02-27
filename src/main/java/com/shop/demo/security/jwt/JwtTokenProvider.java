package com.shop.demo.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;   // ← Fixed: Jakarta EE (Spring Boot 3+)
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // Made it non-final so key rotation works
    private Key signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    private static final long JWT_EXPIRATION = 15 * 60 * 1000L;   // 15 minutes
    private static final long REFRESH_EXPIRATION = 24 * 60 * 60 * 1000L; // 1 day

    // ============================================================
    // TOKEN GENERATION
    // ============================================================
    public String generateToken(Long userId, String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(signingKey)
                .compact();
    }

    // ============================================================
    // CLAIM EXTRACTORS
    // ============================================================
    public Long getUserIdFromJWT(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getRoleFromJWT(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Compatibility aliases used in your project
    public String getUsername(String token) {
        return getUsernameFromToken(token);
    }

    public Long getUserId(String token) {
        return getUserIdFromJWT(token);
    }

    public String getRole(String token) {
        return getRoleFromJWT(token);
    }

    public String getRoleFromToken(String token) {
        return getRoleFromJWT(token);
    }

    // ============================================================
    // TOKEN RESOLUTION FROM HEADER
    // ============================================================
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // ============================================================
    // KEY ROTATION SUPPORT (now works because key is not final)
    // ============================================================
    public void updateSigningKey(byte[] newKeyBytes) {
        if (newKeyBytes == null || newKeyBytes.length < 32) {
            throw new IllegalArgumentException("Key must be at least 256 bits (32 bytes)");
        }
        this.signingKey = Keys.hmacShaKeyFor(newKeyBytes);
    }

    // ============================================================
    // TOKEN VALIDATION
    // ============================================================
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            logger.error("JWT expired", e);
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT", e);
        } catch (MalformedJwtException e) {
            logger.error("Malformed JWT", e);
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature", e);
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty", e);
        }
        return false;
    }

    // ============================================================
    // PRIVATE HELPER
    // ============================================================
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}