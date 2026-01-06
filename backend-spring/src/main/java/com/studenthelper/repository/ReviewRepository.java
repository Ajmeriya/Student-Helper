package com.studenthelper.repository;

import com.studenthelper.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPg_IdOrderByCreatedAtDesc(Long pgId);
    List<Review> findByUser_Id(Long userId);
    boolean existsByUser_IdAndPg_Id(Long userId, Long pgId);
}

