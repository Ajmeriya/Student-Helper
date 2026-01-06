package com.studenthelper.controller;

import com.studenthelper.entity.Hostel;
import com.studenthelper.entity.User;
import com.studenthelper.repository.HostelRepository;
import com.studenthelper.repository.UserRepository;
import com.studenthelper.service.CloudinaryService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.util.*;

@RestController
@RequestMapping("/api/hostel")
@CrossOrigin(origins = "*")
public class HostelController {

    private static final Logger logger = LoggerFactory.getLogger(HostelController.class);

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.setDisallowedFields("facilities", "coordinates"); // Prevent Spring from binding these nested objects
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllHostels(@RequestParam Map<String, String> filters) {
        try {
            Specification<Hostel> spec = buildSpecification(filters);
            List<Hostel> hostels = hostelRepository.findAll(spec);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", hostels.size());
            response.put("hostels", hostels);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching hostels", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching hostels");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getHostelById(@PathVariable Long id) {
        try {
            Hostel hostel = hostelRepository.findById(id).orElse(null);
            if (hostel == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Hostel not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hostel", hostel);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching hostel");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createHostel(
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos,
            @RequestParam(required = false) MultipartFile[] roomType_single,
            @RequestParam(required = false) MultipartFile[] roomType_double,
            @RequestParam(required = false) MultipartFile[] roomType_triple,
            @RequestParam(required = false) MultipartFile[] roomType_quad,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam String name,
            @RequestParam String location,
            @RequestParam String city,
            @RequestParam(required = false) String address,
            @RequestParam String gender,
            @RequestParam Integer totalRooms,
            @RequestParam Integer availableRooms,
            @RequestParam Double fees,
            @RequestParam(required = false, defaultValue = "monthly") String feesPeriod,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String rules,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String contactEmail,
            HttpServletRequest request) {
        try {
            // Get user from SecurityContext (same as PG controller)
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

            if (userId == null || user == null || user.getRole() != User.Role.hostelAdmin) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. HostelAdmin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Create Hostel object manually
            Hostel hostel = new Hostel();
            hostel.setName(name);
            hostel.setLocation(location);
            hostel.setCity(city);
            hostel.setAddress(address);
            
            // Handle gender enum
            try {
                hostel.setGender(Hostel.Gender.valueOf(gender.toLowerCase()));
            } catch (IllegalArgumentException e) {
                hostel.setGender(Hostel.Gender.both); // Default
            }
            
            hostel.setTotalRooms(totalRooms);
            hostel.setAvailableRooms(availableRooms);
            hostel.setFees(fees);
            
            // Handle feesPeriod enum
            try {
                hostel.setFeesPeriod(Hostel.FeesPeriod.valueOf(feesPeriod.toLowerCase()));
            } catch (IllegalArgumentException e) {
                hostel.setFeesPeriod(Hostel.FeesPeriod.monthly); // Default
            }
            
            hostel.setDescription(description);
            hostel.setRules(rules);
            hostel.setContactNumber(contactNumber);
            hostel.setContactEmail(contactEmail);
            
            // Build Facilities object manually - extract from request parameters
            // Frontend sends facilities[gym], facilities[mess], etc.
            Hostel.Facilities facilities = new Hostel.Facilities();
            facilities.setMess(parseBoolean(request.getParameter("facilities[mess]")));
            facilities.setWifi(parseBoolean(request.getParameter("facilities[wifi]")));
            facilities.setLaundry(parseBoolean(request.getParameter("facilities[laundry]")));
            facilities.setGym(parseBoolean(request.getParameter("facilities[gym]")));
            facilities.setLibrary(parseBoolean(request.getParameter("facilities[library]")));
            facilities.setParking(parseBoolean(request.getParameter("facilities[parking]")));
            facilities.setSecurity(parseBoolean(request.getParameter("facilities[security]")));
            facilities.setPowerBackup(parseBoolean(request.getParameter("facilities[powerBackup]")));
            facilities.setWaterSupply(parseBoolean(request.getParameter("facilities[waterSupply]")));
            hostel.setFacilities(facilities);
            
            // Set coordinates
            if (latitude != null && longitude != null) {
                Hostel.Coordinates coords = new Hostel.Coordinates();
                coords.setLat(latitude);
                coords.setLng(longitude);
                hostel.setCoordinates(coords);
            }

            // Initialize lists
            if (hostel.getImages() == null) {
                hostel.setImages(new ArrayList<>());
            }
            if (hostel.getVideos() == null) {
                hostel.setVideos(new ArrayList<>());
            }

            // Upload images
            if (images != null && images.length > 0) {
                hostel.setImages(cloudinaryService.uploadImages(
                    Arrays.asList(images), "student-helper/hostels"));
            }

            // Upload videos
            if (videos != null && videos.length > 0) {
                hostel.setVideos(cloudinaryService.uploadVideos(
                    Arrays.asList(videos), "student-helper/hostels/videos"));
            }

            // Handle room type images
            Map<String, String> roomTypeImages = new HashMap<>();
            if (roomType_single != null && roomType_single.length > 0) {
                roomTypeImages.put("single", String.join(",", cloudinaryService.uploadImages(
                    Arrays.asList(roomType_single), "student-helper/hostels/rooms")));
            }
            if (roomType_double != null && roomType_double.length > 0) {
                roomTypeImages.put("double", String.join(",", cloudinaryService.uploadImages(
                    Arrays.asList(roomType_double), "student-helper/hostels/rooms")));
            }
            if (roomType_triple != null && roomType_triple.length > 0) {
                roomTypeImages.put("triple", String.join(",", cloudinaryService.uploadImages(
                    Arrays.asList(roomType_triple), "student-helper/hostels/rooms")));
            }
            if (roomType_quad != null && roomType_quad.length > 0) {
                roomTypeImages.put("quad", String.join(",", cloudinaryService.uploadImages(
                    Arrays.asList(roomType_quad), "student-helper/hostels/rooms")));
            }
            hostel.setRoomTypeImages(roomTypeImages);

            // Set admin and status
            User admin = userRepository.findById(userId).orElseThrow();
            hostel.setAdmin(admin);
            hostel.setStatus(Hostel.HostelStatus.active);

            Hostel createdHostel = hostelRepository.save(hostel);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hostel created successfully");
            response.put("hostel", createdHostel);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating hostel");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/my-hostels")
    public ResponseEntity<Map<String, Object>> getMyHostels(HttpServletRequest request) {
        try {
            // Get user from SecurityContext (same as PG controller)
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

            if (userId == null || user == null || user.getRole() != User.Role.hostelAdmin) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. HostelAdmin role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            List<Hostel> hostels = hostelRepository.findByAdmin_Id(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", hostels.size());
            response.put("hostels", hostels);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching hostels");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Specification<Hostel> buildSpecification(Map<String, String> filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Fix: Use correct syntax for IN clause
            predicates.add(root.get("status").in(Hostel.HostelStatus.active, Hostel.HostelStatus.full));

            if (filters.containsKey("city")) {
                predicates.add(cb.equal(root.get("city"), filters.get("city")));
            }

            if (filters.containsKey("gender")) {
                predicates.add(cb.equal(root.get("gender"), Hostel.Gender.valueOf(filters.get("gender"))));
            }

            if (filters.containsKey("minFees")) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fees"), Double.parseDouble(filters.get("minFees"))));
            }

            if (filters.containsKey("maxFees")) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fees"), Double.parseDouble(filters.get("maxFees"))));
            }

            if (filters.containsKey("search")) {
                String search = filters.get("search").toLowerCase();
                Predicate namePred = cb.like(cb.lower(root.get("name")), "%" + search + "%");
                Predicate locationPred = cb.like(cb.lower(root.get("location")), "%" + search + "%");
                Predicate addressPred = cb.like(cb.lower(root.get("address")), "%" + search + "%");
                predicates.add(cb.or(namePred, locationPred, addressPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    // Helper method to parse boolean from string (FormData sends everything as strings)
    private boolean parseBoolean(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        return "true".equalsIgnoreCase(value) || "1".equals(value) || Boolean.parseBoolean(value);
    }
}

