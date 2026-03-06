package com.studenthelper.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PGRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @NotBlank(message = "College name is required")
    @Size(max = 200, message = "College name must not exceed 200 characters")
    private String collegeName;

    @NotBlank(message = "Sharing type is required")
    private String sharingType; // single, DOUBLE, triple, quad

    @NotNull(message = "Bedrooms is required")
    @Min(value = 1, message = "Bedrooms must be at least 1")
    private Integer bedrooms;

    @NotNull(message = "Bathrooms is required")
    @Min(value = 1, message = "Bathrooms must be at least 1")
    private Integer bathrooms;

    private Integer floorNumber = 0;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be positive")
    private Double price;

    @DecimalMin(value = "0.0", message = "Security deposit must be positive")
    private Double securityDeposit = 0.0;

    @DecimalMin(value = "0.0", message = "Maintenance must be positive")
    private Double maintenance = 0.0;

    // Facilities
    private Boolean ac = false;
    private Boolean furnished = false;
    private Boolean ownerOnFirstFloor = false;
    private Boolean foodAvailable = false;
    private Boolean powerBackup = false;
    private Boolean parking = false;

    private String waterSupply; // EMPTY, TIMING, LIMITED, FULL_24X7
    private String preferredTenant; // EMPTY, student, working, both

    private LocalDateTime availabilityDate;
    private String nearbyLandmarks;
    private String instructions;

    // Coordinates
    private Double latitude;
    private Double longitude;

    // Images and videos (handled separately in controller for file uploads)
    private List<String> images;
    private List<String> videos;

    // Status fields (for updates)
    private String status; // available, sold, onRent
    private Boolean isActive = true;
    private Integer rentalPeriod;
    private LocalDateTime soldDate;
    private LocalDateTime rentalStartDate;
    private LocalDateTime rentalEndDate;
}

