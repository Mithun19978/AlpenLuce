package com.shop.demo.logMaintain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**

* DatabaseLogger - Centralized database activity logger.
* Logs database connections, queries, transactions, and errors in detail.
  */
  @Component
  public class DatabaseLogger {
  private static final Logger logger = LoggerFactory.getLogger(DatabaseLogger.class);

  // Generic Info Log
  public void logInfo(String message, Object... args) {
  logger.info("[DB-INFO] " + message, args);
  }

  // Warnings
  public void logWarn(String message, Object... args) {
  logger.warn("[DB-WARN] " + message, args);
  }

  // Errors
  public void logError(String message, Exception e, Object... args) {
  if (e != null) {
  logger.error("[DB-ERROR] " + message + " - Exception: {}", e.getMessage(), e);
  } else {
  logger.error("[DB-ERROR] " + message, args);
  }
  }

  // DB Connection Logs
  public void logDbConnection(String dbUrl, String username) {
  logger.info("[DB-CONNECTION] 🔗 Connecting to DB: {} | User: {}", dbUrl, username);
  }

  public void logDbConnectionSuccess(String dbUrl) {
  logger.info("[DB-CONNECTION] ✅ Successfully connected to DB: {}", dbUrl);
  }

  public void logDbConnectionFailure(String dbUrl, Exception e) {
  logger.error("[DB-CONNECTION] ❌ Connection failed to DB: {} | Error: {}", dbUrl, e.getMessage(), e);
  }

  // Transaction Logs
  public void logTransactionStart(String id) {
  logger.info("[DB-TRANSACTION] ▶️ Transaction started: {}", id);
  }

  public void logTransactionCommit(String id) {
  logger.info("[DB-TRANSACTION] ✅ Transaction committed: {}", id);
  }

  public void logTransactionRollback(String id) {
  logger.warn("[DB-TRANSACTION] ⚠️ Transaction rolled back: {}", id);
  }

  // Query Logs
  public void logQueryExecution(String query) {
  logger.info("[DB-QUERY] 🧾 Executing: {}", query);
  }

  public void logQueryExecutionError(String query, Exception e) {
  logger.error("[DB-QUERY] ❌ Error in query: {} | {}", query, e.getMessage(), e);
  }

  // Overloaded Info Methods
  public void info(String msg) { logger.info("[DB-INFO] {}", msg); }
  public void info(String msg, Long a) { logger.info("[DB-INFO] " + msg, a); }
  public void info(String msg, Long a, Long b) { logger.info("[DB-INFO] " + msg, a, b); }
  public void info(String msg, String a, Long b) { logger.info("[DB-INFO] " + msg, a, b); }
  public void info(String msg, Long a, LocalDateTime b, LocalDateTime c) { logger.info("[DB-INFO] " + msg, a, b, c); }
  public void info(String msg, Long a, LocalDate b, LocalDate c) { logger.info("[DB-INFO] " + msg, a, b, c); }
  public void info(String msg, Long a, Long b, BigDecimal c) { logger.info("[DB-INFO] " + msg, a, b, c); }
  public void info(String msg, Long a, Long b, BigDecimal c, String d) { logger.info("[DB-INFO] " + msg, a, b, c, d); }
  public void info(String msg, Long a, LocalDateTime b, LocalDateTime c, LocalDate d, LocalDate e) { logger.info("[DB-INFO] " + msg, a, b, c, d, e); }
  public void info(String msg, Long a, int b) { logger.info("[DB-INFO] " + msg, a, b); }
  public void info(String msg, Long a, int b, Long c) { logger.info("[DB-INFO] " + msg, a, b, c); }
  public void info(String msg, Long a, Long b, BigDecimal c, Long d) { logger.info("[DB-INFO] " + msg, a, b, c, d); }
  public void info(String msg, DataSource ds) { logger.info("[DB-INFO] {}: {}", msg, ds); }
  public void info(String msg, String a) { logger.info("[DB-INFO] " + msg, a); }
  public void warn(String msg, String a) { logger.warn("[DB-WARN] " + msg, a); }
  public void error(String msg, String a, Exception e) { logger.error("[DB-ERROR] " + msg + ": {}", a, e.getMessage(), e); }
  public void error(String msg, Object... args) { logger.error("[DB-ERROR] " + msg, args); }

  // Utility
  public void log(String msg) { logger.info("[DB-INFO] {}", msg); }

  // Extra overloads
  public void info(String msg, Long a, String b, BigDecimal c, Long d) { logger.info("[DB-INFO] " + msg, a, b, c, d); }
  public void info(String msg, Long a, BigDecimal b, Long c) { logger.info("[DB-INFO] " + msg, a, b, c); }
  public void info(String msg, int a, Long b) { logger.info("[DB-INFO] " + msg, a, b); }
  public void info(String msg, int a) { logger.info("[DB-INFO] " + msg, a); }
  }
