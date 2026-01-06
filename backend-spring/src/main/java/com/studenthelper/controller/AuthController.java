package com.studenthelper.controller;

import com.studenthelper.dto.AuthRequest;
import com.studenthelper.dto.AuthResponse;
import com.studenthelper.entity.User;
import com.studenthelper.repository.UserRepository;
import com.studenthelper.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest request) {
        try {
            if (request.getName() == null || request.getEmail() == null || 
                request.getPassword() == null || request.getPhoneNumber() == null ||
                request.getCity() == null || request.getRole() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Please provide all required fields");
                return ResponseEntity.badRequest().body(response);
            }

            if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User with this email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            String normalizedRole = normalizeRole(request.getRole());
            if (!isValidRole(normalizedRole)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Role must be student, broker, or hostelAdmin");
                return ResponseEntity.badRequest().body(response);
            }

            if ("student".equals(normalizedRole) && (request.getCollegeName() == null || request.getCollegeName().trim().isEmpty())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "College name is required for students");
                return ResponseEntity.badRequest().body(response);
            }

            String cleanPhone = request.getPhoneNumber().replaceAll("\\D", "");
            if (cleanPhone.length() != 10) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Phone number must be exactly 10 digits");
                return ResponseEntity.badRequest().body(response);
            }

            User user = new User();
            user.setName(request.getName().trim());
            user.setEmail(request.getEmail().toLowerCase().trim());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhoneNumber(cleanPhone);
            user.setCity(request.getCity().trim());
            user.setRole(User.Role.valueOf(normalizedRole));

            if ("student".equals(normalizedRole) && request.getCollegeName() != null) {
                user.setCollegeName(request.getCollegeName().trim());
                
                if (request.getCollegeLocation() != null) {
                    User.Location location = new User.Location();
                    if (request.getCollegeLocation().getCoordinates() != null) {
                        User.Coordinates coords = new User.Coordinates();
                        coords.setLat(request.getCollegeLocation().getCoordinates().getLat());
                        coords.setLng(request.getCollegeLocation().getCoordinates().getLng());
                        location.setCoordinates(coords);
                    }
                    if (request.getCollegeLocation().getAddress() != null) {
                        location.setAddress(request.getCollegeLocation().getAddress().trim());
                    }
                    user.setCollegeLocation(location);
                }
            }

            user = userRepository.save(user);

            String token = jwtUtil.generateToken(user.getId());

            AuthResponse.UserData userData = new AuthResponse.UserData();
            userData.setId(user.getId());
            userData.setName(user.getName());
            userData.setEmail(user.getEmail());
            userData.setRole(user.getRole().name());
            userData.setCity(user.getCity());
            userData.setCollegeName(user.getCollegeName());
            userData.setCollegeLocation(user.getCollegeLocation());
            userData.setPhoneNumber(user.getPhoneNumber());

            AuthResponse response = new AuthResponse();
            response.setSuccess(true);
            response.setMessage("User created successfully");
            response.setToken(token);
            response.setUser(userData);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || password == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Please provide email and password");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userRepository.findByEmail(email.toLowerCase()).orElse(null);
            if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = jwtUtil.generateToken(user.getId());

            AuthResponse.UserData userData = new AuthResponse.UserData();
            userData.setId(user.getId());
            userData.setName(user.getName());
            userData.setEmail(user.getEmail());
            userData.setRole(user.getRole().name());
            userData.setCity(user.getCity());
            userData.setCollegeName(user.getCollegeName());
            userData.setCollegeLocation(user.getCollegeLocation());
            userData.setPhoneNumber(user.getPhoneNumber());

            AuthResponse response = new AuthResponse();
            response.setSuccess(true);
            response.setMessage("Login successful");
            response.setToken(token);
            response.setUser(userData);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("user");
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            AuthResponse.UserData userData = new AuthResponse.UserData();
            userData.setId(user.getId());
            userData.setName(user.getName());
            userData.setEmail(user.getEmail());
            userData.setRole(user.getRole().name());
            userData.setCity(user.getCity());
            userData.setCollegeName(user.getCollegeName());
            userData.setCollegeLocation(user.getCollegeLocation());
            userData.setPhoneNumber(user.getPhoneNumber());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", userData);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String normalizeRole(String role) {
        if (role == null) return null;
        String cleaned = role.replaceAll("\\s+", "").toLowerCase();
        if ("hosteladmin".equals(cleaned)) {
            return "hostelAdmin";
        }
        return cleaned;
    }

    private boolean isValidRole(String role) {
        return "student".equals(role) || "broker".equals(role) || "hostelAdmin".equals(role);
    }
}

