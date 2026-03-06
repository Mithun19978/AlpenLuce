package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.GarmentEntity;
import com.shop.demo.database.repository.projectRepository.shop.GarmentRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class GarmentController {

    private final GarmentRepository garmentRepository;
    private final ApplicationLogger logger;

    public GarmentController(GarmentRepository garmentRepository,
                             ApplicationLogger logger) {
        this.garmentRepository = garmentRepository;
        this.logger            = logger;
    }

    // ─────────────────────────────────────────────────────────
    // PUBLIC ENDPOINTS
    // ─────────────────────────────────────────────────────────

    /** All active garments — public shop listing */
    @GetMapping("/server/garments")
    public List<GarmentEntity> getActiveGarments() {
        return garmentRepository.findByActiveTrueOrderByGarmentTypeAscIdAsc();
    }

    /**
     * Featured garments for home page — active + featured, split by gender.
     * Response: { mens: [max 4], womens: [max 4], kids: [max 4] }
     */
    @GetMapping("/server/garments/featured")
    public Map<String, List<GarmentEntity>> getFeaturedGarments() {
        List<GarmentEntity> mens   = garmentRepository
                .findByGarmentTypeAndActiveTrueAndFeaturedTrue("mens");
        List<GarmentEntity> womens = garmentRepository
                .findByGarmentTypeAndActiveTrueAndFeaturedTrue("womens");
        List<GarmentEntity> kids   = garmentRepository
                .findByGarmentTypeAndActiveTrueAndFeaturedTrue("kids");

        Map<String, List<GarmentEntity>> result = new HashMap<>();
        result.put("mens",   mens.size()   > 4 ? mens.subList(0, 4)   : mens);
        result.put("womens", womens.size() > 4 ? womens.subList(0, 4) : womens);
        result.put("kids",   kids.size()   > 4 ? kids.subList(0, 4)   : kids);
        return result;
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN / TECH ENDPOINTS
    // ─────────────────────────────────────────────────────────

    /** Admin/Tech — all garments including inactive */
    @GetMapping("/server/admin/garments")
    public List<GarmentEntity> getAllGarments() {
        return garmentRepository.findAll();
    }

    /** Admin/Tech — create a new garment */
    @PostMapping("/server/admin/garments")
    public ResponseEntity<GarmentEntity> createGarment(
            @RequestBody AdminGarmentRequest request,
            HttpServletRequest httpRequest) {

        GarmentEntity g = new GarmentEntity();
        applyRequest(g, request);
        g.setActive(true);
        g.setFeatured(false);
        GarmentEntity saved = garmentRepository.save(g);
        logger.info("Garment created: id={}, name={}", saved.getId(), saved.getName());
        return ResponseEntity.ok(saved);
    }

    /** Admin/Tech — bulk create (e.g. multiple color variants of one product) */
    @PostMapping("/server/admin/garments/bulk")
    public ResponseEntity<List<GarmentEntity>> createGarmentsBulk(
            @RequestBody List<AdminGarmentRequest> requests) {

        List<GarmentEntity> created = new ArrayList<>();
        for (AdminGarmentRequest r : requests) {
            GarmentEntity g = new GarmentEntity();
            applyRequest(g, r);
            g.setActive(true);
            g.setFeatured(false);
            created.add(garmentRepository.save(g));
        }
        logger.info("Bulk garment creation: {} garments created", created.size());
        return ResponseEntity.ok(created);
    }

    /** Admin/Tech — full update of a garment */
    @PutMapping("/server/admin/garments/{id}")
    public ResponseEntity<GarmentEntity> updateGarment(
            @PathVariable Long id,
            @RequestBody AdminGarmentRequest request) {

        return garmentRepository.findById(id).map(g -> {
            applyRequest(g, request);
            GarmentEntity saved = garmentRepository.save(g);
            logger.info("Garment updated: id={}", id);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().<GarmentEntity>build());
    }

    /** Admin/Tech — toggle active state */
    @PatchMapping("/server/admin/garments/{id}/active")
    public ResponseEntity<Map<String, String>> setActive(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return garmentRepository.findById(id).map(g -> {
            g.setActive(active);
            garmentRepository.save(g);
            return ResponseEntity.ok(Map.of("message", "Garment active=" + active));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    /** Admin/Tech — toggle featured (home page visibility) */
    @PatchMapping("/server/admin/garments/{id}/featured")
    public ResponseEntity<Map<String, String>> setFeatured(
            @PathVariable Long id,
            @RequestParam boolean featured) {

        return garmentRepository.findById(id).map(g -> {
            g.setFeatured(featured);
            garmentRepository.save(g);
            return ResponseEntity.ok(Map.of("message", "Garment featured=" + featured));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    /** Admin — delete a garment */
    @DeleteMapping("/server/admin/garments/{id}")
    public ResponseEntity<Map<String, String>> deleteGarment(@PathVariable Long id) {
        return garmentRepository.findById(id).map(g -> {
            garmentRepository.delete(g);
            logger.info("Garment deleted: id={}", id);
            return ResponseEntity.ok(Map.of("message", "Garment deleted"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    // ─────────────────────────────────────────────────────────
    // TECHNICAL ENDPOINTS (legacy path kept for compatibility)
    // ─────────────────────────────────────────────────────────

    /** Technical — toggle active state */
    @PatchMapping("/server/technical/garments/{id}/active")
    public ResponseEntity<Map<String, String>> setActiveTech(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return garmentRepository.findById(id).map(g -> {
            g.setActive(active);
            garmentRepository.save(g);
            return ResponseEntity.ok(Map.of("message", "Garment updated"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────

    private void applyRequest(GarmentEntity g, AdminGarmentRequest r) {
        if (r.name              != null) g.setName(r.name);
        if (r.description       != null) g.setDescription(r.description);
        if (r.garmentType       != null) g.setGarmentType(r.garmentType);
        if (r.categoryId        != null) g.setCategoryId(r.categoryId);
        if (r.basePrice         != null) g.setBasePrice(r.basePrice);
        if (r.baseColor         != null) g.setBaseColor(r.baseColor);
        if (r.gsm               != null) g.setGsm(r.gsm);
        if (r.fabricDescription != null) g.setFabricDescription(r.fabricDescription);
        if (r.type              != null) g.setType(r.type);
        if (r.imageUrl          != null) g.setImageUrl(r.imageUrl);
        if (r.sizes             != null) g.setSizes(r.sizes);
        if (r.stockQuantity     != null) g.setStockQuantity(r.stockQuantity);
        if (r.costPrice         != null) g.setCostPrice(r.costPrice);
    }

    public static class AdminGarmentRequest {
        public String  name;
        public String  description;
        public String  garmentType;        // mens | womens | kids | gym | couple | seasonal
        public Long    categoryId;         // FK → categories.id
        public Integer basePrice;
        public String  baseColor;
        public Integer gsm;
        public String  fabricDescription;
        public String  type;               // legacy product type label
        public String  imageUrl;           // S3 image URL
        public String  sizes;              // e.g. "S,M,L,XL,XXL"
        public Integer stockQuantity;      // available stock units
        public Integer costPrice;          // cost price for profit calculation
    }
}
