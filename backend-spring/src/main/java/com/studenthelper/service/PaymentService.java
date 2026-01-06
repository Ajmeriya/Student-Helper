package com.studenthelper.service;

import com.studenthelper.entity.*;
import com.studenthelper.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PGRepository pgRepository;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private ItemRepository itemRepository;

    public Payment createPaymentOrder(Long payerId, Payment.PaymentType paymentType, Long entityId, 
                                     Double amount, String currency, LocalDateTime bookingStartDate, 
                                     LocalDateTime bookingEndDate, String notes, boolean isDummy) {
        try {
            User payer = userRepository.findById(payerId)
                    .orElseThrow(() -> new RuntimeException("Payer not found"));

            Payment payment = new Payment();
            payment.setPayer(payer);
            payment.setPaymentType(paymentType);
            payment.setAmount(amount);
            payment.setCurrency(currency != null ? currency : "INR");
            payment.setBookingStartDate(bookingStartDate);
            payment.setBookingEndDate(bookingEndDate);
            payment.setNotes(notes);

            // Set entity and receiver based on payment type
            User receiver = null;
            switch (paymentType) {
                case PG_BOOKING:
                    PG pg = pgRepository.findById(entityId)
                            .orElseThrow(() -> new RuntimeException("PG not found"));
                    payment.setPg(pg);
                    receiver = pg.getBroker();
                    break;
                case HOSTEL_BOOKING:
                    Hostel hostel = hostelRepository.findById(entityId)
                            .orElseThrow(() -> new RuntimeException("Hostel not found"));
                    payment.setHostel(hostel);
                    receiver = hostel.getAdmin();
                    break;
                case ITEM_PURCHASE:
                    Item item = itemRepository.findById(entityId)
                            .orElseThrow(() -> new RuntimeException("Item not found"));
                    payment.setItem(item);
                    receiver = item.getSeller();
                    break;
                default:
                    throw new RuntimeException("Invalid payment type");
            }

            payment.setReceiver(receiver);

            if (isDummy) {
                // Dummy payment - simulate success immediately
                payment.setRazorpayOrderId("dummy_order_" + System.currentTimeMillis());
                payment.setRazorpayPaymentId("dummy_payment_" + System.currentTimeMillis());
                payment.setRazorpaySignature("dummy_signature_" + System.currentTimeMillis());
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                
                // Update entity status immediately for dummy payments
                updateEntityAfterPayment(payment);
                
                logger.info("Dummy payment created successfully for payer: {}, amount: {}", payerId, amount);
            } else {
                // Real payment flow (disabled for demo)
                payment.setStatus(Payment.PaymentStatus.PENDING);
                payment.setRazorpayOrderId("demo_order_" + System.currentTimeMillis());
                logger.warn("Real payment flow disabled - using dummy mode");
            }

            return paymentRepository.save(payment);
        } catch (Exception e) {
            logger.error("Error creating payment order", e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
    }

    public Payment verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            // For dummy payments, always succeed
            if (razorpayOrderId.startsWith("dummy_order_") || razorpayOrderId.startsWith("demo_order_")) {
                payment.setRazorpayPaymentId(razorpayPaymentId != null ? razorpayPaymentId : "dummy_payment_" + System.currentTimeMillis());
                payment.setRazorpaySignature(razorpaySignature != null ? razorpaySignature : "dummy_signature_" + System.currentTimeMillis());
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                
                // Update entity status based on payment type
                updateEntityAfterPayment(payment);
                
                logger.info("Dummy payment verified successfully for order: {}", razorpayOrderId);
                return paymentRepository.save(payment);
            }

            // Real payment verification (disabled for demo)
            logger.warn("Real payment verification disabled - using dummy mode");
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            updateEntityAfterPayment(payment);
            return paymentRepository.save(payment);
        } catch (Exception e) {
            logger.error("Error verifying payment", e);
            throw new RuntimeException("Failed to verify payment: " + e.getMessage());
        }
    }

    private void updateEntityAfterPayment(Payment payment) {
        try {
            switch (payment.getPaymentType()) {
                case PG_BOOKING:
                    // Mark PG as on rent or update status
                    if (payment.getPg() != null) {
                        PG pg = payment.getPg();
                        if (pg.getStatus() == PG.PGStatus.available) {
                            pg.setStatus(PG.PGStatus.onRent);
                            if (payment.getBookingStartDate() != null) {
                                pg.setRentalStartDate(payment.getBookingStartDate());
                            }
                            if (payment.getBookingEndDate() != null) {
                                pg.setRentalEndDate(payment.getBookingEndDate());
                            }
                            pgRepository.save(pg);
                        }
                    }
                    break;
                case HOSTEL_BOOKING:
                    // Decrease available rooms
                    if (payment.getHostel() != null) {
                        Hostel hostel = payment.getHostel();
                        if (hostel.getAvailableRooms() > 0) {
                            hostel.setAvailableRooms(hostel.getAvailableRooms() - 1);
                            hostelRepository.save(hostel);
                        }
                    }
                    break;
                case ITEM_PURCHASE:
                    // Mark item as sold
                    if (payment.getItem() != null) {
                        Item item = payment.getItem();
                        item.setStatus(Item.ItemStatus.sold);
                        itemRepository.save(item);
                    }
                    break;
                case SECURITY_DEPOSIT:
                case MAINTENANCE:
                    // These are additional payments, no entity status change needed
                    break;
            }
        } catch (Exception e) {
            logger.error("Error updating entity after payment", e);
        }
    }

    public List<Payment> getPaymentsByPayer(Long payerId) {
        return paymentRepository.findByPayer_Id(payerId);
    }

    public List<Payment> getPaymentsByReceiver(Long receiverId) {
        return paymentRepository.findByReceiver_Id(receiverId);
    }

    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}

