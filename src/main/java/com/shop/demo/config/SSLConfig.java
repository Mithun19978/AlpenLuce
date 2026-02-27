package com.shop.demo.config;

import com.shop.demo.logMaintain.ApplicationLogger;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

public class SSLConfig {
    private final ApplicationLogger logger;
    private final RestTemplate restTemplate;

    public SSLConfig(ApplicationLogger logger) {
        this.logger = logger;
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        this.restTemplate = new RestTemplate(factory);
    }

    public RestTemplate getRestTemplate() {
        return restTemplate;
    }

    public void init() {
        logger.info("SSLConfig initialized with non-SSL RestTemplate");
    }
}