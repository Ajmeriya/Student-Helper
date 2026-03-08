package com.studenthelper.service;

import com.studenthelper.dto.PaymentRequest;
import com.studenthelper.dto.PaymentResponse;
import java.util.List;

public interface PaymentService {
    PaymentResponse createPaymentOrder(Long payerId, PaymentRequest paymentRequest);
    PaymentResponse verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature);
    List<PaymentResponse> getPaymentsByPayer(Long payerId);
    List<PaymentResponse> getPaymentsByReceiver(Long receiverId);
    PaymentResponse getPaymentById(Long paymentId);
}
