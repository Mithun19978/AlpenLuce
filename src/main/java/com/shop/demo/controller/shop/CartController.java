package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.CartItemEntity;
import com.shop.demo.database.repository.projectRepository.shop.CartItemRepository;
import com.shop.demo.database.repository.projectRepository.shop.GarmentRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.service.activitylog.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/server/user/cart", produces = MediaType.APPLICATION_JSON_VALUE)
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final GarmentRepository garmentRepository;
    private final ActivityLogService activityLogService;
    private final ApplicationLogger logger;

    public CartController(CartItemRepository cartItemRepository,
                          GarmentRepository garmentRepository,
                          ActivityLogService activityLogService,
                          ApplicationLogger logger) {
        this.cartItemRepository = cartItemRepository;
        this.garmentRepository  = garmentRepository;
        this.activityLogService = activityLogService;
        this.logger             = logger;
    }

    public static class AddToCartRequest {
        public Long garmentId;
        public String size;
        public Integer quantity;
    }

    /** GET /server/user/cart – view cart */
    @GetMapping
    public ResponseEntity<List<CartItemEntity>> getCart(
            @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartItemRepository.findByUserId(userId));
    }

    /** POST /server/user/cart – add garment with size */
    @PostMapping
    public ResponseEntity<Map<String, String>> addToCart(
            @RequestBody AddToCartRequest request,
            @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {

        if (userId == null) return ResponseEntity.status(401).build();
        if (request.garmentId == null || request.size == null || request.size.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "garmentId and size are required"));
        }

        if (!garmentRepository.existsById(request.garmentId)) {
            return ResponseEntity.notFound().<Map<String, String>>build();
        }

        int qty = (request.quantity != null && request.quantity > 0) ? request.quantity : 1;

        cartItemRepository.findByUserIdAndGarmentIdAndSize(userId, request.garmentId, request.size)
                .ifPresentOrElse(
                        item -> {
                            item.setQuantity(item.getQuantity() + qty);
                            cartItemRepository.save(item);
                        },
                        () -> {
                            CartItemEntity item = new CartItemEntity();
                            item.setUserId(userId);
                            item.setGarmentId(request.garmentId);
                            item.setSize(request.size);
                            item.setQuantity(qty);
                            cartItemRepository.save(item);
                        }
                );

        activityLogService.logCartAdd(userId, request.garmentId, httpRequest.getRemoteAddr());
        logger.info("Cart add: userId={}, garmentId={}, size={}", userId, request.garmentId, request.size);
        return ResponseEntity.ok(Map.of("message", "Added to cart"));
    }

    /** PATCH /server/user/cart/{id} – update quantity */
    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        if (userId == null) return ResponseEntity.status(401).build();
        if (quantity < 1) return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be at least 1"));

        return cartItemRepository.findById(id).map(item -> {
            if (!item.getUserId().equals(userId)) {
                return ResponseEntity.status(403).<Map<String, String>>body(Map.of("error", "Forbidden"));
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
            return ResponseEntity.ok(Map.of("message", "Quantity updated"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    /** DELETE /server/user/cart/{id} – remove item */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeFromCart(
            @PathVariable Long id,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        if (userId == null) return ResponseEntity.status(401).build();

        return cartItemRepository.findById(id).map(item -> {
            if (!item.getUserId().equals(userId)) {
                return ResponseEntity.status(403).<Map<String, String>>body(Map.of("error", "Forbidden"));
            }
            cartItemRepository.delete(item);
            return ResponseEntity.ok(Map.of("message", "Removed from cart"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }
}
