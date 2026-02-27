package com.shop.demo.database.entity.project.shop;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
public class SupportTicketEntity {

    public enum Status        { OPEN, ESCALATED, RESOLVED, REJECTED }
    public enum AdminDecision { APPROVED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_urls", columnDefinition = "JSON")
    private String photoUrls;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.OPEN;

    @Column(name = "assigned_support")
    private Long assignedSupport;

    @Enumerated(EnumType.STRING)
    @Column(name = "admin_decision")
    private AdminDecision adminDecision;

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    @Column(name = "decided_by")
    private Long decidedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(String photoUrls) { this.photoUrls = photoUrls; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Long getAssignedSupport() { return assignedSupport; }
    public void setAssignedSupport(Long assignedSupport) { this.assignedSupport = assignedSupport; }
    public AdminDecision getAdminDecision() { return adminDecision; }
    public void setAdminDecision(AdminDecision adminDecision) { this.adminDecision = adminDecision; }
    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    public Long getDecidedBy() { return decidedBy; }
    public void setDecidedBy(Long decidedBy) { this.decidedBy = decidedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
