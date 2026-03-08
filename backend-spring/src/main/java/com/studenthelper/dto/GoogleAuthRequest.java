package com.studenthelper.dto;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String idToken;
    private String role;
    private String phoneNumber;
    private String city;
    private String collegeName;
    private AuthRequest.CollegeLocation collegeLocation;
}
