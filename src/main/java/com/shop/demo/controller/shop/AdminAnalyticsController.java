package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.GarmentEntity;
import com.shop.demo.database.entity.project.shop.OrderItemEntity;
import com.shop.demo.database.repository.projectRepository.shop.GarmentRepository;
import com.shop.demo.database.repository.projectRepository.shop.OrderItemRepository;
import com.shop.demo.database.repository.projectRepository.shop.OrderRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminAnalyticsController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final GarmentRepository garmentRepository;

    public AdminAnalyticsController(OrderRepository orderRepository,
                                    OrderItemRepository orderItemRepository,
                                    GarmentRepository garmentRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.garmentRepository = garmentRepository;
    }

    /** GET /server/admin/analytics/summary — revenue, profit, sold units, top sellers, low stock */
    @GetMapping("/server/admin/analytics/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestAttribute(value = "userRole", required = false) Integer userRole) {
        if (userRole == null || (userRole & 2) == 0) {
            return ResponseEntity.status(403).build();
        }

        List<OrderItemEntity> allItems = orderItemRepository.findAll();
        List<GarmentEntity> allGarments = garmentRepository.findAll();
        long totalOrders = orderRepository.count();

        Map<Long, GarmentEntity> garmentMap = allGarments.stream()
                .collect(Collectors.toMap(GarmentEntity::getId, g -> g));

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        int totalUnitsSold = 0;
        Map<Long, Integer> unitsByGarment = new HashMap<>();
        Map<Long, BigDecimal> revenueByGarment = new HashMap<>();

        for (OrderItemEntity item : allItems) {
            BigDecimal lineRevenue = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalRevenue = totalRevenue.add(lineRevenue);
            totalUnitsSold += item.getQuantity();
            unitsByGarment.merge(item.getGarmentId(), item.getQuantity(), Integer::sum);
            revenueByGarment.merge(item.getGarmentId(), lineRevenue, BigDecimal::add);
            GarmentEntity g = garmentMap.get(item.getGarmentId());
            if (g != null && g.getCostPrice() != null && g.getCostPrice() > 0) {
                totalCost = totalCost.add(BigDecimal.valueOf(g.getCostPrice()).multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        BigDecimal totalProfit = totalRevenue.subtract(totalCost);

        // top 5 selling garments by units sold — includes revenue for financial view
        List<Map<String, Object>> topSelling = unitsByGarment.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    GarmentEntity g = garmentMap.get(e.getKey());
                    BigDecimal rev = revenueByGarment.getOrDefault(e.getKey(), BigDecimal.ZERO);
                    int units = e.getValue();
                    BigDecimal cost = (g != null && g.getCostPrice() != null && g.getCostPrice() > 0)
                            ? BigDecimal.valueOf(g.getCostPrice()).multiply(BigDecimal.valueOf(units))
                            : BigDecimal.ZERO;
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("garmentId", e.getKey());
                    entry.put("name", g != null ? g.getName() : "Unknown");
                    entry.put("color", g != null ? g.getBaseColor() : null);
                    entry.put("unitsSold", units);
                    entry.put("revenue", rev);
                    entry.put("profit", rev.subtract(cost));
                    return entry;
                })
                .collect(Collectors.toList());

        // top 5 by revenue (for financial breakdown)
        List<Map<String, Object>> topByRevenue = revenueByGarment.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    GarmentEntity g = garmentMap.get(e.getKey());
                    int units = unitsByGarment.getOrDefault(e.getKey(), 0);
                    BigDecimal rev = e.getValue();
                    BigDecimal cost = (g != null && g.getCostPrice() != null && g.getCostPrice() > 0)
                            ? BigDecimal.valueOf(g.getCostPrice()).multiply(BigDecimal.valueOf(units))
                            : BigDecimal.ZERO;
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("garmentId", e.getKey());
                    entry.put("name", g != null ? g.getName() : "Unknown");
                    entry.put("color", g != null ? g.getBaseColor() : null);
                    entry.put("unitsSold", units);
                    entry.put("revenue", rev);
                    entry.put("profit", rev.subtract(cost));
                    return entry;
                })
                .collect(Collectors.toList());

        // low stock: active garments with stock < 10
        List<Map<String, Object>> lowStock = allGarments.stream()
                .filter(g -> g.isActive() && g.getStockQuantity() != null && g.getStockQuantity() < 10)
                .sorted(Comparator.comparingInt(g -> (g.getStockQuantity() != null ? g.getStockQuantity() : 0)))
                .map(g -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("id", g.getId());
                    entry.put("name", g.getName());
                    entry.put("color", g.getBaseColor());
                    entry.put("stockQuantity", g.getStockQuantity());
                    return entry;
                })
                .collect(Collectors.toList());

        // total stock value = sum(basePrice * stockQuantity) for active garments
        BigDecimal totalStockValue = allGarments.stream()
                .filter(GarmentEntity::isActive)
                .map(g -> BigDecimal.valueOf(g.getBasePrice() != null ? g.getBasePrice() : 0)
                        .multiply(BigDecimal.valueOf(g.getStockQuantity() != null ? g.getStockQuantity() : 0)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalProfit", totalProfit);
        summary.put("totalOrders", totalOrders);
        summary.put("totalUnitsSold", totalUnitsSold);
        summary.put("totalStockValue", totalStockValue);
        summary.put("topSelling", topSelling);
        summary.put("topByRevenue", topByRevenue);
        summary.put("lowStockItems", lowStock);
        summary.put("lowStockCount", lowStock.size());

        return ResponseEntity.ok(summary);
    }
}
