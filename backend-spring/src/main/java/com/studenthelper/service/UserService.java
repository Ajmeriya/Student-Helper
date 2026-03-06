package com.studenthelper.service;

import com.studenthelper.dto.UpdateUserProfileRequest;
import com.studenthelper.dto.UserResponse;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse getUserProfile(Long userId);
    UserResponse updateUserProfile(Long userId, UpdateUserProfileRequest updateRequest);
}

