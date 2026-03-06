package com.shop.demo.controller.shop;

import com.shop.demo.service.s3.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Handles product image uploads to Amazon S3.
 * Restricted to ADMIN (role&2) and TECH (role&4) users.
 * S3 is optional — enable via aws.s3.enabled=true in application.properties.
 */
@RestController
@RequestMapping("/server/admin/images")
public class ImageController {

    @Autowired(required = false)
    private S3Service s3Service;

    /**
     * POST /server/admin/images/upload
     * Accepts a multipart file named "file", uploads to S3, returns the public URL.
     */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Integer role = (Integer) request.getAttribute("userRole");
        if (role == null || (role & 6) == 0) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Access denied — admin or tech role required"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only image files are allowed"));
        }

        if (s3Service == null) {
            return ResponseEntity.status(503)
                    .body(Map.of("error", "S3 image upload is not configured. Set aws.s3.enabled=true and provide credentials in application.properties."));
        }

        try {
            String url = s3Service.uploadFile(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}
