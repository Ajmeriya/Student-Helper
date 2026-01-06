package com.studenthelper.controller;

import com.studenthelper.entity.Payment;
import com.studenthelper.entity.User;
import com.studenthelper.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createPaymentOrder(
            @RequestBody Map<String, Object> requestData,
            HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("user");
            if (user == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    user = (User) authentication.getPrincipal();
                }
            }

            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String paymentTypeStr = (String) requestData.get("paymentType");
            Long entityId = Long.parseLong(requestData.get("entityId").toString());
            Double amount = Double.parseDouble(requestData.get("amount").toString());
            String currency = (String) requestData.getOrDefault("currency", "INR");

            Payment.PaymentType paymentType = Payment.PaymentType.valueOf(paymentTypeStr);

            LocalDateTime bookingStartDate = null;
            LocalDateTime bookingEndDate = null;
            if (requestData.containsKey("bookingStartDate")) {
                bookingStartDate = LocalDateTime.parse(requestData.get("bookingStartDate").toString());
            }
            if (requestData.containsKey("bookingEndDate")) {
                bookingEndDate = LocalDateTime.parse(requestData.get("bookingEndDate").toString());
            }

            String notes = (String) requestData.getOrDefault("notes", "");
            boolean isDummy = Boolean.parseBoolean(requestData.getOrDefault("dummy", "true").toString());

            Payment payment = paymentService.createPaymentOrder(
                    user.getId(), paymentType, entityId, amount, currency,
                    bookingStartDate, bookingEndDate, notes, isDummy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", payment.getRazorpayOrderId());
            response.put("amount", payment.getAmount());
            response.put("currency", payment.getCurrency());
            response.put("paymentId", payment.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating payment order", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create payment order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, Object> requestData,
            HttpServletRequest request) {
        try {
            String razorpayOrderId = (String) requestData.get("razorpayOrderId");
            String razorpayPaymentId = (String) requestData.get("razorpayPaymentId");
            String razorpaySignature = (String) requestData.get("razorpaySignature");

            // Try to get user for logging, but verification can proceed without auth (webhook scenario)
            User user = (User) request.getAttribute("user");
            if (user == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    user = (User) authentication.getPrincipal();
                }
            }

            Payment payment = paymentService.verifyPayment(
                    razorpayOrderId, razorpayPaymentId, razorpaySignature);

            Map<String, Object> response = new HashMap<>();
            response.put("success", payment.getStatus() == Payment.PaymentStatus.SUCCESS);
            response.put("message", payment.getStatus() == Payment.PaymentStatus.SUCCESS
                    ? "Payment verified successfully" : "Payment verification failed");
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error verifying payment", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to verify payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/my-payments")
    public ResponseEntity<Map<String, Object>> getMyPayments(HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("user");
            if (user == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    user = (User) authentication.getPrincipal();
                }
            }

            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            List<Payment> payments = paymentService.getPaymentsByPayer(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching payments", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payments");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/received-payments")
    public ResponseEntity<Map<String, Object>> getReceivedPayments(HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("user");
            if (user == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    user = (User) authentication.getPrincipal();
                }
            }

            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            List<Payment> payments = paymentService.getPaymentsByReceiver(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching received payments", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch received payments");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

