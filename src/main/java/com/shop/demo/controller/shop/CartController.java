package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.CartItemEntity;
import com.shop.demo.database.entity.project.shop.CustomizationEntity;
import com.shop.demo.database.entity.project.shop.CustomizationEntity.Status;
import com.shop.demo.database.repository.projectRepository.shop.CartItemRepository;
import com.shop.demo.database.repository.projectRepository.shop.CustomizationRepository;
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
    private final CustomizationRepository customizationRepository;
    private final ActivityLogService activityLogService;
    private final ApplicationLogger logger;

    public CartController(CartItemRepository cartItemRepository,
                          CustomizationRepository customizationRepository,
                          ActivityLogService activityLogService,
                          ApplicationLogger logger) {
        this.cartItemRepository      = cartItemRepository;
        this.customizationRepository = customizationRepository;
        this.activityLogService      = activityLogService;
        this.logger                  = logger;
    }

    /** GET /server/user/cart – view cart */
    @GetMapping
    public ResponseEntity<List<CartItemEntity>> getCart(
            @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartItemRepository.findByUserId(userId));
    }

    /** POST /server/user/cart – add approved customization */
    @PostMapping
    public ResponseEntity<Map<String, String>> addToCart(
            @RequestParam Long customizationId,
            @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {

        if (userId == null) return ResponseEntity.status(401).build();

        CustomizationEntity c = customizationRepository.findById(customizationId)
                .orElse(null);

        if (c == null) {
            return ResponseEntity.notFound().<Map<String, String>>build();
        }
        if (c.getStatus() != Status.APPROVED) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only approved customizations can be added to cart"));
        }
        if (!c.getUserId().equals(userId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "This customization does not belong to you"));
        }

        // Upsert: increment if already in cart
        cartItemRepository.findByUserIdAndCustomizationId(userId, customizationId)
                .ifPresentOrElse(
                        item -> {
                            item.setQuantity(item.getQuantity() + 1);
                            cartItemRepository.save(item);
                        },
                        () -> {
                            CartItemEntity item = new CartItemEntity();
                            item.setUserId(userId);
                            item.setCustomizationId(customizationId);
                            item.setQuantity(1);
                            cartItemRepository.save(item);
                        }
                );

        activityLogService.logCartAdd(userId, customizationId, httpRequest.getRemoteAddr());
        logger.info("Cart add: userId={}, customizationId={}", userId, customizationId);
        return ResponseEntity.ok(Map.of("message", "Added to cart"));
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
