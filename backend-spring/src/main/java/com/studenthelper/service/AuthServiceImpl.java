package com.studenthelper.service;

import com.studenthelper.dto.AuthRequest;
import com.studenthelper.dto.AuthResponse;
import com.studenthelper.entity.User;
import com.studenthelper.mapper.UserMapper;
import com.studenthelper.repository.UserRepository;
import com.studenthelper.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;

    @Override
    public AuthResponse signup(AuthRequest request) {
        if (request.getName() == null || request.getEmail() == null || 
            request.getPassword() == null || request.getPhoneNumber() == null ||
            request.getCity() == null || request.getRole() == null) {
            throw new RuntimeException("Please provide all required fields");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new RuntimeException("User with this email already exists");
        }

        String normalizedRole = normalizeRole(request.getRole());
        if (!isValidRole(normalizedRole)) {
            throw new RuntimeException("Role must be student, broker, or hostelAdmin");
        }

        if ("student".equals(normalizedRole) && (request.getCollegeName() == null || request.getCollegeName().trim().isEmpty())) {
            throw new RuntimeException("College name is required for students");
        }

        String cleanPhone = request.getPhoneNumber().replaceAll("\\D", "");
        if (cleanPhone.length() != 10) {
            throw new RuntimeException("Phone number must be exactly 10 digits");
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

        AuthResponse.UserData userData = userMapper.toUserData(user);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("User created successfully");
        response.setToken(token);
        response.setUser(userData);

        return response;
    }

    @Override
    public AuthResponse login(String email, String password) {
        if (email == null || password == null) {
            throw new RuntimeException("Please provide email and password");
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getId());

        AuthResponse.UserData userData = userMapper.toUserData(user);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setToken(token);
        response.setUser(userData);

        return response;
    }

    @Override
    public AuthResponse.UserData getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userMapper.toUserData(user);
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

