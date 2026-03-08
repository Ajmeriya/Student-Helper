package com.studenthelper.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ItemResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String subcategory;
    private Double price;
    private Boolean negotiable;
    private String condition;
    private String city;
    private String location;
    private List<String> images;
    
    // Seller information (simplified)
    private SellerInfo seller;
    
    @Data
    public static class SellerInfo {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
        private String city;
    }
    
    private String status;
    private String brand;
    private String model;
    private Integer year;
    private String contactMethod;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

