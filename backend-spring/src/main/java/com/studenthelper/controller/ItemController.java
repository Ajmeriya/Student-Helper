package com.studenthelper.controller;

import com.studenthelper.dto.ApiResponse;
import com.studenthelper.dto.ItemFilterRequest;
import com.studenthelper.dto.ItemRequest;
import com.studenthelper.dto.ItemResponse;
import com.studenthelper.entity.User;
import com.studenthelper.service.CloudinaryService;
import com.studenthelper.service.ItemService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/item")
@CrossOrigin(origins = "*")
public class ItemController {

    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);

    @Autowired
    private ItemService itemService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.setDisallowedFields("images"); // Prevent Spring from binding images field
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItems(ItemFilterRequest filters) {
        try {
            List<ItemResponse> items = itemService.getAllItems(filters);
            return ResponseEntity.ok(ApiResponse.success(items, items.size()));
        } catch (Exception e) {
            logger.error("Error fetching items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching items", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable Long id) {
        try {
            ItemResponse item = itemService.getItemById(id);
            if (item == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Item not found"));
            }
            return ResponseEntity.ok(ApiResponse.success(item));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching item", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam(required = false) String subcategory,
            @RequestParam Double price,
            @RequestParam(required = false, defaultValue = "false") String negotiable,
            @RequestParam String condition,
            @RequestParam String city,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false, defaultValue = "chat") String contactMethod,
            HttpServletRequest request) {
        try {
            // Get user from SecurityContext (same as PG controller)
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            User user = null;
            Long userId = null;
            
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                user = (User) authentication.getPrincipal();
                userId = user.getId();
            } else {
                // Fallback to request attributes
                userId = (Long) request.getAttribute("userId");
                user = (User) request.getAttribute("user");
            }

            if (userId == null || user == null || user.getRole() != User.Role.student) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Student role required."));
            }

            // Upload images first
            List<String> imageUrls = new ArrayList<>();
            if (images != null && images.length > 0) {
                imageUrls = cloudinaryService.uploadImages(
                    Arrays.asList(images), "student-helper/items");
            }

            // Build ItemRequest DTO
            ItemRequest itemRequest = buildItemRequestFromParams(
                title, description, category, subcategory, price, negotiable,
                condition, city, location, brand, model, year, contactMethod, imageUrls
            );

            ItemResponse createdItem = itemService.createItem(itemRequest, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdItem, "Item created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating item", e.getMessage()));
        }
    }

    @GetMapping("/my-items")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getMyItems(HttpServletRequest request) {
        try {
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            User user = null;
            Long userId = null;
            
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                user = (User) authentication.getPrincipal();
                userId = user.getId();
            } else {
                // Fallback to request attributes
                userId = (Long) request.getAttribute("userId");
                user = (User) request.getAttribute("user");
            }

            if (userId == null || user == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Authentication required."));
            }
            
            if (user.getRole() != User.Role.student) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Student role required."));
            }

            List<ItemResponse> items = itemService.getMyItems(userId);
            return ResponseEntity.ok(ApiResponse.success(items, items.size()));
        } catch (Exception e) {
            logger.error("Error fetching my items", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching items", e.getMessage()));
        }
    }

    // Helper method to parse boolean from string (FormData sends everything as strings)
    private boolean parseBoolean(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        return "true".equalsIgnoreCase(value) || "1".equals(value) || Boolean.parseBoolean(value);
    }

    // Helper method to build ItemRequest from form parameters
    private ItemRequest buildItemRequestFromParams(
            String title, String description, String category, String subcategory,
            Double price, String negotiable, String condition, String city, String location,
            String brand, String model, Integer year, String contactMethod, List<String> imageUrls) {
        
        ItemRequest itemRequest = new ItemRequest();
        itemRequest.setTitle(title);
        itemRequest.setDescription(description);
        itemRequest.setCategory(category);
        itemRequest.setSubcategory(subcategory);
        itemRequest.setPrice(price);
        itemRequest.setNegotiable(parseBoolean(negotiable));
        itemRequest.setCondition(condition);
        itemRequest.setCity(city);
        itemRequest.setLocation(location);
        itemRequest.setBrand(brand);
        itemRequest.setModel(model);
        itemRequest.setYear(year);
        itemRequest.setContactMethod(contactMethod);
        itemRequest.setImages(imageUrls);
        
        return itemRequest;
    }
}

