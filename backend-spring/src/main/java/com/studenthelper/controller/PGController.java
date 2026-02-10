package com.studenthelper.controller;

import com.studenthelper.entity.PG;
import com.studenthelper.entity.User;
import com.studenthelper.service.CloudinaryService;
import com.studenthelper.service.PGService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
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

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPGs(@RequestParam Map<String, String> filters) {
        try {
            List<PG> pgs = pgService.getAllPGs(filters);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", pgs.size());
            response.put("pgs", pgs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching PGs", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching PGs");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPGById(@PathVariable Long id) {
        try {
            PG pg = pgService.getPGById(id);
            if (pg == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "PG not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("pg", pg);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching PG by ID: " + id, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching PG");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createPG(
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam String title,
            @RequestParam String location,
            @RequestParam String city,
            @RequestParam String collegeName,
            @RequestParam String sharingType,
            @RequestParam Integer bedrooms,
            @RequestParam Integer bathrooms,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam Double price,
            @RequestParam(required = false) Double securityDeposit,
            @RequestParam(required = false) Double maintenance,
            @RequestParam(required = false) String ac,
            @RequestParam(required = false) String furnished,
            @RequestParam(required = false) String ownerOnFirstFloor,
            @RequestParam(required = false) String foodAvailable,
            @RequestParam(required = false) String powerBackup,
            @RequestParam(required = false) String parking,
            @RequestParam(required = false) String waterSupply,
            @RequestParam(required = false) String preferredTenant,
            @RequestParam(required = false) String availabilityDate,
            @RequestParam(required = false) String nearbyLandmarks,
            @RequestParam(required = false) String instructions,
            HttpServletRequest request) {
        try {
            // Try to get user from SecurityContext first, then request attributes
            User user = null;
            Long userId = null;
            
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                user = (User) authentication.getPrincipal();
                userId = user.getId();
            } else {
                // Fallback to request attributes
                userId = (Long) request.getAttribute("userId");
                user = (User) request.getAttribute("user");
            }

            if (userId == null || user == null) {
                logger.error("Authentication failed for PG creation");
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Authentication required");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            if (user.getRole() != User.Role.broker) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Broker role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Create PG object manually
            PG pg = new PG();
            pg.setTitle(title);
            pg.setLocation(location);
            pg.setCity(city);
            pg.setCollegeName(collegeName);
            
            // Handle sharingType enum - convert "double" to "DOUBLE", others are lowercase
            if ("double".equalsIgnoreCase(sharingType)) {
                pg.setSharingType(PG.SharingType.DOUBLE);
            } else {
                try {
                    // Enum constants are: single, DOUBLE, triple, quad (mostly lowercase)
                    String normalized = sharingType.toLowerCase();
                    if ("single".equals(normalized)) {
                        pg.setSharingType(PG.SharingType.single);
                    } else if ("triple".equals(normalized)) {
                        pg.setSharingType(PG.SharingType.triple);
                    } else if ("quad".equals(normalized)) {
                        pg.setSharingType(PG.SharingType.quad);
                    } else {
                        // Try valueOf as fallback
                        pg.setSharingType(PG.SharingType.valueOf(sharingType));
                    }
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid sharingType: {}, defaulting to single", sharingType);
                    pg.setSharingType(PG.SharingType.single);
                }
            }
            
            pg.setBedrooms(bedrooms);
            pg.setBathrooms(bathrooms);
            pg.setFloorNumber(floorNumber != null ? floorNumber : 0);
            pg.setPrice(price);
            pg.setSecurityDeposit(securityDeposit != null ? securityDeposit : 0.0);
            pg.setMaintenance(maintenance != null ? maintenance : 0.0);
            
            // Boolean fields - parse from string (FormData sends everything as strings)
            pg.setAc(parseBoolean(ac));
            pg.setFurnished(parseBoolean(furnished));
            pg.setOwnerOnFirstFloor(parseBoolean(ownerOnFirstFloor));
            pg.setFoodAvailable(parseBoolean(foodAvailable));
            pg.setPowerBackup(parseBoolean(powerBackup));
            pg.setParking(parseBoolean(parking));
            
            // Handle waterSupply enum
            if (waterSupply != null && !waterSupply.isEmpty()) {
                if ("24x7".equals(waterSupply)) {
                    pg.setWaterSupply(PG.WaterSupply.FULL_24X7);
                } else if ("timing".equals(waterSupply)) {
                    pg.setWaterSupply(PG.WaterSupply.TIMING);
                } else if ("limited".equals(waterSupply)) {
                    pg.setWaterSupply(PG.WaterSupply.LIMITED);
                } else {
                    pg.setWaterSupply(PG.WaterSupply.EMPTY);
                }
            }
            
            // Handle preferredTenant enum
            if (preferredTenant != null && !preferredTenant.isEmpty()) {
                try {
                    pg.setPreferredTenant(PG.PreferredTenant.valueOf(preferredTenant.toLowerCase()));
                } catch (IllegalArgumentException e) {
                    pg.setPreferredTenant(PG.PreferredTenant.EMPTY);
                }
            } else {
                pg.setPreferredTenant(PG.PreferredTenant.EMPTY);
            }
            
            // Handle availabilityDate
            if (availabilityDate != null && !availabilityDate.isEmpty()) {
                try {
                    pg.setAvailabilityDate(java.time.LocalDateTime.parse(availabilityDate));
                } catch (Exception e) {
                    // Try parsing as date string
                    try {
                        java.time.LocalDate date = java.time.LocalDate.parse(availabilityDate);
                        pg.setAvailabilityDate(date.atStartOfDay());
                    } catch (Exception e2) {
                        // If parsing fails, set to null
                        pg.setAvailabilityDate(null);
                    }
                }
            }
            
            pg.setNearbyLandmarks(nearbyLandmarks);
            pg.setInstructions(instructions);
            
            // Set coordinates
            if (latitude != null && longitude != null) {
                PG.Coordinates coords = new PG.Coordinates();
                coords.setLat(latitude);
                coords.setLng(longitude);
                pg.setCoordinates(coords);
            }

            // Initialize images and videos lists (required for @ElementCollection)
            if (pg.getImages() == null) {
                pg.setImages(new ArrayList<>());
            }
            if (pg.getVideos() == null) {
                pg.setVideos(new ArrayList<>());
            }

            // Upload images
            if (images != null && images.length > 0) {
                List<String> imageUrls = cloudinaryService.uploadImages(
                    java.util.Arrays.asList(images), "student-helper/pgs");
                pg.setImages(imageUrls);
            }

            // Upload videos
            if (videos != null && videos.length > 0) {
                List<String> videoUrls = cloudinaryService.uploadVideos(
                    java.util.Arrays.asList(videos), "student-helper/pgs/videos");
                pg.setVideos(videoUrls);
            }

            // Ensure status and isActive are set (they have defaults but let's be explicit)
            if (pg.getStatus() == null) {
                pg.setStatus(PG.PGStatus.available);
            }
            if (pg.getIsActive() == null) {
                pg.setIsActive(true);
            }

            PG createdPG = pgService.createPG(pg, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PG created successfully");
            response.put("pg", createdPG);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating PG", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating PG");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updatePG(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos,
            @ModelAttribute PG updatedPG,
            HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            User user = (User) request.getAttribute("user");

            if (userId == null || user == null || user.getRole() != User.Role.broker) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            PG existingPG = pgService.getPGById(id);
            if (existingPG == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "PG not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Update fields
            if (updatedPG.getTitle() != null) existingPG.setTitle(updatedPG.getTitle());
            if (updatedPG.getLocation() != null) existingPG.setLocation(updatedPG.getLocation());
            if (updatedPG.getPrice() != null) existingPG.setPrice(updatedPG.getPrice());
            // Add more updates as needed

            if (images != null && images.length > 0) {
                List<String> newImageUrls = cloudinaryService.uploadImages(
                    java.util.Arrays.asList(images), "student-helper/pgs");
                if (existingPG.getImages() != null) {
                    existingPG.getImages().addAll(newImageUrls);
                } else {
                    existingPG.setImages(newImageUrls);
                }
            }

            if (videos != null && videos.length > 0) {
                List<String> newVideoUrls = cloudinaryService.uploadVideos(
                    java.util.Arrays.asList(videos), "student-helper/pgs/videos");
                if (existingPG.getVideos() != null) {
                    existingPG.getVideos().addAll(newVideoUrls);
                } else {
                    existingPG.setVideos(newVideoUrls);
                }
            }

            PG savedPG = pgService.updatePG(id, existingPG, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PG updated successfully");
            response.put("pg", savedPG);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating PG");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePG(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            User user = (User) request.getAttribute("user");

            if (userId == null || user == null || user.getRole() != User.Role.broker) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            pgService.deletePG(id, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PG deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting PG");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/my-pgs")
    public ResponseEntity<Map<String, Object>> getMyPGs(HttpServletRequest request) {
        try {
            // Get user from SecurityContext (same as createPG method)
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            User user = null;
            Long userId = null;
            
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                user = (User) authentication.getPrincipal();
                userId = user.getId();
            } else {
                // Fallback to request attributes
                userId = (Long) request.getAttribute("userId");
                user = (User) request.getAttribute("user");
            }

            if (userId == null || user == null || user.getRole() != User.Role.broker) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Broker role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            List<PG> pgs = pgService.getMyPGs(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", pgs.size());
            response.put("pgs", pgs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching my PGs", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching PGs");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePGStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> statusData,
            HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            User user = (User) request.getAttribute("user");

            if (userId == null || user == null || user.getRole() != User.Role.broker) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            String status = (String) statusData.get("status");
            if (status == null || !java.util.Arrays.asList("available", "sold", "onRent").contains(status)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid status");
                return ResponseEntity.badRequest().body(response);
            }

            PG updatedPG = pgService.updatePGStatus(id, status, userId, statusData);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "PG status updated successfully");
            response.put("pg", updatedPG);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating PG status");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Helper method to parse boolean from string (FormData sends everything as strings)
    private boolean parseBoolean(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        return "true".equalsIgnoreCase(value) || "1".equals(value) || Boolean.parseBoolean(value);
    }
}

