package com.studenthelper.mapper;

import com.studenthelper.dto.PaymentResponse;
import com.studenthelper.entity.Payment;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    @Autowired
    private ModelMapper modelMapper;

    public PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        PaymentResponse response = modelMapper.map(payment, PaymentResponse.class);
        
        // Map enums to strings
        if (payment.getPaymentType() != null) {
            response.setPaymentType(payment.getPaymentType().name());
        }
        if (payment.getStatus() != null) {
            response.setStatus(payment.getStatus().name());
        }

        // Map payer
        if (payment.getPayer() != null) {
            PaymentResponse.UserSummary payer = new PaymentResponse.UserSummary();
            payer.setId(payment.getPayer().getId());
            payer.setName(payment.getPayer().getName());
            payer.setEmail(payment.getPayer().getEmail());
            payer.setPhoneNumber(payment.getPayer().getPhoneNumber());
            response.setPayer(payer);
        }

        // Map receiver
        if (payment.getReceiver() != null) {
            PaymentResponse.UserSummary receiver = new PaymentResponse.UserSummary();
            receiver.setId(payment.getReceiver().getId());
            receiver.setName(payment.getReceiver().getName());
            receiver.setEmail(payment.getReceiver().getEmail());
            receiver.setPhoneNumber(payment.getReceiver().getPhoneNumber());
            response.setReceiver(receiver);
        }

        return response;
    }

    public Payment.PaymentType toPaymentType(String paymentTypeStr) {
        if (paymentTypeStr == null) {
            return null;
        }
        return Payment.PaymentType.valueOf(paymentTypeStr);
    }
}

