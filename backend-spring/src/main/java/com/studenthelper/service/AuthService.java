package com.studenthelper.service;

import com.studenthelper.dto.AuthRequest;
import com.studenthelper.dto.AuthResponse;
import com.studenthelper.dto.ForgotPasswordRequest;
import com.studenthelper.dto.GoogleAuthRequest;
import com.studenthelper.dto.ResetPasswordRequest;

public interface AuthService {
    AuthResponse signup(AuthRequest request);
    AuthResponse login(String email, String password);
    AuthResponse verifyEmail(String email, String code);
    AuthResponse resendVerificationCode(String email);
    AuthResponse forgotPassword(ForgotPasswordRequest request);
    AuthResponse resetPassword(ResetPasswordRequest request);
    AuthResponse googleAuth(GoogleAuthRequest request);
    AuthResponse.UserData getMe(Long userId);
}

