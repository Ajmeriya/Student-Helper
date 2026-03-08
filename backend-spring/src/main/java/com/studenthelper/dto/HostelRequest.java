package com.studenthelper.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class HostelRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    private String address;

    @NotBlank(message = "Gender is required")
    private String gender; // boys, girls, both

    @NotNull(message = "Total rooms is required")
    @Min(value = 1, message = "Total rooms must be at least 1")
    private Integer totalRooms;

    @NotNull(message = "Available rooms is required")
    @Min(value = 0, message = "Available rooms must be non-negative")
    private Integer availableRooms;

    @NotNull(message = "Fees is required")
    @DecimalMin(value = "0.0", message = "Fees must be positive")
    private Double fees;

    private String feesPeriod = "monthly"; // monthly, yearly, semester

    private String description;
    private String rules;
    private String contactNumber;
    private String contactEmail;

    // Facilities
    private Facilities facilities;

    @Data
    public static class Facilities {
        private Boolean mess = false;
        private Boolean wifi = false;
        private Boolean laundry = false;
        private Boolean gym = false;
        private Boolean library = false;
        private Boolean parking = false;
        private Boolean security = false;
        private Boolean powerBackup = false;
        private Boolean waterSupply = false;
    }

    // Coordinates
    private Double latitude;
    private Double longitude;

    // Images and videos (handled separately in controller for file uploads)
    private java.util.List<String> images;
    private java.util.List<String> videos;

    // Status (for updates)
    private String status; // active, inactive, full
}

