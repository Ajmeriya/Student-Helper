package com.studenthelper.controller;

import com.studenthelper.entity.Item;
import com.studenthelper.entity.User;
import com.studenthelper.repository.ItemRepository;
import com.studenthelper.service.CloudinaryService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.util.*;

@RestController
@RequestMapping("/api/item")
@CrossOrigin(origins = "*")
public class ItemController {

    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.setDisallowedFields("images"); // Prevent Spring from binding images field
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllItems(@RequestParam Map<String, String> filters) {
        try {
            Specification<Item> spec = buildSpecification(filters);
            List<Item> items = itemRepository.findAll(spec);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", items.size());
            response.put("items", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching items", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching items");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getItemById(@PathVariable Long id) {
        try {
            Item item = itemRepository.findById(id).orElse(null);
            if (item == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Item not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("item", item);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching item");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createItem(
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
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Student role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Create Item object manually
            Item item = new Item();
            item.setTitle(title);
            item.setDescription(description);
            
            // Handle category enum
            try {
                item.setCategory(Item.Category.valueOf(category.toLowerCase()));
            } catch (IllegalArgumentException e) {
                item.setCategory(Item.Category.other); // Default
            }
            
            item.setSubcategory(subcategory);
            item.setPrice(price);
            item.setNegotiable(parseBoolean(negotiable));
            
            // Handle condition enum - map "new" to NEW, "like-new" to likeNew
            try {
                if ("new".equalsIgnoreCase(condition)) {
                    item.setCondition(Item.Condition.NEW);
                } else if ("like-new".equalsIgnoreCase(condition) || "likenew".equalsIgnoreCase(condition)) {
                    item.setCondition(Item.Condition.likeNew);
                } else {
                    // Try to match by enum name (good, fair, poor)
                    item.setCondition(Item.Condition.valueOf(condition.toLowerCase()));
                }
            } catch (IllegalArgumentException e) {
                logger.warn("Unknown Condition value: {}, defaulting to good", condition);
                item.setCondition(Item.Condition.good); // Default
            }
            
            item.setCity(city);
            item.setLocation(location);
            item.setBrand(brand);
            item.setModel(model);
            item.setYear(year);
            
            // Handle contactMethod enum
            try {
                item.setContactMethod(Item.ContactMethod.valueOf(contactMethod.toLowerCase()));
            } catch (IllegalArgumentException e) {
                item.setContactMethod(Item.ContactMethod.chat); // Default
            }
            
            // Initialize images list
            if (item.getImages() == null) {
                item.setImages(new ArrayList<>());
            }
            
            // Upload images
            if (images != null && images.length > 0) {
                item.setImages(cloudinaryService.uploadImages(
                    Arrays.asList(images), "student-helper/items"));
            }

            item.setSeller(user);
            item.setStatus(Item.ItemStatus.available);

            Item createdItem = itemRepository.save(item);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item created successfully");
            response.put("item", createdItem);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error creating item");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/my-items")
    public ResponseEntity<Map<String, Object>> getMyItems(HttpServletRequest request) {
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
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Authentication required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            if (user.getRole() != User.Role.student) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Access denied. Student role required.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            List<Item> items = itemRepository.findBySeller_Id(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", items.size());
            response.put("items", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching my items", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching items");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Specification<Item> buildSpecification(Map<String, String> filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            String status = filters.getOrDefault("status", "available");
            predicates.add(cb.equal(root.get("status"), 
                Enum.valueOf(Item.ItemStatus.class, status)));

            if (filters.containsKey("city")) {
                predicates.add(cb.equal(root.get("city"), filters.get("city")));
            }

            if (filters.containsKey("category")) {
                predicates.add(cb.equal(root.get("category"), 
                    Enum.valueOf(Item.Category.class, filters.get("category"))));
            }

            if (filters.containsKey("minPrice")) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), Double.parseDouble(filters.get("minPrice"))));
            }

            if (filters.containsKey("maxPrice")) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), Double.parseDouble(filters.get("maxPrice"))));
            }

            if (filters.containsKey("search")) {
                String search = filters.get("search").toLowerCase();
                Predicate titlePred = cb.like(cb.lower(root.get("title")), "%" + search + "%");
                Predicate descPred = cb.like(cb.lower(root.get("description")), "%" + search + "%");
                predicates.add(cb.or(titlePred, descPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    // Helper method to parse boolean from string (FormData sends everything as strings)
    private boolean parseBoolean(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        return "true".equalsIgnoreCase(value) || "1".equals(value) || Boolean.parseBoolean(value);
    }
}

