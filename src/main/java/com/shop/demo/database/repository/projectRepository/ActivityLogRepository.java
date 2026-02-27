package com.shop.demo.database.repository.projectRepository;

import com.shop.demo.database.entity.project.ActivityLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {

    Page<ActivityLogEntity> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT a FROM ActivityLogEntity a WHERE a.roleMask > 1 ORDER BY a.createdAt DESC")
    Page<ActivityLogEntity> findStaffLogs(Pageable pageable);

    @Query("SELECT a FROM ActivityLogEntity a WHERE " +
           "(:roleMask IS NULL OR a.roleMask = :roleMask) AND " +
           "(:eventType IS NULL OR a.eventType = :eventType) AND " +
           "(:from IS NULL OR a.createdAt >= :from) AND " +
           "(:to IS NULL OR a.createdAt <= :to) " +
           "ORDER BY a.createdAt DESC")
    Page<ActivityLogEntity> findFiltered(
            @Param("roleMask")  Integer roleMask,
            @Param("eventType") String eventType,
            @Param("from")      LocalDateTime from,
            @Param("to")        LocalDateTime to,
            Pageable pageable);
}
