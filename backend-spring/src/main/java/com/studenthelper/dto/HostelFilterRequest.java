package com.studenthelper.dto;

import lombok.Data;

@Data
public class HostelFilterRequest {
    private String city;
    private String gender; // boys, girls, both
    private Double minFees;
    private Double maxFees;
    private String search; // Search in name, location, and address
}

