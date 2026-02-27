package com.shop.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.demo.config.ProjectDBConfig;
import com.shop.demo.logMaintain.DatabaseLogger;
import com.shop.demo.propertiesReader.ApplicationProperties;
import com.shop.demo.propertiesReader.DatabaseProperties;
import com.shop.demo.propertiesReader.EnvironmentProperties;
import com.shop.demo.propertiesReader.ServerSSLProperties;
import com.shop.demo.resourceMapper.ApplicationMapper;
import com.shop.demo.resourceMapper.DatabaseMapper;
import com.shop.demo.resourceMapper.ServerSSLMapper;
import com.shop.demo.service.auth.PasswordValidation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.AutowireCandidateQualifier;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.session.jdbc.config.annotation.SpringSessionTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.sql.DataSource;

@SpringBootApplication(
    scanBasePackages = "com.shop.demo"
    // No exclusions — all auto-configurations are allowed to run
)
public class ShopApplication {

    private static final Logger logger = LoggerFactory.getLogger("com.shop.demo.logMaintain.ApplicationLogger");

    public static void main(String[] args) {
        EnvironmentProperties environmentProperties = new EnvironmentProperties();
        logger.info("Loaded EnvironmentProperties - Protocol: {}, Port: {}",
                environmentProperties.getProtocol(), environmentProperties.getPort());

        SpringApplication app = new SpringApplication(ShopApplication.class);
        app.run(args);
        logger.info("Application started successfully");
    }

    @Bean
    public static BeanRegistrar beanRegistrar() {
        return new BeanRegistrar();
    }

    @Bean
    public EnvironmentProperties environmentProperties() {
        return new EnvironmentProperties();
    }

    @Bean
    public ApplicationListener<ApplicationEnvironmentPreparedEvent> portConfigurer(EnvironmentProperties environmentProperties) {
        return event -> {
            String port = environmentProperties.getPort();
            event.getEnvironment().getPropertySources().addFirst(
                    new org.springframework.core.env.PropertiesPropertySource("dynamicPort",
                            new java.util.Properties() {{
                                setProperty("server.port", port);
                            }}
                    )
            );
        };
    }

    public static class BeanRegistrar implements BeanDefinitionRegistryPostProcessor {

        @Override
        public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
            registerDatabaseLogger(registry);
            registerDatabaseProperties(registry);
            registerDatabaseMapper(registry);
            registerApplicationProperties(registry);
            registerApplicationMapper(registry);
            registerEnvironmentProperties(registry);
            registerServerSSLProperties(registry);
            registerServerSSLMapper(registry);
            registerPasswordValidation(registry);
            registerProjectDBConfig(registry);
            registerProjectDataSource(registry);
            registerProjectTransactionManager(registry);
            registerJdbcTemplate(registry);
            registerSpringSessionTransactionManager(registry);     // ← fixes the tx manager ambiguity for Spring Session
            registerTransactionTemplate(registry);
            registerDataSourceAlias(registry);
            registerObjectMapper(registry);
        }

        @Override
        public void postProcessBeanFactory(org.springframework.beans.factory.config.ConfigurableListableBeanFactory beanFactory) {
            // No additional processing needed
        }

        // ───────────────────────────────────────────────────────────────
        //  Bean registration methods
        // ───────────────────────────────────────────────────────────────

        private void registerDatabaseLogger(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("databaseLogger",
                    BeanDefinitionBuilder.genericBeanDefinition(DatabaseLogger.class).getBeanDefinition());
        }

        private void registerDatabaseProperties(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("databaseProperties",
                    BeanDefinitionBuilder.genericBeanDefinition(DatabaseProperties.class).getBeanDefinition());
        }

        private void registerDatabaseMapper(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("databaseMapper",
                    BeanDefinitionBuilder.genericBeanDefinition(DatabaseMapper.class)
                            .addConstructorArgReference("databaseLogger")
                            .getBeanDefinition());
        }

        private void registerApplicationProperties(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("applicationProperties",
                    BeanDefinitionBuilder.genericBeanDefinition(ApplicationProperties.class).getBeanDefinition());
        }

        private void registerApplicationMapper(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("applicationMapper",
                    BeanDefinitionBuilder.genericBeanDefinition(ApplicationMapper.class)
                            .addConstructorArgReference("applicationProperties")
                            .getBeanDefinition());
        }

        private void registerEnvironmentProperties(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("environmentProperties",
                    BeanDefinitionBuilder.genericBeanDefinition(EnvironmentProperties.class).getBeanDefinition());
        }

        private void registerServerSSLProperties(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("serverSSLProperties",
                    BeanDefinitionBuilder.genericBeanDefinition(ServerSSLProperties.class)
                            .addConstructorArgReference("environmentProperties")
                            .getBeanDefinition());
        }

        private void registerServerSSLMapper(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("serverSSLMapper",
                    BeanDefinitionBuilder.genericBeanDefinition(ServerSSLMapper.class)
                            .addConstructorArgReference("serverSSLProperties")
                            .getBeanDefinition());
        }

        private void registerPasswordValidation(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("passwordValidation",
                    BeanDefinitionBuilder.genericBeanDefinition(PasswordValidation.class).getBeanDefinition());
        }

        private void registerProjectDBConfig(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("projectDBConfig",
                    BeanDefinitionBuilder.genericBeanDefinition(ProjectDBConfig.class)
                            .addConstructorArgReference("databaseProperties")
                            .addConstructorArgReference("databaseMapper")
                            .addConstructorArgReference("databaseLogger")
                            .addConstructorArgReference("applicationProperties")
                            .addConstructorArgReference("passwordValidation")
                            .getBeanDefinition());
        }

        private void registerProjectDataSource(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("projectDataSource",
                    BeanDefinitionBuilder.genericBeanDefinition(DataSource.class)
                            .setFactoryMethodOnBean("getDataSource", "projectDBConfig")
                            .getBeanDefinition());
        }

        private void registerProjectTransactionManager(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("projectTransactionManager",
                    BeanDefinitionBuilder.genericBeanDefinition(JpaTransactionManager.class)
                            .addPropertyReference("entityManagerFactory", "projectEntityManagerFactory")
                            .getBeanDefinition());
        }

        private void registerSpringSessionTransactionManager(BeanDefinitionRegistry registry) {
            BeanDefinitionBuilder builder = BeanDefinitionBuilder
                    .genericBeanDefinition(JdbcTransactionManager.class);

            builder.addConstructorArgReference("projectDataSource");

            // Compatible way — works in older Spring versions too
            AbstractBeanDefinition beanDef = builder.getBeanDefinition();
            beanDef.addQualifier(
                    new AutowireCandidateQualifier(SpringSessionTransactionManager.class)
            );

            registry.registerBeanDefinition("springSessionTransactionManager", beanDef);
        }

        private void registerJdbcTemplate(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("jdbcTemplate",
                    BeanDefinitionBuilder.genericBeanDefinition(JdbcTemplate.class)
                            .addConstructorArgReference("projectDataSource")
                            .getBeanDefinition());
        }

        private void registerTransactionTemplate(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("transactionTemplate",
                    BeanDefinitionBuilder.genericBeanDefinition(TransactionTemplate.class)
                            .addConstructorArgReference("projectTransactionManager")
                            .getBeanDefinition());
        }

        private void registerDataSourceAlias(BeanDefinitionRegistry registry) {
            registry.registerAlias("projectDataSource", "dataSource");
        }

        private void registerObjectMapper(BeanDefinitionRegistry registry) {
            registry.registerBeanDefinition("objectMapper",
                    BeanDefinitionBuilder.genericBeanDefinition(ObjectMapper.class).getBeanDefinition());
        }
    }
}