package com.studenthelper.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "hostels")
@Data
public class Hostel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(nullable = false, name = "total_rooms")
    private Integer totalRooms;

    @Column(nullable = false, name = "available_rooms")
    private Integer availableRooms;

    @Column(nullable = false)
    private Double fees;

    @Enumerated(EnumType.STRING)
    @Column(name = "fees_period")
    private FeesPeriod feesPeriod = FeesPeriod.monthly;

    @Embedded
    private Facilities facilities = new Facilities();

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String rules;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "lat", column = @Column(name = "coordinates_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "coordinates_lng"))
    })
    private Coordinates coordinates = new Coordinates();

    @ElementCollection
    @CollectionTable(name = "hostel_images", joinColumns = @JoinColumn(name = "hostel_id"))
    @Column(name = "image_url")
    private List<String> images;

    @ElementCollection
    @CollectionTable(name = "hostel_videos", joinColumns = @JoinColumn(name = "hostel_id"))
    @Column(name = "video_url")
    private List<String> videos;

    @ManyToOne(fetch = FetchType.EAGER) // Eagerly fetch admin to avoid lazy loading issues in JSON serialization
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Enumerated(EnumType.STRING)
    private HostelStatus status = HostelStatus.active;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "contact_email")
    private String contactEmail;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Gender {
        boys, girls, both
    }

    public enum FeesPeriod {
        monthly, yearly, semester
    }

    public enum HostelStatus {
        active, inactive, full
    }

    @Embeddable
    @Data
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }

    @Embeddable
    @Data
    public static class Facilities {
        @Column(name = "facilities_mess")
        private Boolean mess = false;
        @Column(name = "facilities_wifi")
        private Boolean wifi = false;
        @Column(name = "facilities_laundry")
        private Boolean laundry = false;
        @Column(name = "facilities_gym")
        private Boolean gym = false;
        @Column(name = "facilities_library")
        private Boolean library = false;
        @Column(name = "facilities_parking")
        private Boolean parking = false;
        @Column(name = "facilities_security")
        private Boolean security = false;
        @Column(name = "facilities_power_backup")
        private Boolean powerBackup = false;
        @Column(name = "facilities_water_supply")
        private Boolean waterSupply = false;
    }
}

