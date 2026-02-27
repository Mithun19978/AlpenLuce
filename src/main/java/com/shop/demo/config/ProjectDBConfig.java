package com.shop.demo.config;

import com.shop.demo.logMaintain.DatabaseLogger;
import com.shop.demo.propertiesReader.ApplicationProperties;
import com.shop.demo.propertiesReader.DatabaseProperties;
import com.shop.demo.resourceMapper.DatabaseMapper;
import com.shop.demo.service.auth.PasswordValidation;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.shop.demo.database.repository.projectRepository",
    entityManagerFactoryRef = "projectEntityManagerFactory",
    transactionManagerRef = "projectTransactionManager"
)
public class ProjectDBConfig {

    private static final Logger logger = LoggerFactory.getLogger(ProjectDBConfig.class);

    private final DatabaseProperties dbProps;
    private final DatabaseMapper mapper;
    private final DatabaseLogger dbLogger;
    private final ApplicationProperties appProps;
    private final PasswordValidation passwordValidation;

    private HikariDataSource projectDataSource;

    public ProjectDBConfig(
            DatabaseProperties dbProps,
            DatabaseMapper mapper,
            DatabaseLogger dbLogger,
            ApplicationProperties appProps,
            PasswordValidation passwordValidation) {
        this.dbProps = dbProps;
        this.mapper = mapper;
        this.dbLogger = dbLogger;
        this.appProps = appProps;
        this.passwordValidation = passwordValidation;
    }

    @PostConstruct
    public void initialize() {
        logger.info("🔧 Initializing ProjectDBConfig...");

        Properties props = new Properties();
        dbProps.getProperties().forEach(props::put);
        mapper.map(props);

        logger.info("➡ JDBC URL: {}", dbProps.getProjectJdbcUrl());
        dbLogger.logInfo("Using JDBC URL: {}", dbProps.getProjectJdbcUrl());

        this.projectDataSource = createDataSource();

        boolean shouldExecute = dbProps.getProperties()
                .getOrDefault("datasource.project.execution", "true")
                .equalsIgnoreCase("true");

        if (shouldExecute) {
            initializeSchema();
            initializeSuperAdmin();
        } else {
            logger.info("Skipping schema & superadmin init (datasource.project.execution = false)");
            dbLogger.logInfo("Skipping schema & superadmin init");
        }

        logger.info("✅ ProjectDBConfig fully initialized");
        dbLogger.logInfo("ProjectDBConfig fully initialized");
    }

    private HikariDataSource createDataSource() {
        logger.debug("Creating HikariDataSource for Project database");
        dbLogger.logDbConnection(dbProps.getProjectJdbcUrl(), dbProps.getProjectUsername());

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbProps.getProjectJdbcUrl());
        config.setUsername(dbProps.getProjectUsername());
        config.setPassword(dbProps.getProjectPassword());
        config.setDriverClassName(dbProps.getProjectDriverClassName());
        config.setMaximumPoolSize(dbProps.getProjectMaxPoolSize());
        config.setMinimumIdle(dbProps.getProjectMinIdle());
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

        try {
            HikariDataSource ds = new HikariDataSource(config);
            dbLogger.logDbConnectionSuccess(dbProps.getProjectJdbcUrl());
            logger.info("✅ HikariDataSource created for Project DB");
            return ds;
        } catch (Exception e) {
            dbLogger.logDbConnectionFailure(dbProps.getProjectJdbcUrl(), e);
            logger.error("❌ Failed to create HikariDataSource", e);
            throw new RuntimeException("Failed to connect to Project DB", e);
        }
    }

    private void initializeSchema() {
        logger.info("⚙️ Attempting to initialize Project database schema...");

        var project = mapper.getProject();
        String tableSqlPath = project.getTableSqlPath();
        String dataSqlPath = project.getDataSqlPath();

        if (tableSqlPath == null || tableSqlPath.trim().isEmpty() ||
            dataSqlPath == null || dataSqlPath.trim().isEmpty()) {
            logger.warn("SQL script paths are missing or empty → skipping schema initialization");
            dbLogger.logWarn("SQL script paths missing → skipping schema init");
            return;
        }

        String cleanTablePath = tableSqlPath.replace("file:///", "");
        String cleanDataPath = dataSqlPath.replace("file:///", "");

        if (!Files.exists(Paths.get(cleanTablePath)) || !Files.exists(Paths.get(cleanDataPath))) {
            logger.warn("One or both SQL files do not exist → skipping schema initialization");
            logger.warn("Table script: {}", cleanTablePath);
            logger.warn("Data script: {}", cleanDataPath);
            dbLogger.logWarn("SQL files not found → skipping schema init");
            return;
        }

        try (Connection conn = projectDataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            String tableSql = new String(Files.readAllBytes(Paths.get(cleanTablePath)));
            dbLogger.logQueryExecution(tableSql);
            executeMultiStatementSql(stmt, tableSql);

            String dataSql = new String(Files.readAllBytes(Paths.get(cleanDataPath)));
            dbLogger.logQueryExecution(dataSql);
            executeMultiStatementSql(stmt, dataSql);

            logger.info("✅ Project DB schema initialized successfully");
            dbLogger.logInfo("Project DB schema initialized successfully");
        } catch (IOException | SQLException e) {
            logger.warn("Failed to execute schema scripts (continuing startup)", e);
            dbLogger.logWarn("Schema init failed (startup continues)", e);
        }
    }

    private void executeMultiStatementSql(Statement stmt, String sql) throws SQLException {
        String[] statements = sql.split(";");
        for (String statement : statements) {
            String trimmed = statement.trim();
            if (!trimmed.isEmpty()) {
                logger.debug("Executing: {}", trimmed);
                stmt.execute(trimmed);
            }
        }
    }

    private void initializeSuperAdmin() {
        String username = appProps.getSupremeUserName();
        logger.info("🧑‍💼 Initializing Superadmin user: {}", username);
        dbLogger.logInfo("Initializing Superadmin user: {}", username);

        String sql = """
            INSERT INTO users (username, email, mobile_number, password, gender, role, creation_time, valid_till, last_access_time)
            SELECT ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), NOW()
            FROM DUAL
            WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ? OR email = ?)
            """;

        try (Connection conn = projectDataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            String password = appProps.getSupremeUserPassword();
            passwordValidation.validatePassword(password);

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String hashedPassword = encoder.encode(password);

            pstmt.setString(1, username);
            pstmt.setString(2, appProps.getSupremeUserMail());
            pstmt.setString(3, appProps.getSupremeUserMobileNumber());
            pstmt.setString(4, hashedPassword);
            pstmt.setInt(5, appProps.getSupremeUserGender());
            pstmt.setInt(6, appProps.getSupremeUserRole());
            pstmt.setString(7, username);
            pstmt.setString(8, appProps.getSupremeUserMail());

            int rows = pstmt.executeUpdate();
            if (rows > 0) {
                logger.info("✅ Superadmin '{}' created successfully", username);
                dbLogger.logInfo("✅ Superadmin '{}' created successfully", username);
            } else {
                logger.info("ℹ️ Superadmin '{}' already exists", username);
                dbLogger.logInfo("ℹ️ Superadmin '{}' already exists", username);
            }
        } catch (SQLException e) {
            logger.warn("Failed to create superadmin (startup continues)", e);
            dbLogger.logWarn("Superadmin creation failed (startup continues)", e);
        }
    }

    // Added this method so SessionConfig can call it if needed
    public DataSource getDataSource() {
        if (projectDataSource == null) {
            throw new IllegalStateException("DataSource not initialized yet");
        }
        return projectDataSource;
    }

    @Bean(name = "projectDataSource")
    @Primary
    public DataSource projectDataSourceBean() {
        logger.debug("Returning Project DataSource bean");
        return projectDataSource;
    }

    @Bean(name = "projectEntityManagerFactory")
    @Primary
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier("projectDataSource") DataSource dataSource) {

        logger.debug("Setting up projectEntityManagerFactory...");

        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan(
            "com.shop.demo.database.entity.project",
            "com.shop.demo.database.entity.project.financialTracker"
        );
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        em.setPersistenceUnitName("projectPersistenceUnit");

        Properties jpaProps = new Properties();
        jpaProps.setProperty("hibernate.show_sql", "true");
        jpaProps.setProperty("hibernate.format_sql", "true");
        jpaProps.setProperty("hibernate.hbm2ddl.auto", "validate");

        em.setJpaProperties(jpaProps);

        logger.info("✅ projectEntityManagerFactory configured");
        return em;
    }

    @Bean(name = "projectTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("projectEntityManagerFactory") EntityManagerFactory emf) {

        logger.debug("Setting up projectTransactionManager...");
        JpaTransactionManager txManager = new JpaTransactionManager(emf);
        logger.info("✅ projectTransactionManager configured successfully");
        return txManager;
    }
}