package com.studenthelper.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PGResponse {
    private Long id;
    private String title;
    private String location;
    private String city;
    private String collegeName;
    private String sharingType;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer floorNumber;
    private Double price;
    private Double securityDeposit;
    private Double maintenance;
    
    // Facilities
    private Boolean ac;
    private Boolean furnished;
    private Boolean ownerOnFirstFloor;
    private Boolean foodAvailable;
    private Boolean powerBackup;
    private Boolean parking;
    private String waterSupply;
    private String preferredTenant;
    
    private LocalDateTime availabilityDate;
    private String nearbyLandmarks;
    private String instructions;
    
    // Coordinates
    private Coordinates coordinates;
    
    @Data
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }
    
    private Double distanceToCollege;
    private List<String> images;
    private List<String> videos;
    
    // Broker information (simplified)
    private BrokerInfo broker;
    
    @Data
    public static class BrokerInfo {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
    }
    
    private Boolean isActive;
    private String status;
    private Integer rentalPeriod;
    private LocalDateTime soldDate;
    private LocalDateTime rentalStartDate;
    private LocalDateTime rentalEndDate;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

