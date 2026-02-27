package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.GarmentEntity;
import com.shop.demo.database.repository.projectRepository.shop.GarmentRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.service.activitylog.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class GarmentController {

    private final GarmentRepository garmentRepository;
    private final ActivityLogService activityLogService;
    private final ApplicationLogger logger;

    public GarmentController(GarmentRepository garmentRepository,
                             ActivityLogService activityLogService,
                             ApplicationLogger logger) {
        this.garmentRepository  = garmentRepository;
        this.activityLogService = activityLogService;
        this.logger             = logger;
    }

    /** Public – all active garments */
    @GetMapping("/server/garments")
    public List<GarmentEntity> getActiveGarments() {
        return garmentRepository.findByActiveTrue();
    }

    /** TECHNICAL only – add new garment */
    @PostMapping("/server/technical/garments")
    public ResponseEntity<Map<String, Object>> addGarment(
            @RequestBody @Valid GarmentRequest request,
            @RequestAttribute(value = "userId", required = false) Long techUserId,
            HttpServletRequest httpRequest) {

        GarmentEntity g = new GarmentEntity();
        g.setType(request.type);
        g.setBaseColor(request.baseColor);
        g.setGsm(request.gsm);
        g.setFabricDescription(request.fabricDescription);
        g.setActive(true);
        GarmentEntity saved = garmentRepository.save(g);

        if (techUserId != null) {
            activityLogService.logGarmentAdd(techUserId, saved.getId(), httpRequest.getRemoteAddr());
        }
        logger.info("Garment added by TECHNICAL: id={}, type={}", saved.getId(), saved.getType());
        return ResponseEntity.ok(Map.of("message", "Garment added", "id", saved.getId()));
    }

    /** TECHNICAL only – toggle active */
    @PatchMapping("/server/technical/garments/{id}/active")
    public ResponseEntity<Map<String, String>> setActive(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return garmentRepository.findById(id).map(g -> {
            g.setActive(active);
            garmentRepository.save(g);
            return ResponseEntity.ok(Map.of("message", "Garment updated"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    public static class GarmentRequest {
        @NotBlank public String type;
        public String  baseColor;
        public Integer gsm;
        public String  fabricDescription;
    }
}
