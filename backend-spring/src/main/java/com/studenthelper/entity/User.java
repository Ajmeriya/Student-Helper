package com.studenthelper.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Handle Hibernate proxy serialization
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "email_verification_code", length = 6)
    private String emailVerificationCode;

    @Column(name = "email_verification_expires_at")
    private LocalDateTime emailVerificationExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(nullable = false, name = "phone_number")
    private String phoneNumber;

    @Column(nullable = false)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "college_name")
    private String collegeName;

    @Embedded
    private Location collegeLocation;

    @Column(name = "working_address")
    private String workingAddress;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "lat", column = @Column(name = "working_location_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "working_location_lng"))
    })
    private Coordinates workingLocation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        student, broker, hostelAdmin
    }

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    @Embeddable
    @Data
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }

    @Embeddable
    @Data
    public static class Location {
        @Embedded
        private Coordinates coordinates;
        private String address;
    }
}

