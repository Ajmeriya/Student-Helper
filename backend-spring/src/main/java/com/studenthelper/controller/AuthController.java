package com.studenthelper.controller;

import com.studenthelper.dto.AuthRequest;
import com.studenthelper.dto.AuthResponse;
import com.studenthelper.entity.User;
import com.studenthelper.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            if (request.getEmail() == null || request.getPassword() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Please provide email and password");
                return ResponseEntity.badRequest().body(response);
            }

            AuthResponse response = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);

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

            AuthResponse.UserData userData = authService.getMe(user.getId());

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
}

