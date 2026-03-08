package com.studenthelper.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private String paymentType;
    private Double amount;
    private String currency;
    private String status;
    private LocalDateTime bookingStartDate;
    private LocalDateTime bookingEndDate;
    private String notes;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private UserSummary payer;
    private UserSummary receiver;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
    }
}

