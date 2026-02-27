package com.shop.demo.database.repository.projectRepository.shop;

import com.shop.demo.database.entity.project.shop.SupportTicketEntity;
import com.shop.demo.database.entity.project.shop.SupportTicketEntity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicketEntity, Long> {
    List<SupportTicketEntity> findByUserId(Long userId);
    List<SupportTicketEntity> findByStatus(Status status);
    List<SupportTicketEntity> findByAssignedSupport(Long supportUserId);
    List<SupportTicketEntity> findByStatusOrderByCreatedAtDesc(Status status);
}
