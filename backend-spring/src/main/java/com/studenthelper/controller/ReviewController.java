package com.studenthelper.controller;

import com.studenthelper.entity.PG;
import com.studenthelper.entity.Review;
import com.studenthelper.entity.User;
import com.studenthelper.repository.PGRepository;
import com.studenthelper.repository.ReviewRepository;
import com.studenthelper.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/review")
@CrossOrigin(origins = "*")
public class ReviewController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PGRepository pgRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/pg/{pgId}")
    public ResponseEntity<Map<String, Object>> createReview(
            @PathVariable Long pgId,
            @RequestBody Map<String, Object> reviewData,
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

            PG pg = pgRepository.findById(pgId)
                    .orElseThrow(() -> new RuntimeException("PG not found"));

            // Check if user already reviewed this PG
            if (reviewRepository.existsByUser_IdAndPg_Id(user.getId(), pgId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You have already reviewed this PG");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Integer rating = Integer.parseInt(reviewData.get("rating").toString());
            if (rating < 1 || rating > 5) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Rating must be between 1 and 5");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Review review = new Review();
            review.setUser(user);
            review.setPg(pg);
            review.setRating(rating);
            review.setComment((String) reviewData.getOrDefault("comment", ""));

            Review savedReview = reviewRepository.save(review);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("review", savedReview);
            response.put("message", "Review added successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating review", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/pg/{pgId}")
    public ResponseEntity<Map<String, Object>> getReviews(@PathVariable Long pgId) {
        try {
            List<Review> reviews = reviewRepository.findByPg_IdOrderByCreatedAtDesc(pgId);

            // Calculate average rating
            double avgRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviews);
            response.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
            response.put("totalReviews", reviews.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching reviews", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch reviews");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> updateReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> reviewData,
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

            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review not found"));

            if (!review.getUser().getId().equals(user.getId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Not authorized to update this review");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            if (reviewData.containsKey("rating")) {
                Integer rating = Integer.parseInt(reviewData.get("rating").toString());
                if (rating < 1 || rating > 5) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Rating must be between 1 and 5");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                review.setRating(rating);
            }

            if (reviewData.containsKey("comment")) {
                review.setComment((String) reviewData.get("comment"));
            }

            Review updatedReview = reviewRepository.save(review);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("review", updatedReview);
            response.put("message", "Review updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating review", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Long reviewId,
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

            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new RuntimeException("Review not found"));

            if (!review.getUser().getId().equals(user.getId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Not authorized to delete this review");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            reviewRepository.delete(review);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deleting review", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

