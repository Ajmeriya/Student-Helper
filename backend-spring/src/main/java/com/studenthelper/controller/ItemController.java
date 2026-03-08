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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllItems(
            ItemFilterRequest filters,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        try {
            Page<ItemResponse> page = itemService.getAllItems(filters, pageable);
            Map<String, Object> pagedData = new LinkedHashMap<>();
            pagedData.put("content", page.getContent());
            pagedData.put("page", page.getNumber());
            pagedData.put("size", page.getSize());
            pagedData.put("totalElements", page.getTotalElements());
            pagedData.put("totalPages", page.getTotalPages());
            pagedData.put("sort", page.getSort().toString());
            return ResponseEntity.ok(ApiResponse.success(pagedData, page.getNumberOfElements()));
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
            User user = resolveCurrentUser(request);
            Long userId = user != null ? user.getId() : null;

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

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) List<String> existingImages,
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
            User user = resolveCurrentUser(request);
            Long userId = user != null ? user.getId() : null;

            if (userId == null || user == null || user.getRole() != User.Role.student) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Student role required."));
            }

            List<String> imageUrls = new ArrayList<>();
            if (existingImages != null) {
                imageUrls.addAll(existingImages);
            }
            if (images != null && images.length > 0) {
                imageUrls.addAll(cloudinaryService.uploadImages(
                        Arrays.asList(images), "student-helper/items"));
            }

            ItemRequest itemRequest = buildItemRequestFromParams(
                    title, description, category, subcategory, price, negotiable,
                    condition, city, location, brand, model, year, contactMethod, imageUrls
            );

            ItemResponse updatedItem = itemService.updateItem(id, itemRequest, userId);
            return ResponseEntity.ok(ApiResponse.success(updatedItem, "Item updated successfully"));
        } catch (Exception e) {
            logger.error("Error updating item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating item", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItemStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try {
            User user = resolveCurrentUser(request);
            Long userId = user != null ? user.getId() : null;

            if (userId == null || user == null || user.getRole() != User.Role.student) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Student role required."));
            }

            if (body == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Status is required"));
            }

            String status = body.get("status");
            if (status == null || status.isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Status is required"));
            }

            ItemResponse updatedItem = itemService.updateItemStatus(id, status, userId);
            return ResponseEntity.ok(ApiResponse.success(updatedItem, "Item status updated successfully"));
        } catch (RuntimeException e) {
            logger.warn("Runtime error updating item status: {}", e.getMessage());
            HttpStatus status = (e.getMessage() != null && e.getMessage().toLowerCase().contains("not authorized"))
                    ? HttpStatus.FORBIDDEN
                    : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status)
                    .body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to update item status"));
        } catch (Exception e) {
            logger.error("Error updating item status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating item status", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable Long id,
            HttpServletRequest request) {
        try {
            User user = resolveCurrentUser(request);
            Long userId = user != null ? user.getId() : null;

            if (userId == null || user == null || user.getRole() != User.Role.student) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Student role required."));
            }

            itemService.deleteItem(id, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Item deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting item", e.getMessage()));
        }
    }

    private User resolveCurrentUser(HttpServletRequest request) {
        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }

        Object requestUser = request.getAttribute("user");
        if (requestUser instanceof User) {
            return (User) requestUser;
        }

        return null;
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

