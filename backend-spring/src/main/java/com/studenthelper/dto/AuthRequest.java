package com.studenthelper.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String city;
    private String role;
    private String collegeName;
    private CollegeLocation collegeLocation;

    @Data
    public static class CollegeLocation {
        private Coordinates coordinates;
        private String address;

        @Data
        public static class Coordinates {
            private Double lat;
            private Double lng;
        }
    }
}

