package com.shop.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Serves the Next.js static export from classpath:/static/.
 *
 * Resolution order for each request:
 *   1. Exact file match      → serves it (JS chunks, CSS, images, etc.)
 *   2. <path>/index.html     → serves it (trailingSlash=true pages)
 *   3. index.html (root)     → SPA fallback for unknown routes
 *
 * /server/** and /api/** are handled by Spring MVC controllers before
 * this handler is reached, so they are never served as static files.
 */
@Configuration
public class SpaConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location)
                            throws IOException {

                        // 1. Exact match (static assets: JS, CSS, images, fonts, _next/**)
                        Resource resource = super.getResource(resourcePath, location);
                        if (resource != null && resource.exists()) {
                            return resource;
                        }

                        // 2. <path>/index.html — Next.js trailingSlash=true pages
                        String cleanPath = resourcePath.replaceAll("/$", "");
                        Resource indexResource = super.getResource(cleanPath + "/index.html", location);
                        if (indexResource != null && indexResource.exists()) {
                            return indexResource;
                        }

                        // 3. SPA root fallback — unknown client-side routes
                        return super.getResource("index.html", location);
                    }
                });
    }
}
