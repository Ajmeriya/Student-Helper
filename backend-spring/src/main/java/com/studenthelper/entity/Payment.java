package com.studenthelper.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType;

    // For PG bookings
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pg_id")
    private PG pg;

    // For Hostel bookings
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hostel_id")
    private Hostel hostel;

    // For Item purchases
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Column(name = "booking_start_date")
    private LocalDateTime bookingStartDate;

    @Column(name = "booking_end_date")
    private LocalDateTime bookingEndDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED, CANCELLED
    }

    public enum PaymentType {
        PG_BOOKING, HOSTEL_BOOKING, ITEM_PURCHASE, SECURITY_DEPOSIT, MAINTENANCE
    }
}

