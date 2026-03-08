package com.studenthelper.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HostelResponse {
    private Long id;
    private String name;
    private String location;
    private String city;
    private String address;
    private String gender;
    private Integer totalRooms;
    private Integer availableRooms;
    private Double fees;
    private String feesPeriod;
    
    private Facilities facilities;
    
    @Data
    public static class Facilities {
        private Boolean mess;
        private Boolean wifi;
        private Boolean laundry;
        private Boolean gym;
        private Boolean library;
        private Boolean parking;
        private Boolean security;
        private Boolean powerBackup;
        private Boolean waterSupply;
    }
    
    private String description;
    private String rules;
    
    private Coordinates coordinates;
    
    @Data
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }
    
    private List<String> images;
    private List<String> videos;
    
    // Admin information (simplified)
    private AdminInfo admin;
    
    @Data
    public static class AdminInfo {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
    }
    
    private String status;
    private String contactNumber;
    private String contactEmail;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

