package com.shop.demo.controller.shop;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shop.demo.database.entity.project.shop.CartItemEntity;
import com.shop.demo.database.entity.project.shop.GarmentEntity;
import com.shop.demo.database.entity.project.shop.OrderEntity;
import com.shop.demo.database.entity.project.shop.OrderItemEntity;
import com.shop.demo.database.repository.projectRepository.shop.CartItemRepository;
import com.shop.demo.database.repository.projectRepository.shop.GarmentRepository;
import com.shop.demo.database.repository.projectRepository.shop.OrderItemRepository;
import com.shop.demo.database.repository.projectRepository.shop.OrderRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.service.activitylog.ActivityLogService;
import com.shop.demo.service.shiprocket.ShiprocketService;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class PaymentController {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    private final OrderRepository         orderRepository;
    private final OrderItemRepository     orderItemRepository;
    private final CartItemRepository      cartItemRepository;
    private final GarmentRepository       garmentRepository;
    private final ActivityLogService      activityLogService;
    private final TransactionTemplate     transactionTemplate;
    private final ShiprocketService       shiprocketService;
    private final ApplicationLogger       logger;

    public PaymentController(OrderRepository orderRepository,
                             OrderItemRepository orderItemRepository,
                             CartItemRepository cartItemRepository,
                             GarmentRepository garmentRepository,
                             ActivityLogService activityLogService,
                             TransactionTemplate transactionTemplate,
                             ShiprocketService shiprocketService,
                             ApplicationLogger logger) {
        this.orderRepository     = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository  = cartItemRepository;
        this.garmentRepository   = garmentRepository;
        this.activityLogService  = activityLogService;
        this.transactionTemplate = transactionTemplate;
        this.shiprocketService   = shiprocketService;
        this.logger              = logger;
    }

    // ── Step 1: create Razorpay order ────────────────────────
    @PostMapping("/server/user/payment/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequest req,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        if (userId == null) return ResponseEntity.status(401).build();
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject params = new JSONObject();
            params.put("amount",   req.amountInPaise);
            params.put("currency", "INR");
            params.put("receipt",  "al_" + System.currentTimeMillis());
            Order order = client.orders.create(params);

            logger.info("Razorpay order created: id={}, userId={}", order.get("id"), userId);
            return ResponseEntity.ok(Map.of(
                    "razorpayOrderId", order.get("id").toString(),
                    "amount",          order.get("amount"),
                    "currency",        "INR",
                    "keyId",           keyId
            ));
        } catch (RazorpayException e) {
            logger.info("Razorpay order creation failed for userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Payment initialization failed. Check Razorpay configuration."));
        }
    }

    // ── Step 2: verify signature → place order → shiprocket ──
    @PostMapping("/server/user/payment/verify")
    public ResponseEntity<?> verifyAndPlaceOrder(
            @RequestBody VerifyRequest req,
            @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {

        if (userId == null) return ResponseEntity.status(401).build();

        // Verify HMAC-SHA256 signature
        if (!verifyHmac(req.razorpayOrderId + "|" + req.razorpayPaymentId, keySecret, req.razorpaySignature)) {
            logger.info("Razorpay signature mismatch for userId={}", userId);
            return ResponseEntity.status(400).body(Map.of("error", "Payment verification failed"));
        }

        // Place order atomically
        List<CartItemEntity> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        Map<String, Object> result = transactionTemplate.execute(status -> {
            BigDecimal total = BigDecimal.ZERO;
            for (CartItemEntity ci : cartItems) {
                GarmentEntity g = garmentRepository.findById(ci.getGarmentId()).orElse(null);
                if (g != null && g.getBasePrice() != null) {
                    total = total.add(BigDecimal.valueOf(g.getBasePrice())
                            .multiply(BigDecimal.valueOf(ci.getQuantity())));
                }
            }

            OrderEntity order = new OrderEntity();
            order.setUserId(userId);
            order.setTotalAmount(total);
            order.setPaymentStatus(OrderEntity.PaymentStatus.PAID);
            order.setPaymentMethod("razorpay");
            order.setPaymentRef(req.razorpayPaymentId);
            order.setShippingName(req.shippingName);
            order.setShippingAddress(req.shippingAddress);
            order.setShippingCity(req.shippingCity);
            order.setShippingPincode(req.shippingPincode);
            order.setShippingPhone(req.shippingPhone);
            order.setOrderStatus(OrderEntity.OrderStatus.PLACED);
            OrderEntity saved = orderRepository.save(order);

            for (CartItemEntity ci : cartItems) {
                GarmentEntity g = garmentRepository.findById(ci.getGarmentId()).orElse(null);
                BigDecimal price = (g != null && g.getBasePrice() != null)
                        ? BigDecimal.valueOf(g.getBasePrice()) : BigDecimal.ZERO;
                OrderItemEntity oi = new OrderItemEntity();
                oi.setOrderId(saved.getId());
                oi.setGarmentId(ci.getGarmentId());
                oi.setSize(ci.getSize());
                oi.setQuantity(ci.getQuantity());
                oi.setUnitPrice(price);
                orderItemRepository.save(oi);
            }

            cartItemRepository.deleteByUserId(userId);

            Map<String, Object> res = new HashMap<>();
            res.put("id",      saved.getId());
            res.put("orderId", saved.getId());
            res.put("message", "Order placed successfully");
            return res;
        });

        if (result == null) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Order placement failed"));
        }

        Long orderId = (Long) result.get("id");
        activityLogService.logPurchase(userId, orderId, httpRequest.getRemoteAddr());
        logger.info("Order placed via Razorpay: userId={}, orderId={}", userId, orderId);

        // Trigger Shiprocket (best-effort — never fails the response)
        try {
            OrderEntity placed = orderRepository.findById(orderId).orElse(null);
            if (placed != null) {
                List<OrderItemEntity> items = orderItemRepository.findByOrderId(orderId);
                String awb = shiprocketService.createShipment(placed, items, garmentRepository);
                if (awb != null) {
                    placed.setTrackingAwb(awb);
                    orderRepository.save(placed);
                    result.put("trackingAwb", awb);
                }
            }
        } catch (Exception e) {
            logger.info("Shiprocket order creation skipped for orderId={}: {}", orderId, e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    // ── Razorpay Webhook (payment.captured / payment.failed) ─
    @PostMapping(value = "/server/webhook/razorpay", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> razorpayWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        if (webhookSecret.isBlank() || signature == null
                || !verifyHmac(rawBody, webhookSecret, signature)) {
            logger.info("Razorpay webhook signature invalid");
            return ResponseEntity.status(400).body(Map.of("error", "Invalid signature"));
        }

        try {
            JSONObject payload = new JSONObject(rawBody);
            String event = payload.optString("event", "");
            logger.info("Razorpay webhook received: event={}", event);

            if ("payment.captured".equals(event)) {
                String paymentId = payload.getJSONObject("payload")
                        .getJSONObject("payment").getJSONObject("entity").getString("id");
                orderRepository.findByPaymentRef(paymentId).ifPresent(order -> {
                    order.setPaymentStatus(OrderEntity.PaymentStatus.PAID);
                    orderRepository.save(order);
                    logger.info("Webhook: order {} marked PAID via payment {}", order.getId(), paymentId);
                });
            } else if ("payment.failed".equals(event)) {
                String paymentId = payload.getJSONObject("payload")
                        .getJSONObject("payment").getJSONObject("entity").getString("id");
                orderRepository.findByPaymentRef(paymentId).ifPresent(order -> {
                    order.setPaymentStatus(OrderEntity.PaymentStatus.FAILED);
                    orderRepository.save(order);
                    logger.info("Webhook: order {} marked FAILED via payment {}", order.getId(), paymentId);
                });
            }
        } catch (Exception e) {
            logger.info("Razorpay webhook processing error: {}", e.getMessage());
        }
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // ── Shiprocket Webhook (shipment status updates) ──────────
    @PostMapping(value = "/server/webhook/shiprocket", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> shiprocketWebhook(@RequestBody String rawBody) {
        try {
            JSONObject payload = new JSONObject(rawBody);
            String awb    = payload.optString("awb", "");
            String status = payload.optString("current_status", "");
            logger.info("Shiprocket webhook: awb={}, status={}", awb, status);

            if (!awb.isBlank()) {
                orderRepository.findByTrackingAwb(awb).ifPresent(order -> {
                    if ("Delivered".equalsIgnoreCase(status)) {
                        order.setOrderStatus(OrderEntity.OrderStatus.DELIVERED);
                    } else if ("Shipped".equalsIgnoreCase(status) || "In Transit".equalsIgnoreCase(status)) {
                        order.setOrderStatus(OrderEntity.OrderStatus.SHIPPED);
                    } else if ("Out For Delivery".equalsIgnoreCase(status)) {
                        order.setOrderStatus(OrderEntity.OrderStatus.SHIPPED);
                    }
                    orderRepository.save(order);
                    logger.info("Shiprocket webhook: order {} status → {}", order.getId(), status);
                });
            }
        } catch (Exception e) {
            logger.info("Shiprocket webhook processing error: {}", e.getMessage());
        }
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // ── HMAC-SHA256 helper ────────────────────────────────────
    private boolean verifyHmac(String data, String secret, String expectedHex) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString().equals(expectedHex);
        } catch (Exception e) {
            return false;
        }
    }

    // ── DTOs ──────────────────────────────────────────────────
    public static class CreateOrderRequest {
        public long amountInPaise;
    }

    public static class VerifyRequest {
        public String razorpayOrderId;
        public String razorpayPaymentId;
        public String razorpaySignature;
        // Shipping details (collected before payment)
        public String shippingName;
        public String shippingAddress;
        public String shippingCity;
        public String shippingPincode;
        public String shippingPhone;
    }
}
