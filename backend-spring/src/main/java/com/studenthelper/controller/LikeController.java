package com.studenthelper.controller;

import com.studenthelper.entity.Like;
import com.studenthelper.entity.PG;
import com.studenthelper.entity.User;
import com.studenthelper.repository.LikeRepository;
import com.studenthelper.repository.PGRepository;
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
import java.util.Map;

@RestController
@RequestMapping("/api/like")
@CrossOrigin(origins = "*")
public class LikeController {

    private static final Logger logger = LoggerFactory.getLogger(LikeController.class);

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PGRepository pgRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/pg/{pgId}")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long pgId,
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

            var existingLike = likeRepository.findByUser_IdAndPg_Id(user.getId(), pgId);

            if (existingLike.isPresent()) {
                likeRepository.delete(existingLike.get());
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("liked", false);
                response.put("message", "Like removed");
                response.put("likeCount", likeRepository.countByPg_Id(pgId));
                return ResponseEntity.ok(response);
            } else {
                Like like = new Like();
                like.setUser(user);
                like.setPg(pg);
                likeRepository.save(like);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("liked", true);
                response.put("message", "Liked successfully");
                response.put("likeCount", likeRepository.countByPg_Id(pgId));
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            logger.error("Error toggling like", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to toggle like: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/pg/{pgId}")
    public ResponseEntity<Map<String, Object>> getLikeStatus(
            @PathVariable Long pgId,
            HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("user");
            if (user == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    user = (User) authentication.getPrincipal();
                }
            }

            boolean isLiked = false;
            if (user != null) {
                isLiked = likeRepository.existsByUser_IdAndPg_Id(user.getId(), pgId);
            }

            Long likeCount = likeRepository.countByPg_Id(pgId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("liked", isLiked);
            response.put("likeCount", likeCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting like status", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get like status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

