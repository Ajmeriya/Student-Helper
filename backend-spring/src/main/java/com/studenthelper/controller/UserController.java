package com.studenthelper.controller;

import com.studenthelper.entity.User;
import com.studenthelper.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile/me")
    public ResponseEntity<Map<String, Object>> getUserProfile(HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("user");
            if (user == null) {
                // Try to get from SecurityContext as fallback
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    user = (User) authentication.getPrincipal();
                }
            }
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching user profile");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/profile/me")
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            @RequestBody Map<String, Object> updateData,
            HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("user");
            if (user == null) {
                // Try to get from SecurityContext as fallback
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    user = (User) authentication.getPrincipal();
                    // Reload from repository to get latest data
                    user = userRepository.findById(user.getId()).orElse(null);
                }
            }
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            if (updateData.containsKey("name")) {
                user.setName(updateData.get("name").toString().trim());
            }

            if (updateData.containsKey("phoneNumber")) {
                String phone = updateData.get("phoneNumber").toString().replaceAll("\\D", "");
                if (phone.length() == 10) {
                    user.setPhoneNumber(phone);
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Phone number must be exactly 10 digits");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            if (updateData.containsKey("city")) {
                user.setCity(updateData.get("city").toString().trim());
            }

            if (user.getRole() == User.Role.student) {
                if (updateData.containsKey("collegeName")) {
                    user.setCollegeName(updateData.get("collegeName").toString().trim());
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> collegeLocation = (Map<String, Object>) updateData.get("collegeLocation");
                if (collegeLocation != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> coords = (Map<String, Object>) collegeLocation.get("coordinates");
                    if (coords != null) {
                        User.Location location = new User.Location();
                        User.Coordinates coordinates = new User.Coordinates();
                        coordinates.setLat(Double.parseDouble(coords.get("lat").toString()));
                        coordinates.setLng(Double.parseDouble(coords.get("lng").toString()));
                        location.setCoordinates(coordinates);
                        user.setCollegeLocation(location);
                    }
                }
            }

            User updatedUser = userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating user profile");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            userData.put("city", user.getCity());
            userData.put("collegeName", user.getCollegeName());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", userData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching user");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

