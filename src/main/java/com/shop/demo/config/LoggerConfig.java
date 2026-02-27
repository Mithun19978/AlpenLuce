package com.shop.demo.config;

import com.shop.demo.logMaintain.DatabaseLogger;

import com.shop.demo.logMaintain.FilterLogger;

import com.shop.demo.logMaintain.SslAndSecurityLogger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LoggerConfig {
    @Bean
    public DatabaseLogger databaseLogger() {
        return new DatabaseLogger();
    }

    @Bean
    public FilterLogger filterLogger() {
        return new FilterLogger();
    }


    @Bean
    public SslAndSecurityLogger sslLogger() {
        return new SslAndSecurityLogger();
    }
}