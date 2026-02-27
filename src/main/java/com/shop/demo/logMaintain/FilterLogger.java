package com.shop.demo.logMaintain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class FilterLogger {
    private static final Logger logger = LoggerFactory.getLogger(FilterLogger.class);

    public void info(String message, Object... args) {
        logger.info("[FILTER-INFO] " + message, args);
    }

    public void error(String message, Throwable t, Object... args) {
        logger.error("[FILTER-ERROR] " + message, args, t);
    }

    public void logJwtValidation(String token, boolean isValid) {
        if (isValid) {
            logger.info("[FILTER-INFO] JWT Validation - Token: {}, Valid: {}", token.length() > 10 ? token.substring(0, 10) + "..." : token, isValid);
        } else {
            logger.error("[FILTER-ERROR] JWT Validation - Token: {}, Valid: {}", token.length() > 10 ? token.substring(0, 10) + "..." : token, isValid);
        }
    }
}