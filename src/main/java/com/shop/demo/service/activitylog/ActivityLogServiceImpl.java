package com.shop.demo.service.activitylog;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.demo.database.entity.project.ActivityLogEntity;
import com.shop.demo.database.repository.projectRepository.ActivityLogRepository;
import com.shop.demo.logMaintain.ApplicationLogger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository logRepository;
    private final ObjectMapper objectMapper;
    private final ApplicationLogger logger;

    public ActivityLogServiceImpl(ActivityLogRepository logRepository,
                                  ObjectMapper objectMapper,
                                  ApplicationLogger logger) {
        this.logRepository = logRepository;
        this.objectMapper  = objectMapper;
        this.logger        = logger;
    }

    @Override
    public void logEvent(Long userId, int roleMask, String eventType,
                         Map<String, Object> metadata, String ip) {
        try {
            ActivityLogEntity log = new ActivityLogEntity();
            log.setUserId(userId);
            log.setRoleMask(roleMask);
            log.setEventType(eventType);
            log.setIpAddress(ip);
            if (metadata != null) {
                log.setMetadata(objectMapper.writeValueAsString(metadata));
            }
            logRepository.save(log);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize activity log metadata for event {}", eventType, e);
        }
    }

    @Override public void logLogin(Long userId, int roleMask, String ip) {
        logEvent(userId, roleMask, "login", null, ip);
    }
    @Override public void logLogout(Long userId, int roleMask, String ip) {
        logEvent(userId, roleMask, "logout", null, ip);
    }
    @Override public void logRegister(Long userId, String ip) {
        logEvent(userId, 1, "user_register", null, ip);
    }
    @Override public void logDesignUpload(Long userId, Long customizationId, String area, String ip) {
        logEvent(userId, 1, "design_upload", Map.of("customization_id", customizationId, "area", area), ip);
    }
    @Override public void logSubmitReview(Long userId, Long customizationId, String ip) {
        logEvent(userId, 1, "submit_review", Map.of("customization_id", customizationId), ip);
    }
    @Override public void logCartAdd(Long userId, Long customizationId, String ip) {
        logEvent(userId, 1, "cart_add", Map.of("customization_id", customizationId), ip);
    }
    @Override public void logPurchase(Long userId, Long orderId, String ip) {
        logEvent(userId, 1, "purchase", Map.of("order_id", orderId), ip);
    }
    @Override public void logDesignApprove(Long techUserId, Long customizationId, Double price, String ip) {
        logEvent(techUserId, 4, "design_approve", Map.of("customization_id", customizationId, "price", price), ip);
    }
    @Override public void logDesignReject(Long techUserId, Long customizationId, String reason, String ip) {
        logEvent(techUserId, 4, "design_reject", Map.of("customization_id", customizationId, "reason", reason), ip);
    }
    @Override public void logGarmentAdd(Long techUserId, Long garmentId, String ip) {
        logEvent(techUserId, 4, "garment_add", Map.of("garment_id", garmentId), ip);
    }
    @Override public void logTicketOpen(Long supportUserId, Long ticketId, String ip) {
        logEvent(supportUserId, 8, "ticket_open", Map.of("ticket_id", ticketId), ip);
    }
    @Override public void logTicketReply(Long supportUserId, Long ticketId, String ip) {
        logEvent(supportUserId, 8, "ticket_reply", Map.of("ticket_id", ticketId), ip);
    }
    @Override public void logTicketEscalate(Long supportUserId, Long ticketId, String ip) {
        logEvent(supportUserId, 8, "ticket_escalate", Map.of("ticket_id", ticketId), ip);
    }
    @Override public void logUserRoleChange(Long adminUserId, Long targetUserId, int oldRole, int newRole, String ip) {
        logEvent(adminUserId, 2, "user_role_change",
                Map.of("target_user_id", targetUserId, "old_role", oldRole, "new_role", newRole), ip);
    }
    @Override public void logReturnDecision(Long adminUserId, Long ticketId, String decision, String ip) {
        logEvent(adminUserId, 2, "return_decision", Map.of("ticket_id", ticketId, "decision", decision), ip);
    }

    @Override
    public Page<ActivityLogEntity> getLogs(Integer roleMask, String eventType,
                                           LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return logRepository.findFiltered(roleMask, eventType, from, to, pageable);
    }

    @Override
    public Page<ActivityLogEntity> getStaffLogs(Pageable pageable) {
        return logRepository.findStaffLogs(pageable);
    }
}
