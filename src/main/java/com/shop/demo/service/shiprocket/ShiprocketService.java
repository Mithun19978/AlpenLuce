package com.shop.demo.service.shiprocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.demo.database.entity.project.shop.GarmentEntity;
import com.shop.demo.database.entity.project.shop.OrderEntity;
import com.shop.demo.database.entity.project.shop.OrderItemEntity;
import com.shop.demo.database.repository.projectRepository.shop.GarmentRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Integrates with Shiprocket to automate shipment creation after an order is placed.
 * All methods are best-effort: any Shiprocket failure is logged but never
 * propagates to the caller (so orders always succeed even if Shiprocket is down).
 *
 * Setup: fill in shiprocket.email + shiprocket.password in application.properties.
 * Leave them blank to run the app without Shiprocket.
 */
@Service
public class ShiprocketService {

    private static final String BASE = "https://apiv2.shiprocket.in/v1/external";

    @Value("${shiprocket.email:}")
    private String email;

    @Value("${shiprocket.password:}")
    private String password;

    @Value("${shiprocket.pickup-location:Primary}")
    private String pickupLocation;

    private final RestTemplate   restTemplate = new RestTemplate();
    private final ObjectMapper   mapper       = new ObjectMapper();
    private final ApplicationLogger logger;

    // Token cache — Shiprocket tokens last 24 h; we refresh every 23 h
    private String token;
    private long   tokenExpiry = 0;

    public ShiprocketService(ApplicationLogger logger) {
        this.logger = logger;
    }

    /**
     * Creates a Shiprocket shipment for the given order.
     * @return AWB tracking code, or null if Shiprocket is not configured / failed.
     */
    public String createShipment(OrderEntity order,
                                 List<OrderItemEntity> items,
                                 GarmentRepository garmentRepo) {
        if (email.isBlank() || password.isBlank()) {
            logger.info("Shiprocket not configured — skipping shipment for order {}", order.getId());
            return null;
        }

        String tok = getToken();
        if (tok == null) return null;

        try {
            // Build order_items array
            List<Map<String, Object>> srItems = new ArrayList<>();
            for (OrderItemEntity item : items) {
                GarmentEntity g = garmentRepo.findById(item.getGarmentId()).orElse(null);
                Map<String, Object> si = new LinkedHashMap<>();
                si.put("name",          g != null ? g.getName() + " (" + item.getSize() + ")" : "Item #" + item.getGarmentId());
                si.put("sku",           "AL-" + item.getGarmentId() + "-" + item.getSize());
                si.put("units",         item.getQuantity());
                si.put("selling_price", item.getUnitPrice().toPlainString());
                si.put("discount",      "");
                si.put("tax",           "");
                si.put("hsn",           0);
                srItems.add(si);
            }

            // Build payload
            String orderDate = order.getCreatedAt().toString().replace("T", " ").substring(0, 19);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("order_id",               "AL-" + order.getId());
            payload.put("order_date",             orderDate);
            payload.put("pickup_location",        pickupLocation);
            payload.put("billing_customer_name",  order.getShippingName());
            payload.put("billing_address",        order.getShippingAddress());
            payload.put("billing_city",           order.getShippingCity());
            payload.put("billing_pincode",        order.getShippingPincode());
            payload.put("billing_state",          "Tamil Nadu");   // default — adapt if storing state
            payload.put("billing_country",        "India");
            payload.put("billing_phone",          order.getShippingPhone());
            payload.put("billing_email",          "customer@alpenluce.com");
            payload.put("shipping_is_billing",    1);
            payload.put("order_items",            srItems);
            payload.put("payment_method",         "Prepaid");
            payload.put("sub_total",              order.getTotalAmount().toPlainString());
            payload.put("length",                 30);   // cm
            payload.put("breadth",                25);
            payload.put("height",                 5);
            payload.put("weight",                 0.5);  // kg

            HttpHeaders headers = jsonHeaders(tok);
            String body = mapper.writeValueAsString(payload);
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> res = restTemplate.postForEntity(
                    BASE + "/orders/create/adhoc", entity, String.class);

            JsonNode json = mapper.readTree(res.getBody());
            if (json.has("shipment_id")) {
                String awb = json.path("awb_code").asText(null);
                logger.info("Shiprocket shipment created: order={}, shipmentId={}, awb={}",
                        order.getId(), json.path("shipment_id").asText(), awb);
                return awb;
            }
            logger.info("Shiprocket response for order {}: {}", order.getId(), res.getBody());

        } catch (Exception e) {
            logger.info("Shiprocket createShipment failed for order {}: {}", order.getId(), e.getMessage());
        }
        return null;
    }

    // ── Token management ──────────────────────────────────────

    private String getToken() {
        if (token != null && System.currentTimeMillis() < tokenExpiry) return token;
        try {
            Map<String, String> creds = Map.of("email", email, "password", password);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(creds), headers);

            ResponseEntity<String> res = restTemplate.postForEntity(
                    BASE + "/auth/login", entity, String.class);

            JsonNode json = mapper.readTree(res.getBody());
            token       = json.path("token").asText(null);
            tokenExpiry = System.currentTimeMillis() + 23L * 60 * 60 * 1000; // 23 h
            logger.info("Shiprocket authentication successful");
            return token;
        } catch (Exception e) {
            logger.info("Shiprocket authentication failed: {}", e.getMessage());
            return null;
        }
    }

    private HttpHeaders jsonHeaders(String tok) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(tok);
        return h;
    }
}
