package com.studenthelper.service;

import com.studenthelper.dto.AuthRequest;
import com.studenthelper.dto.AuthResponse;
import com.studenthelper.dto.ForgotPasswordRequest;
import com.studenthelper.dto.GoogleAuthRequest;
import com.studenthelper.dto.ResetPasswordRequest;
import com.studenthelper.entity.User;
import com.studenthelper.mapper.UserMapper;
import com.studenthelper.repository.UserRepository;
import com.studenthelper.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

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

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private GoogleTokenVerifierService googleTokenVerifierService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    @Transactional
    public AuthResponse signup(AuthRequest request) {
        validateSignupRequest(request);

        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with this email already exists");
        }

        String normalizedRole = normalizeRole(request.getRole());
        validateRoleAndStudentData(normalizedRole, request.getCollegeName());
        String cleanPhone = normalizePhone(request.getPhoneNumber());

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(cleanPhone);
        user.setCity(request.getCity().trim());
        user.setRole(User.Role.valueOf(normalizedRole));
        user.setAuthProvider(User.AuthProvider.LOCAL);
        user.setEmailVerified(false);

        applyStudentLocationData(user, request, normalizedRole);
        assignNewVerificationCode(user);
        userRepository.save(user);

        try {
            emailVerificationService.sendVerificationCode(user.getEmail(), user.getEmailVerificationCode());
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send verification email. Configure MAIL_USERNAME and MAIL_PASSWORD (Gmail App Password), then try again.");
        }

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Signup successful. Please verify your email with the code sent to your inbox.");
        response.setEmail(user.getEmail());
        response.setRequiresVerification(true);
        return response;
    }

    @Override
    public AuthResponse login(String email, String password) {
        if (email == null || password == null) {
            throw new RuntimeException("Please provide email and password");
        }

        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT).trim())
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        if (user.getAuthProvider() == User.AuthProvider.GOOGLE && (user.getPassword() == null || user.getPassword().isEmpty())) {
            throw new RuntimeException("This account uses Google sign-in. Please login with Google.");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email is not verified. Please verify your email first.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return buildAuthenticatedResponse(user, "Login successful");
    }

    @Override
    public AuthResponse verifyEmail(String email, String code) {
        if (email == null || code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Email and verification code are required");
        }

        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT).trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return buildAuthenticatedResponse(user, "Email already verified");
        }

        if (user.getEmailVerificationCode() == null || !user.getEmailVerificationCode().equals(code.trim())) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getEmailVerificationExpiresAt() == null || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired. Please request a new code.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);

        return buildAuthenticatedResponse(user, "Email verified successfully");
    }

    @Override
    public AuthResponse resendVerificationCode(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT).trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            AuthResponse response = new AuthResponse();
            response.setSuccess(true);
            response.setMessage("Email is already verified");
            response.setEmail(user.getEmail());
            response.setRequiresVerification(false);
            return response;
        }

        assignNewVerificationCode(user);
        userRepository.save(user);

        try {
            emailVerificationService.sendVerificationCode(user.getEmail(), user.getEmailVerificationCode());
        } catch (Exception e) {
            logger.error("Failed to resend verification email to {}", user.getEmail(), e);
            throw new RuntimeException("Failed to resend verification email. Please try again.");
        }

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Verification code sent successfully");
        response.setEmail(user.getEmail());
        response.setRequiresVerification(true);
        return response;
    }

    @Override
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAuthProvider() == User.AuthProvider.GOOGLE) {
            throw new RuntimeException("This account uses Google sign-in. Password reset is not available.");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Please verify your email before resetting password.");
        }

        assignNewVerificationCode(user);
        userRepository.save(user);

        try {
            emailVerificationService.sendPasswordResetCode(user.getEmail(), user.getEmailVerificationCode());
        } catch (Exception e) {
            logger.error("Failed to send password reset code to {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send password reset code. Please try again.");
        }

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Password reset code sent to your email");
        response.setEmail(user.getEmail());
        response.setRequiresVerification(true);
        return response;
    }

    @Override
    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getCode() == null || request.getNewPassword() == null) {
            throw new RuntimeException("Email, verification code, and new password are required");
        }

        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAuthProvider() == User.AuthProvider.GOOGLE) {
            throw new RuntimeException("This account uses Google sign-in. Password reset is not available.");
        }

        if (user.getEmailVerificationCode() == null || !user.getEmailVerificationCode().equals(request.getCode().trim())) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getEmailVerificationExpiresAt() == null || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code expired. Please request a new one.");
        }

        if (!isStrongPassword(request.getNewPassword())) {
            throw new RuntimeException("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setEmailVerificationCode(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Password reset successful. Please login with your new password.");
        response.setEmail(user.getEmail());
        response.setRequiresVerification(false);
        return response;
    }

    @Override
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        GoogleTokenVerifierService.GoogleUserInfo googleUserInfo = googleTokenVerifierService.verify(request.getIdToken());
        String email = googleUserInfo.getEmail() == null ? null : googleUserInfo.getEmail().toLowerCase(Locale.ROOT).trim();
        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Google account email not found");
        }

        User user = userRepository.findByGoogleId(googleUserInfo.getGoogleId()).orElse(null);
        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        if (user != null) {
            if (user.getGoogleId() != null && !user.getGoogleId().equals(googleUserInfo.getGoogleId())) {
                throw new RuntimeException("Google account mismatch for this email");
            }
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleUserInfo.getGoogleId());
            }
            if (user.getAuthProvider() == null) {
                user.setAuthProvider(User.AuthProvider.GOOGLE);
            }
            user.setEmailVerified(true);
            user.setEmailVerificationCode(null);
            user.setEmailVerificationExpiresAt(null);
            userRepository.save(user);
            return buildAuthenticatedResponse(user, "Google login successful");
        }

        if (request.getRole() == null || request.getPhoneNumber() == null || request.getCity() == null) {
            throw new RuntimeException("For first-time Google signup, provide role, phone number, and city.");
        }

        String normalizedRole = normalizeRole(request.getRole());
        validateRoleAndStudentData(normalizedRole, request.getCollegeName());

        User newUser = new User();
        newUser.setName((googleUserInfo.getName() != null && !googleUserInfo.getName().isBlank())
                ? googleUserInfo.getName().trim()
                : "Google User");
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode("GOOGLE_AUTH_" + googleUserInfo.getGoogleId()));
        newUser.setPhoneNumber(normalizePhone(request.getPhoneNumber()));
        newUser.setCity(request.getCity().trim());
        newUser.setRole(User.Role.valueOf(normalizedRole));
        newUser.setGoogleId(googleUserInfo.getGoogleId());
        newUser.setAuthProvider(User.AuthProvider.GOOGLE);
        newUser.setEmailVerified(true);

        if ("student".equals(normalizedRole) && request.getCollegeName() != null) {
            newUser.setCollegeName(request.getCollegeName().trim());
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
                newUser.setCollegeLocation(location);
            }
        }

        userRepository.save(newUser);
        return buildAuthenticatedResponse(newUser, "Google signup successful");
    }

    @Override
    public AuthResponse.UserData getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userMapper.toUserData(user);
    }

    private void validateSignupRequest(AuthRequest request) {
        if (request == null || request.getName() == null || request.getEmail() == null ||
                request.getPassword() == null || request.getPhoneNumber() == null ||
                request.getCity() == null || request.getRole() == null) {
            throw new RuntimeException("Please provide all required fields");
        }
    }

    private void validateRoleAndStudentData(String normalizedRole, String collegeName) {
        if (!isValidRole(normalizedRole)) {
            throw new RuntimeException("Role must be student, broker, or hostelAdmin");
        }
        if ("student".equals(normalizedRole) && (collegeName == null || collegeName.trim().isEmpty())) {
            throw new RuntimeException("College name is required for students");
        }
    }

    private String normalizePhone(String phoneNumber) {
        String cleanPhone = phoneNumber.replaceAll("\\D", "");
        if (cleanPhone.length() != 10) {
            throw new RuntimeException("Phone number must be exactly 10 digits");
        }
        return cleanPhone;
    }

    private void applyStudentLocationData(User user, AuthRequest request, String normalizedRole) {
        if (!"student".equals(normalizedRole)) {
            return;
        }

        if (request.getCollegeName() != null) {
            user.setCollegeName(request.getCollegeName().trim());
        }

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

    private void assignNewVerificationCode(User user) {
        user.setEmailVerificationCode(String.format("%06d", SECURE_RANDOM.nextInt(1_000_000)));
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusMinutes(15));
    }

    private AuthResponse buildAuthenticatedResponse(User user, String message) {
        String token = jwtUtil.generateToken(user.getId());

        AuthResponse.UserData userData = userMapper.toUserData(user);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage(message);
        response.setToken(token);
        response.setUser(userData);
        response.setEmail(user.getEmail());
        response.setRequiresVerification(false);
        return response;
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

    private boolean isStrongPassword(String password) {
        if (password == null) {
            return false;
        }
        return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    }
}

