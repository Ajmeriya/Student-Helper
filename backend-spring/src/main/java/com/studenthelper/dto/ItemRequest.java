package com.studenthelper.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ItemRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    private String category; // books, electronics, furniture, clothing, other

    private String subcategory;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be positive")
    private Double price;

    private Boolean negotiable = false;

    @NotBlank(message = "Condition is required")
    private String condition; // NEW, likeNew, good, fair, poor

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    private String location;

    private String brand;
    private String model;
    private Integer year;

    private String contactMethod = "chat"; // chat, phone, both

    // Images (handled separately in controller for file uploads)
    private java.util.List<String> images;

    // Status (for updates)
    private String status; // available, sold, reserved
}

