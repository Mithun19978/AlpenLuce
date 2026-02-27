package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.CustomizationDesignEntity;
import com.shop.demo.database.entity.project.shop.CustomizationDesignEntity.Area;
import com.shop.demo.database.entity.project.shop.CustomizationEntity;
import com.shop.demo.database.entity.project.shop.CustomizationEntity.Status;
import com.shop.demo.database.repository.projectRepository.shop.CustomizationDesignRepository;
import com.shop.demo.database.repository.projectRepository.shop.CustomizationRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import com.shop.demo.service.activitylog.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class CustomizationController {

    private final CustomizationRepository customizationRepository;
    private final CustomizationDesignRepository designRepository;
    private final ActivityLogService activityLogService;
    private final ApplicationLogger logger;

    public CustomizationController(CustomizationRepository customizationRepository,
                                   CustomizationDesignRepository designRepository,
                                   ActivityLogService activityLogService,
                                   ApplicationLogger logger) {
        this.customizationRepository = customizationRepository;
        this.designRepository        = designRepository;
        this.activityLogService      = activityLogService;
        this.logger                  = logger;
    }

    // ── USER: submit a new customization ─────────────────────────
    @PostMapping("/server/user/customizations")
    public ResponseEntity<Map<String, Object>> submit(
            @RequestBody @Valid SubmitRequest request,
            @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {

        CustomizationEntity c = new CustomizationEntity();
        c.setUserId(userId);
        c.setGarmentId(request.garmentId);
        c.setBaseColor(request.baseColor);
        c.setGsm(request.gsm);
        c.setStatus(Status.PENDING);
        CustomizationEntity saved = customizationRepository.save(c);

        // Save design areas
        if (request.designs != null) {
            for (DesignDTO d : request.designs) {
                CustomizationDesignEntity de = new CustomizationDesignEntity();
                de.setCustomizationId(saved.getId());
                de.setArea(Area.valueOf(d.area));
                de.setCloudinaryUrl(d.cloudinaryUrl);
                de.setPosX(d.posX);
                de.setPosY(d.posY);
                de.setPosZ(d.posZ);
                de.setScale(d.scale);
                de.setRotation(d.rotation);
                designRepository.save(de);
                if (userId != null) {
                    activityLogService.logDesignUpload(userId, saved.getId(), d.area, httpRequest.getRemoteAddr());
                }
            }
        }

        if (userId != null) {
            activityLogService.logSubmitReview(userId, saved.getId(), httpRequest.getRemoteAddr());
        }
        logger.info("Customization submitted: id={}, userId={}", saved.getId(), userId);
        return ResponseEntity.ok(Map.of("message", "Submitted for review", "customizationId", saved.getId()));
    }

    // ── USER: view own customizations ────────────────────────────
    @GetMapping("/server/user/customizations")
    public ResponseEntity<List<CustomizationEntity>> getUserCustomizations(
            @RequestAttribute(value = "userId", required = false) Long userId) {

        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(customizationRepository.findByUserId(userId));
    }

    // ── TECHNICAL: view all pending ──────────────────────────────
    @GetMapping("/server/technical/customizations/pending")
    public List<CustomizationEntity> getPending() {
        return customizationRepository.findByStatus(Status.PENDING);
    }

    // ── TECHNICAL: approve + set price ───────────────────────────
    @PostMapping("/server/technical/customizations/{id}/approve")
    public ResponseEntity<Map<String, String>> approve(
            @PathVariable Long id,
            @RequestBody ApproveRequest request,
            @RequestAttribute(value = "userId", required = false) Long techUserId,
            HttpServletRequest httpRequest) {

        return customizationRepository.findById(id).map(c -> {
            c.setStatus(Status.APPROVED);
            c.setEstimatedPrice(BigDecimal.valueOf(request.price));
            c.setApprovedBy(techUserId);
            c.setApprovedAt(LocalDateTime.now());
            customizationRepository.save(c);

            if (techUserId != null) {
                activityLogService.logDesignApprove(techUserId, id, request.price, httpRequest.getRemoteAddr());
            }
            logger.info("Customization {} approved by TECHNICAL {}", id, techUserId);
            return ResponseEntity.ok(Map.of("message", "Customization approved"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    // ── TECHNICAL: reject ────────────────────────────────────────
    @PostMapping("/server/technical/customizations/{id}/reject")
    public ResponseEntity<Map<String, String>> reject(
            @PathVariable Long id,
            @RequestBody RejectRequest request,
            @RequestAttribute(value = "userId", required = false) Long techUserId,
            HttpServletRequest httpRequest) {

        return customizationRepository.findById(id).map(c -> {
            c.setStatus(Status.REJECTED);
            c.setRejectionReason(request.reason);
            customizationRepository.save(c);

            if (techUserId != null) {
                activityLogService.logDesignReject(techUserId, id, request.reason, httpRequest.getRemoteAddr());
            }
            logger.info("Customization {} rejected by TECHNICAL {}", id, techUserId);
            return ResponseEntity.ok(Map.of("message", "Customization rejected"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    // ── DTOs ─────────────────────────────────────────────────────
    public static class SubmitRequest {
        @NotNull public Long   garmentId;
        public String  baseColor;
        public Integer gsm;
        public List<DesignDTO> designs;
    }

    public static class DesignDTO {
        public String area;
        public String cloudinaryUrl;
        public double posX, posY, posZ;
        public double scale    = 1.0;
        public double rotation = 0.0;
    }

    public static class ApproveRequest {
        @NotNull public Double price;
    }

    public static class RejectRequest {
        public String reason;
    }
}
