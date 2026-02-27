package com.shop.demo.logMaintain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Centralized logger for SSL, security, authentication and access events.
 */
@Component
public class SslAndSecurityLogger {

    private static final Logger logger = LoggerFactory.getLogger(SslAndSecurityLogger.class);

    private static final String PREFIX = "[SSL-SECURITY] ";

    // ────────────────────────────────────────────────
    //  Fixed / added overloads for LogService calls
    // ────────────────────────────────────────────────

    public void logRequest(String method, String url, boolean isHttps) {
        logger.info(PREFIX + "Incoming request - Method: {} | URL: {} | Protocol: {}",
                method, url, isHttps ? "HTTPS" : "HTTP");
    }

    public void logRequest(String method, String url, boolean isHttps, Object... args) {
        logger.info(PREFIX + "Incoming request - Method: {} | URL: {} | Protocol: {} | Extra: {}",
                method, url, isHttps ? "HTTPS" : "HTTP", args);
    }

    public void logResponse(String method, String url, int status) {
        logger.info(PREFIX + "Response - Method: {} | URL: {} | Status: {}",
                method, url, status);
    }

    public void logResponse(String method, String url, int status, Object... args) {
        logger.info(PREFIX + "Response - Method: {} | URL: {} | Status: {} | Extra: {}",
                method, url, status, args);
    }

    public void logRequestError(String method, String url, Exception e) {
        logger.error(PREFIX + "Request failed - Method: {} | URL: {} | Error: {}",
                method, url, e.getMessage(), e);
    }

    public void logRequestError(String method, String url, Exception e, Object... args) {
        logger.error(PREFIX + "Request failed - Method: {} | URL: {} | Error: {} | Extra: {}",
                method, url, e.getMessage(), args, e);
    }

    // ────────────────────────────────────────────────
    //  General logging methods (keep your original ones)
    // ────────────────────────────────────────────────

    public void logInfo(String msg, Object... args) {
        logger.info(PREFIX + msg, args);
    }

    public void logWarn(String msg, Object... args) {
        logger.warn(PREFIX + msg, args);
    }

    public void logError(String msg, Object... args) {
        logger.error(PREFIX + msg, args);
    }

    public void logError(String msg, Exception e) {
        logger.error(PREFIX + msg, e);
    }

    // Your original methods (unchanged)
    public void logAuthEvent(String username, boolean success) {
        if (success) {
            logger.info(PREFIX + "Authentication SUCCESS for user: {}", username);
        } else {
            logger.warn(PREFIX + "Authentication FAILED for user: {}", username);
        }
    }

    public void logAccess(String endpoint, boolean allowed, String username) {
        if (allowed) {
            logger.info(PREFIX + "Access GRANTED - User: {} | Endpoint: {}", username, endpoint);
        } else {
            logger.warn(PREFIX + "Access DENIED - User: {} | Endpoint: {}", username, endpoint);
        }
    }

    public void logSslHandshake(String protocol, String cipher) {
        logger.info(PREFIX + "SSL Handshake - Protocol: {} | Cipher: {}", protocol, cipher);
    }
}