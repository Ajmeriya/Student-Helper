package com.studenthelper.dto;

import lombok.Data;

@Data
public class ItemFilterRequest {
    private String status = "available"; // available, sold, reserved
    private String city;
    private String category; // books, electronics, furniture, clothing, other
    private Double minPrice;
    private Double maxPrice;
    private String search; // Search in title and description
}

