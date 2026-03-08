package com.studenthelper.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentRequest {
    private String paymentType;
    private Long entityId;
    private Double amount;
    private String currency;
    private LocalDateTime bookingStartDate;
    private LocalDateTime bookingEndDate;
    private String notes;
    private Boolean dummy;
}

