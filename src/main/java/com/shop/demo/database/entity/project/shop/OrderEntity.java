package com.shop.demo.database.entity.project.shop;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class OrderEntity {

    public enum PaymentStatus { PENDING, PAID, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_gateway", length = 50)
    private String paymentGateway;

    @Column(name = "payment_ref", length = 255)
    private String paymentRef;

    @Column(name = "shiprocket_order_id", length = 100)
    private String shiprocketOrderId;

    @Column(name = "shiprocket_tracking_id", length = 100)
    private String shiprocketTrackingId;

    @Column(name = "shipping_status", length = 100)
    private String shippingStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentGateway() { return paymentGateway; }
    public void setPaymentGateway(String paymentGateway) { this.paymentGateway = paymentGateway; }
    public String getPaymentRef() { return paymentRef; }
    public void setPaymentRef(String paymentRef) { this.paymentRef = paymentRef; }
    public String getShiprocketOrderId() { return shiprocketOrderId; }
    public void setShiprocketOrderId(String id) { this.shiprocketOrderId = id; }
    public String getShiprocketTrackingId() { return shiprocketTrackingId; }
    public void setShiprocketTrackingId(String id) { this.shiprocketTrackingId = id; }
    public String getShippingStatus() { return shippingStatus; }
    public void setShippingStatus(String shippingStatus) { this.shippingStatus = shippingStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
