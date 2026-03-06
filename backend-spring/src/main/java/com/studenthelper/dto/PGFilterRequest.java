package com.studenthelper.dto;

import lombok.Data;

@Data
public class PGFilterRequest {
    private String city;
    private Double minPrice;
    private Double maxPrice;
    private String sharingType; // single, DOUBLE, triple, quad
    private Boolean ac;
    private Boolean furnished;
    private Boolean ownerOnFirstFloor;
    private Boolean foodAvailable;
    private Boolean parking;
    private String search; // Search in title and location
}

