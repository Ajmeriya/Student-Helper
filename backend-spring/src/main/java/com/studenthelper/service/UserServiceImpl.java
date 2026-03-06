package com.studenthelper.service;

import com.studenthelper.dto.UpdateUserProfileRequest;
import com.studenthelper.dto.UserResponse;
import com.studenthelper.entity.User;
import com.studenthelper.mapper.UserMapper;
import com.studenthelper.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return null;
        }
        return toUserResponse(user);
    }

    @Override
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        return toUserResponse(user);
    }

    @Override
    public UserResponse updateUserProfile(Long userId, UpdateUserProfileRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user from DTO using mapper
        userMapper.updateUserFromRequest(user, updateRequest);

        User savedUser = userRepository.save(user);
        
        // Convert Entity to DTO and return
        return toUserResponse(savedUser);
    }

    private UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        UserResponse response = modelMapper.map(user, UserResponse.class);
        if (user.getRole() != null) {
            response.setRole(user.getRole().name());
        }
        return response;
    }
}

