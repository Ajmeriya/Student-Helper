package com.studenthelper.service;

import com.studenthelper.dto.PaymentRequest;
import com.studenthelper.dto.PaymentResponse;
import com.studenthelper.entity.*;
import com.studenthelper.mapper.PaymentMapper;
import com.studenthelper.repository.*;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

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

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PaymentMapper paymentMapper;

    @Override
    public PaymentResponse createPaymentOrder(Long payerId, PaymentRequest paymentRequest) {
        try {
            User payer = userRepository.findById(payerId)
                    .orElseThrow(() -> new RuntimeException("Payer not found"));

            // Convert DTO to Entity using ModelMapper
            Payment payment = modelMapper.map(paymentRequest, Payment.class);
            payment.setPayer(payer);
            payment.setPaymentType(paymentMapper.toPaymentType(paymentRequest.getPaymentType()));
            payment.setCurrency(paymentRequest.getCurrency() != null ? paymentRequest.getCurrency() : "INR");

            // Set entity and receiver based on payment type
            User receiver = null;
            Payment.PaymentType paymentType = paymentMapper.toPaymentType(paymentRequest.getPaymentType());
            switch (paymentType) {
                case PG_BOOKING:
                    PG pg = pgRepository.findById(paymentRequest.getEntityId())
                            .orElseThrow(() -> new RuntimeException("PG not found"));
                    payment.setPg(pg);
                    receiver = pg.getBroker();
                    break;
                case HOSTEL_BOOKING:
                    Hostel hostel = hostelRepository.findById(paymentRequest.getEntityId())
                            .orElseThrow(() -> new RuntimeException("Hostel not found"));
                    payment.setHostel(hostel);
                    receiver = hostel.getAdmin();
                    break;
                case ITEM_PURCHASE:
                    Item item = itemRepository.findById(paymentRequest.getEntityId())
                            .orElseThrow(() -> new RuntimeException("Item not found"));
                    payment.setItem(item);
                    receiver = item.getSeller();
                    break;
                default:
                    throw new RuntimeException("Invalid payment type");
            }

            payment.setReceiver(receiver);

            boolean isDummy = paymentRequest.getDummy() != null ? paymentRequest.getDummy() : true;
            if (isDummy) {
                // Dummy payment - simulate success immediately
                payment.setRazorpayOrderId("dummy_order_" + System.currentTimeMillis());
                payment.setRazorpayPaymentId("dummy_payment_" + System.currentTimeMillis());
                payment.setRazorpaySignature("dummy_signature_" + System.currentTimeMillis());
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                
                // Update entity status immediately for dummy payments
                updateEntityAfterPayment(payment);
                
                logger.info("Dummy payment created successfully for payer: {}, amount: {}", payerId, paymentRequest.getAmount());
            } else {
                // Real payment flow (disabled for demo)
                payment.setStatus(Payment.PaymentStatus.PENDING);
                payment.setRazorpayOrderId("demo_order_" + System.currentTimeMillis());
                logger.warn("Real payment flow disabled - using dummy mode");
            }

            Payment savedPayment = paymentRepository.save(payment);
            
            // Convert Entity to DTO and return
            return paymentMapper.toPaymentResponse(savedPayment);
        } catch (Exception e) {
            logger.error("Error creating payment order", e);
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
    }

    @Override
    public PaymentResponse verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
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
                Payment savedPayment = paymentRepository.save(payment);
                return paymentMapper.toPaymentResponse(savedPayment);
            }

            // Real payment verification (disabled for demo)
            logger.warn("Real payment verification disabled - using dummy mode");
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            updateEntityAfterPayment(payment);
            Payment savedPayment = paymentRepository.save(payment);
            return paymentMapper.toPaymentResponse(savedPayment);
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

    @Override
    public List<PaymentResponse> getPaymentsByPayer(Long payerId) {
        List<Payment> payments = paymentRepository.findByPayer_Id(payerId);
        return payments.stream()
                .map(paymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getPaymentsByReceiver(Long receiverId) {
        List<Payment> payments = paymentRepository.findByReceiver_Id(receiverId);
        return payments.stream()
                .map(paymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return paymentMapper.toPaymentResponse(payment);
    }
}

