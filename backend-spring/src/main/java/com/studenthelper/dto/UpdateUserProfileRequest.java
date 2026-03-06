package com.studenthelper.dto;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String name;
    private String phoneNumber;
    private String city;
    private String collegeName;
    private CollegeLocationRequest collegeLocation;

    @Data
    public static class CollegeLocationRequest {
        private CoordinatesRequest coordinates;
        private String address;

        @Data
        public static class CoordinatesRequest {
            private Double lat;
            private Double lng;
        }
    }
}

