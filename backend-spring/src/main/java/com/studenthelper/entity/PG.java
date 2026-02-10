package com.studenthelper.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pgs")
@Data
public class PG {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false, name = "college_name")
    private String collegeName;

    @Convert(converter = com.studenthelper.converter.SharingTypeConverter.class)
    @Column(nullable = false, name = "sharing_type")
    private SharingType sharingType;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Integer bathrooms;

    @Column(name = "floor_number")
    private Integer floorNumber = 0;

    @Column(nullable = false)
    private Double price;

    @Column(name = "security_deposit")
    private Double securityDeposit = 0.0;

    private Double maintenance = 0.0;

    // Facilities
    private Boolean ac = false;
    private Boolean furnished = false;
    @Column(name = "owner_on_first_floor")
    private Boolean ownerOnFirstFloor = false;
    @Column(name = "food_available")
    private Boolean foodAvailable = false;
    @Column(name = "power_backup")
    private Boolean powerBackup = false;
    private Boolean parking = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "water_supply")
    private WaterSupply waterSupply = WaterSupply.EMPTY;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_tenant")
    private PreferredTenant preferredTenant = PreferredTenant.EMPTY;

    @Column(name = "availability_date")
    private LocalDateTime availabilityDate;

    @Column(name = "nearby_landmarks", columnDefinition = "TEXT")
    private String nearbyLandmarks;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "lat", column = @Column(name = "coordinates_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "coordinates_lng"))
    })
    private Coordinates coordinates = new Coordinates();

    @Column(name = "distance_to_college")
    private Double distanceToCollege = 0.0;

    @ElementCollection
    @CollectionTable(name = "pg_images", joinColumns = @JoinColumn(name = "pg_id"))
    @Column(name = "image_url")
    private List<String> images;

    @ElementCollection
    @CollectionTable(name = "pg_videos", joinColumns = @JoinColumn(name = "pg_id"))
    @Column(name = "video_url")
    private List<String> videos;

    @ManyToOne(fetch = FetchType.EAGER) // Eagerly fetch broker to avoid lazy loading issues in JSON serialization
    @JoinColumn(name = "broker_id", nullable = false)
    private User broker;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    private PGStatus status = PGStatus.available;

    @Column(name = "rental_period")
    private Integer rentalPeriod;

    @Column(name = "sold_date")
    private LocalDateTime soldDate;

    @Column(name = "rental_start_date")
    private LocalDateTime rentalStartDate;

    @Column(name = "rental_end_date")
    private LocalDateTime rentalEndDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SharingType {
        single, DOUBLE("double"), triple, quad;
        private final String value;
        SharingType() { this.value = name(); }
        SharingType(String value) { this.value = value; }
        public String getValue() { return value; }
    }

    public enum WaterSupply {
        EMPTY(""), TIMING("timing"), LIMITED("limited"), FULL_24X7("24x7");
        private final String value;
        WaterSupply(String value) { this.value = value; }
        public String getValue() { return value; }
    }

    public enum PreferredTenant {
        EMPTY(""), student, working, both;
        private final String value;
        PreferredTenant() { this.value = name(); }
        PreferredTenant(String value) { this.value = value; }
        public String getValue() { return value; }
    }

    public enum PGStatus {
        available, sold, onRent
    }

    @Embeddable
    @Data
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }
}

