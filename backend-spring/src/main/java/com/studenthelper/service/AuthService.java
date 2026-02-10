package com.studenthelper.service;

import com.studenthelper.dto.AuthRequest;
import com.studenthelper.dto.AuthResponse;

public interface AuthService {
    AuthResponse signup(AuthRequest request);
    AuthResponse login(String email, String password);
    AuthResponse.UserData getMe(Long userId);
}

