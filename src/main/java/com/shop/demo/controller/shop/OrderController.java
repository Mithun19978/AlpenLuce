package com.shop.demo.controller.shop;

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
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final GarmentRepository garmentRepository;
    private final ActivityLogService activityLogService;
    private final TransactionTemplate transactionTemplate;
    private final ApplicationLogger logger;

    public OrderController(OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           CartItemRepository cartItemRepository,
                           GarmentRepository garmentRepository,
                           ActivityLogService activityLogService,
                           TransactionTemplate transactionTemplate,
                           ApplicationLogger logger) {
        this.orderRepository     = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository  = cartItemRepository;
        this.garmentRepository   = garmentRepository;
        this.activityLogService  = activityLogService;
        this.transactionTemplate = transactionTemplate;
        this.logger              = logger;
    }

    public static class CheckoutRequest {
        public String shippingName;
        public String shippingAddress;
        public String shippingCity;
        public String shippingPincode;
        public String shippingPhone;
        public String paymentMethod;
        public String paymentRef;
    }

    /** GET /server/user/orders – list all orders for authenticated user */
    @GetMapping("/server/user/orders")
    public ResponseEntity<List<OrderEntity>> getMyOrders(
            @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    /** GET /server/user/orders/{id} – single order with items */
    @GetMapping("/server/user/orders/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(
            @PathVariable Long id,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        return orderRepository.findById(id).map(order -> {
            if (!order.getUserId().equals(userId)) {
                return ResponseEntity.status(403).<Map<String, Object>>build();
            }
            List<OrderItemEntity> items = orderItemRepository.findByOrderId(id);
            Map<String, Object> result = new HashMap<>();
            result.put("order", order);
            result.put("items", items);
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().<Map<String, Object>>build());
    }

    /** POST /server/user/checkout – place order from cart (mock payment) */
    @PostMapping("/server/user/checkout")
    public ResponseEntity<Map<String, Object>> checkout(
            @RequestBody CheckoutRequest request,
            @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {

        if (userId == null) return ResponseEntity.status(401).build();

        List<CartItemEntity> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Your cart is empty"));
        }

        Map<String, Object> result = transactionTemplate.execute(status -> {
            // compute total
            BigDecimal total = BigDecimal.ZERO;
            for (CartItemEntity ci : cartItems) {
                GarmentEntity g = garmentRepository.findById(ci.getGarmentId()).orElse(null);
                if (g != null && g.getBasePrice() != null) {
                    total = total.add(BigDecimal.valueOf(g.getBasePrice()).multiply(BigDecimal.valueOf(ci.getQuantity())));
                }
            }

            // create order
            OrderEntity order = new OrderEntity();
            order.setUserId(userId);
            order.setTotalAmount(total);
            order.setPaymentStatus(OrderEntity.PaymentStatus.PAID);
            order.setPaymentMethod(request.paymentMethod);
            order.setPaymentRef(request.paymentRef != null ? request.paymentRef : "MOCK-" + System.currentTimeMillis());
            order.setShippingName(request.shippingName);
            order.setShippingAddress(request.shippingAddress);
            order.setShippingCity(request.shippingCity);
            order.setShippingPincode(request.shippingPincode);
            order.setShippingPhone(request.shippingPhone);
            order.setOrderStatus(OrderEntity.OrderStatus.PLACED);
            OrderEntity savedOrder = orderRepository.save(order);

            // create order items + decrement stock
            for (CartItemEntity ci : cartItems) {
                GarmentEntity g = garmentRepository.findById(ci.getGarmentId()).orElse(null);
                BigDecimal price = (g != null && g.getBasePrice() != null)
                        ? BigDecimal.valueOf(g.getBasePrice())
                        : BigDecimal.ZERO;
                OrderItemEntity oi = new OrderItemEntity();
                oi.setOrderId(savedOrder.getId());
                oi.setGarmentId(ci.getGarmentId());
                oi.setSize(ci.getSize());
                oi.setQuantity(ci.getQuantity());
                oi.setUnitPrice(price);
                orderItemRepository.save(oi);
                // decrement stock (floor at 0)
                if (g != null) {
                    int current = g.getStockQuantity() != null ? g.getStockQuantity() : 0;
                    g.setStockQuantity(Math.max(0, current - ci.getQuantity()));
                    garmentRepository.save(g);
                }
            }

            // clear cart
            cartItemRepository.deleteByUserId(userId);

            Map<String, Object> res = new HashMap<>();
            res.put("orderId", savedOrder.getId());
            res.put("totalAmount", savedOrder.getTotalAmount());
            res.put("message", "Order placed successfully");
            return res;
        });

        if (result == null) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Checkout failed"));
        }

        Long orderId = (Long) result.get("orderId");
        activityLogService.logPurchase(userId, orderId, httpRequest.getRemoteAddr());
        logger.info("Order placed: userId={}, orderId={}", userId, orderId);
        return ResponseEntity.ok(result);
    }
}
