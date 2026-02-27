package com.shop.demo.logMaintain;

import org.springframework.stereotype.Component;

@Component
public class LogService {
    private final ApplicationLogger appLogger;
    private final DatabaseLogger dbLogger;
    private final FilterLogger filterLogger;

    private final SslAndSecurityLogger sslLogger;

    public LogService(ApplicationLogger appLogger, DatabaseLogger dbLogger,
                     FilterLogger filterLogger,
                     SslAndSecurityLogger sslLogger) {
        this.appLogger = appLogger;
        this.dbLogger = dbLogger;
        this.filterLogger = filterLogger;
  
        this.sslLogger = sslLogger;
    }

    public void performOperations() {
        // Application logs
        appLogger.info("Starting application operation");
        appLogger.debug("Debugging application");
        appLogger.warn("Warning: potential issue detected");
        try {
            throw new RuntimeException("Application error");
        } catch (Exception e) {
            appLogger.error("Application failed", e);
        }

        // Database logs
        dbLogger.logInfo("Database operation started");
        dbLogger.logDbConnection("jdbc:mysql://localhost:3306/project", "root");
        dbLogger.logDbConnectionSuccess("jdbc:mysql://localhost:3306/project");
        dbLogger.logTransactionStart("tx123");
        dbLogger.logTransactionCommit("tx123");
        try {
            throw new RuntimeException("Database error");
        } catch (Exception e) {
            dbLogger.logQueryExecutionError("SELECT * FROM users", e);
            dbLogger.logTransactionRollback("tx123");
        }

        // Filter logs
        filterLogger.info("Processing filter");
        filterLogger.logJwtValidation("abc123token", false);

  
        try {
            throw new RuntimeException("Session error");
        } catch (Exception e) {
          
        }

        // SSL logs
        sslLogger.logRequest("GET", "/api/test", true);
        sslLogger.logResponse("GET", "/api/test", 200);
        try {
            throw new RuntimeException("SSL error");
        } catch (Exception e) {
            sslLogger.logRequestError("POST", "/api/error", e);
        }
    }
}