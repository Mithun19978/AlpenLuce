package com.shop.demo.service.activitylog;

import com.shop.demo.database.entity.project.ActivityLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Map;

public interface ActivityLogService {

    void logEvent(Long userId, int roleMask, String eventType, Map<String, Object> metadata, String ip);

    void logLogin(Long userId, int roleMask, String ip);
    void logLogout(Long userId, int roleMask, String ip);
    void logRegister(Long userId, String ip);
    void logCartAdd(Long userId, Long garmentId, String ip);
    void logPurchase(Long userId, Long orderId, String ip);

    void logGarmentAdd(Long adminUserId, Long garmentId, String ip);

    void logTicketOpen(Long supportUserId, Long ticketId, String ip);
    void logTicketReply(Long supportUserId, Long ticketId, String ip);
    void logTicketEscalate(Long supportUserId, Long ticketId, String ip);

    void logUserRoleChange(Long adminUserId, Long targetUserId, int oldRole, int newRole, String ip);
    void logReturnDecision(Long adminUserId, Long ticketId, String decision, String ip);

    Page<ActivityLogEntity> getLogs(Integer roleMask, String eventType,
                                    LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<ActivityLogEntity> getStaffLogs(Pageable pageable);
}
