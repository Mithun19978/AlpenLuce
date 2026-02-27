package com.shop.demo.resourceMapper;

import com.shop.demo.propertiesReader.ServerSSLProperties;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.Ssl;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ServerSSLMapper implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    private static final Logger logger = LoggerFactory.getLogger(ServerSSLMapper.class);
    private final ServerSSLProperties sslProperties;

    public ServerSSLMapper(ServerSSLProperties sslProperties) {
        this.sslProperties = sslProperties;
    }

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        if (sslProperties.isSslEnabled()) {
            try {
                logger.info("Configuring SSL with keystore: {}", sslProperties.getKeyStore());
                Ssl ssl = new Ssl();
                ssl.setEnabled(true);
                ssl.setKeyStore(sslProperties.getKeyStore().replace("file:///", ""));
                ssl.setKeyStoreType(sslProperties.getKeyStoreType());
                ssl.setKeyStorePassword(sslProperties.getKeyStorePassword());
                ssl.setKeyAlias(sslProperties.getKeyAlias());
                factory.setSsl(ssl);
                logger.info("SSL configuration applied successfully");
            } catch (Exception e) {
                logger.error("Failed to configure SSL: {}", e.getMessage(), e);
            }
        } else {
            logger.info("SSL is disabled (protocol is not https)");
        }
    }
}