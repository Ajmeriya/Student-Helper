package com.studenthelper.dto;

import com.studenthelper.entity.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String city;
    private String phoneNumber;
    private String collegeName;
    private User.Location collegeLocation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

