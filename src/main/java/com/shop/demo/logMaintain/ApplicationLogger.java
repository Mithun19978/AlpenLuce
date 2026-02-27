package com.shop.demo.logMaintain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class ApplicationLogger {
    private static final Logger logger = LoggerFactory.getLogger(ApplicationLogger.class);

    public void info(String message, Object... args) {
        logger.info("[APP-INFO] " + message, args);
    }

    public void warn(String message, Object... args) {
        logger.warn("[APP-WARN] " + message, args);
    }

    public void error(String message, Object... args) {
        logger.error("[APP-ERROR] " + message, args);
    }

    public void error(String message, Throwable t, Object... args) {
        logger.error("[APP-ERROR] " + message, args, t);
    }

    public void debug(String message, Object... args) {
        logger.debug("[APP-DEBUG] " + message, args);
    }
}