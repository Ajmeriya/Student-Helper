package com.studenthelper.controller;

import com.studenthelper.dto.ApiResponse;
import com.studenthelper.dto.PGFilterRequest;
import com.studenthelper.dto.PGRequest;
import com.studenthelper.dto.PGResponse;
import com.studenthelper.entity.User;
import com.studenthelper.service.CloudinaryService;
import com.studenthelper.service.PGService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pg")
@CrossOrigin(origins = "*")
public class PGController {

    private static final Logger logger = LoggerFactory.getLogger(PGController.class);

    @Autowired
    private PGService pgService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // Register custom property editor for Boolean to handle form-data string values
        binder.registerCustomEditor(Boolean.class, new org.springframework.beans.propertyeditors.CustomBooleanEditor(true));
        // Avoid binding multipart files (images/videos) and plain date strings directly into DTO fields.
        binder.setDisallowedFields("images", "videos", "availabilityDate");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllPGs(
            PGFilterRequest filters,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<PGResponse> page = pgService.getAllPGs(filters, pageable);
        Map<String, Object> pagedData = new LinkedHashMap<>();
        pagedData.put("content", page.getContent());
        pagedData.put("page", page.getNumber());
        pagedData.put("size", page.getSize());
        pagedData.put("totalElements", page.getTotalElements());
        pagedData.put("totalPages", page.getTotalPages());
        pagedData.put("sort", page.getSort().toString());
        return ResponseEntity.ok(ApiResponse.success(pagedData, page.getNumberOfElements()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PGResponse>> getPGById(@PathVariable Long id) {
        PGResponse pg = pgService.getPGById(id);
        return ResponseEntity.ok(ApiResponse.success(pg));
    }

    @PostMapping
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<ApiResponse<PGResponse>> createPG(
            @Valid @ModelAttribute PGRequest pgRequest,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        
        // Handle availabilityDate parsing if provided as string (form-data sends as string)
        parseAvailabilityDate(pgRequest, request);

        // Upload images and videos
        List<String> imageUrls = new ArrayList<>();
        if (images != null && images.length > 0) {
            try {
                imageUrls = cloudinaryService.uploadImages(
                    Arrays.asList(images), "student-helper/pgs");
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to upload images: " + e.getMessage(), e);
            }
        }

        List<String> videoUrls = new ArrayList<>();
        if (videos != null && videos.length > 0) {
            try {
                videoUrls = cloudinaryService.uploadVideos(
                    Arrays.asList(videos), "student-helper/pgs/videos");
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to upload videos: " + e.getMessage(), e);
            }
        }

        // Set uploaded file URLs
        pgRequest.setImages(imageUrls);
        pgRequest.setVideos(videoUrls);

        PGResponse createdPG = pgService.createPG(pgRequest, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdPG, "PG created successfully"));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<ApiResponse<PGResponse>> updatePG(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos,
            @ModelAttribute PGRequest pgRequest,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {

        // Handle availabilityDate parsing when provided via form-data as yyyy-MM-dd
        parseAvailabilityDate(pgRequest, request);
        
        // Upload new images and videos if provided
        if (images != null && images.length > 0) {
            try {
                List<String> newImageUrls = cloudinaryService.uploadImages(
                    java.util.Arrays.asList(images), "student-helper/pgs");
                if (pgRequest.getImages() != null) {
                    pgRequest.getImages().addAll(newImageUrls);
                } else {
                    pgRequest.setImages(newImageUrls);
                }
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to upload images: " + e.getMessage(), e);
            }
        }

        if (videos != null && videos.length > 0) {
            try {
                List<String> newVideoUrls = cloudinaryService.uploadVideos(
                    java.util.Arrays.asList(videos), "student-helper/pgs/videos");
                if (pgRequest.getVideos() != null) {
                    pgRequest.getVideos().addAll(newVideoUrls);
                } else {
                    pgRequest.setVideos(newVideoUrls);
                }
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to upload videos: " + e.getMessage(), e);
            }
        }

        PGResponse savedPG = pgService.updatePG(id, pgRequest, user.getId());
        return ResponseEntity.ok(ApiResponse.success(savedPG, "PG updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<ApiResponse<Void>> deletePG(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        pgService.deletePG(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "PG deleted successfully"));
    }

    @GetMapping("/my-pgs")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<ApiResponse<List<PGResponse>>> getMyPGs(@AuthenticationPrincipal User user) {
        List<PGResponse> pgs = pgService.getMyPGs(user.getId());
        return ResponseEntity.ok(ApiResponse.success(pgs, pgs.size()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<ApiResponse<PGResponse>> updatePGStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> statusData,
            @AuthenticationPrincipal User user) {
        String status = (String) statusData.get("status");
        if (status == null || !java.util.Arrays.asList("available", "sold", "onRent").contains(status)) {
            throw new IllegalArgumentException("Invalid status. Must be one of: available, sold, onRent");
        }

        PGResponse updatedPG = pgService.updatePGStatus(id, status, user.getId(), statusData);
        return ResponseEntity.ok(ApiResponse.success(updatedPG, "PG status updated successfully"));
    }
    
    // Helper method to parse availabilityDate from form-data (form-data sends as string)
    private void parseAvailabilityDate(PGRequest pgRequest, HttpServletRequest request) {
        String availabilityDateParam = request.getParameter("availabilityDate");
        if (availabilityDateParam != null && !availabilityDateParam.isEmpty() && pgRequest.getAvailabilityDate() == null) {
            try {
                pgRequest.setAvailabilityDate(LocalDateTime.parse(availabilityDateParam));
            } catch (Exception e) {
                try {
                    pgRequest.setAvailabilityDate(java.time.LocalDate.parse(availabilityDateParam).atStartOfDay());
                } catch (Exception e2) {
                    // Leave as null if parsing fails
                    logger.debug("Could not parse availabilityDate: {}", availabilityDateParam);
                }
            }
        }
    }
}

