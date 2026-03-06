package com.studenthelper.controller;

import com.studenthelper.dto.PaymentRequest;
import com.studenthelper.dto.PaymentResponse;
import com.studenthelper.entity.User;
import com.studenthelper.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
            @Valid @RequestBody PaymentRequest paymentRequest,
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

            PaymentResponse paymentResponse = paymentService.createPaymentOrder(user.getId(), paymentRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", paymentResponse.getRazorpayOrderId());
            response.put("amount", paymentResponse.getAmount());
            response.put("currency", paymentResponse.getCurrency());
            response.put("paymentId", paymentResponse.getId());
            response.put("payment", paymentResponse);
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

            PaymentResponse paymentResponse = paymentService.verifyPayment(
                    razorpayOrderId, razorpayPaymentId, razorpaySignature);

            Map<String, Object> response = new HashMap<>();
            response.put("success", "SUCCESS".equals(paymentResponse.getStatus()));
            response.put("message", "SUCCESS".equals(paymentResponse.getStatus())
                    ? "Payment verified successfully" : "Payment verification failed");
            response.put("payment", paymentResponse);
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

            List<PaymentResponse> paymentResponses = paymentService.getPaymentsByPayer(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", paymentResponses);
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

            List<PaymentResponse> paymentResponses = paymentService.getPaymentsByReceiver(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", paymentResponses);
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

