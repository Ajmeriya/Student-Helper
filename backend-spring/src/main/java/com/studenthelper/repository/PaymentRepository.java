package com.studenthelper.repository;

import com.studenthelper.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findByPayer_Id(Long payerId);
    List<Payment> findByReceiver_Id(Long receiverId);
    List<Payment> findByPg_Id(Long pgId);
    List<Payment> findByHostel_Id(Long hostelId);
    List<Payment> findByItem_Id(Long itemId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
}

