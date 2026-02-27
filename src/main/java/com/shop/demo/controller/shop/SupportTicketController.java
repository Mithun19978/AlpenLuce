package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.SupportTicketEntity;
import com.shop.demo.database.entity.project.shop.SupportTicketEntity.AdminDecision;
import com.shop.demo.database.entity.project.shop.SupportTicketEntity.Status;
import com.shop.demo.database.repository.projectRepository.shop.SupportTicketRepository;
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
public class SupportTicketController {

    private final SupportTicketRepository ticketRepository;
    private final ActivityLogService activityLogService;
    private final ApplicationLogger logger;

    public SupportTicketController(SupportTicketRepository ticketRepository,
                                   ActivityLogService activityLogService,
                                   ApplicationLogger logger) {
        this.ticketRepository   = ticketRepository;
        this.activityLogService = activityLogService;
        this.logger             = logger;
    }

    // ── USER: report an issue (no "return" button — report only) ──
    @PostMapping("/server/user/tickets")
    public ResponseEntity<Map<String, Object>> reportIssue(
            @RequestBody @Valid ReportRequest request,
            @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {

        if (userId == null) return ResponseEntity.status(401).build();

        SupportTicketEntity t = new SupportTicketEntity();
        t.setUserId(userId);
        t.setOrderId(request.orderId);
        t.setTitle(request.title);
        t.setDescription(request.description);
        t.setPhotoUrls(request.photoUrls);
        t.setStatus(Status.OPEN);
        SupportTicketEntity saved = ticketRepository.save(t);

        activityLogService.logTicketOpen(userId, saved.getId(), httpRequest.getRemoteAddr());
        logger.info("Support ticket created: id={}, userId={}", saved.getId(), userId);
        return ResponseEntity.ok(Map.of("message", "Issue reported", "ticketId", saved.getId()));
    }

    // ── USER: view own tickets ────────────────────────────────────
    @GetMapping("/server/user/tickets")
    public ResponseEntity<List<SupportTicketEntity>> getUserTickets(
            @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(ticketRepository.findByUserId(userId));
    }

    // ── SUPPORT: view open/escalated tickets ─────────────────────
    @GetMapping("/server/support/tickets")
    public List<SupportTicketEntity> getOpenTickets() {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(Status.OPEN);
    }

    // ── SUPPORT: escalate to admin ───────────────────────────────
    @PostMapping("/server/support/tickets/{id}/escalate")
    public ResponseEntity<Map<String, String>> escalate(
            @PathVariable Long id,
            @RequestAttribute(value = "userId", required = false) Long supportUserId,
            HttpServletRequest httpRequest) {

        return ticketRepository.findById(id).map(t -> {
            t.setStatus(Status.ESCALATED);
            t.setAssignedSupport(supportUserId);
            ticketRepository.save(t);
            if (supportUserId != null) {
                activityLogService.logTicketEscalate(supportUserId, id, httpRequest.getRemoteAddr());
            }
            logger.info("Ticket {} escalated by SUPPORT {}", id, supportUserId);
            return ResponseEntity.ok(Map.of("message", "Ticket escalated to admin"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    // ── ADMIN: view all escalated tickets ────────────────────────
    @GetMapping("/server/admin/tickets")
    public List<SupportTicketEntity> getEscalatedTickets() {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(Status.ESCALATED);
    }

    // ── ADMIN: approve or reject (final decision) ─────────────────
    @PostMapping("/server/admin/tickets/{id}/decide")
    public ResponseEntity<Map<String, String>> decide(
            @PathVariable Long id,
            @RequestBody @Valid DecideRequest request,
            @RequestAttribute(value = "userId", required = false) Long adminUserId,
            HttpServletRequest httpRequest) {

        return ticketRepository.findById(id).map(t -> {
            AdminDecision decision = AdminDecision.valueOf(request.decision.toUpperCase());
            t.setAdminDecision(decision);
            t.setAdminNote(request.note);
            t.setDecidedBy(adminUserId);
            t.setStatus(decision == AdminDecision.APPROVED ? Status.RESOLVED : Status.REJECTED);
            ticketRepository.save(t);

            if (adminUserId != null) {
                activityLogService.logReturnDecision(adminUserId, id, request.decision, httpRequest.getRemoteAddr());
            }
            logger.info("Ticket {} decided {} by ADMIN {}", id, request.decision, adminUserId);
            return ResponseEntity.ok(Map.of("message", "Decision recorded: " + request.decision));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    // ── DTOs ─────────────────────────────────────────────────────
    public static class ReportRequest {
        public Long orderId;
        @NotBlank public String title;
        public String description;
        public String photoUrls; // JSON array of Cloudinary URLs
    }

    public static class DecideRequest {
        @NotBlank public String decision; // APPROVED or REJECTED
        public String note;
    }
}
