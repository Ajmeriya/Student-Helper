package com.studenthelper.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Data
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    private String subcategory;

    @Column(nullable = false)
    private Double price;

    private Boolean negotiable = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_condition", nullable = false)
    private Condition condition;

    @Column(nullable = false)
    private String city;

    private String location;

    @ElementCollection
    @CollectionTable(name = "item_images", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "image_url")
    private java.util.List<String> images;

    @ManyToOne(fetch = FetchType.EAGER) // Eagerly fetch seller to avoid lazy loading issues in JSON serialization
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.available;

    private String brand;
    private String model;
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_method")
    private ContactMethod contactMethod = ContactMethod.chat;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Category {
        books, electronics, furniture, clothing, other
    }

    public enum Condition {
        NEW("new"), likeNew("like-new"), good, fair, poor;
        private final String value;
        Condition() { this.value = name(); }
        Condition(String value) { this.value = value; }
        public String getValue() { return value; }
    }

    public enum ItemStatus {
        available, sold, reserved
    }

    public enum ContactMethod {
        chat, phone, both
    }
}

