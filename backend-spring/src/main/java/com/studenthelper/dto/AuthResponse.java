package com.studenthelper.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private Boolean success;
    private String message;
    private String token;
    private UserData user;

    @Data
    public static class UserData {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String city;
        private String collegeName;
        private Object collegeLocation;
        private String phoneNumber;
    }
}

