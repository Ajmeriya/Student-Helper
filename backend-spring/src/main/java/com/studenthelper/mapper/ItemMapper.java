package com.studenthelper.mapper;

import com.studenthelper.dto.ItemRequest;
import com.studenthelper.dto.ItemResponse;
import com.studenthelper.entity.Item;
import org.springframework.stereotype.Component;

@Component
public class ItemMapper {

    public Item toEntity(ItemRequest request) {
        if (request == null) {
            return null;
        }

        Item item = new Item();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        
        // Map category enum
        if (request.getCategory() != null) {
            item.setCategory(parseCategory(request.getCategory()));
        }
        
        item.setSubcategory(request.getSubcategory());
        item.setPrice(request.getPrice());
        item.setNegotiable(request.getNegotiable() != null ? request.getNegotiable() : false);
        
        // Map condition enum
        if (request.getCondition() != null) {
            item.setCondition(parseCondition(request.getCondition()));
        }
        
        item.setCity(request.getCity());
        item.setLocation(request.getLocation());
        item.setBrand(request.getBrand());
        item.setModel(request.getModel());
        item.setYear(request.getYear());
        
        // Map contactMethod enum
        if (request.getContactMethod() != null) {
            item.setContactMethod(parseContactMethod(request.getContactMethod()));
        } else {
            item.setContactMethod(Item.ContactMethod.chat);
        }
        
        // Set images
        if (request.getImages() != null) {
            item.setImages(request.getImages());
        }
        
        // Status
        if (request.getStatus() != null) {
            item.setStatus(parseItemStatus(request.getStatus()));
        } else {
            item.setStatus(Item.ItemStatus.available);
        }
        
        return item;
    }

    public ItemResponse toResponse(Item item) {
        if (item == null) {
            return null;
        }

        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setTitle(item.getTitle());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory() != null ? item.getCategory().name() : null);
        response.setSubcategory(item.getSubcategory());
        response.setPrice(item.getPrice());
        response.setNegotiable(item.getNegotiable());
        response.setCondition(item.getCondition() != null ? item.getCondition().getValue() : null);
        response.setCity(item.getCity());
        response.setLocation(item.getLocation());
        response.setImages(item.getImages());
        
        // Seller information
        if (item.getSeller() != null) {
            ItemResponse.SellerInfo sellerInfo = new ItemResponse.SellerInfo();
            sellerInfo.setId(item.getSeller().getId());
            sellerInfo.setName(item.getSeller().getName());
            sellerInfo.setEmail(item.getSeller().getEmail());
            sellerInfo.setPhoneNumber(item.getSeller().getPhoneNumber());
            sellerInfo.setCity(item.getSeller().getCity());
            response.setSeller(sellerInfo);
        }
        
        response.setStatus(item.getStatus() != null ? item.getStatus().name() : null);
        response.setBrand(item.getBrand());
        response.setModel(item.getModel());
        response.setYear(item.getYear());
        response.setContactMethod(item.getContactMethod() != null ? item.getContactMethod().name() : null);
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        
        return response;
    }

    public void updateEntityFromRequest(Item item, ItemRequest request) {
        if (item == null || request == null) {
            return;
        }

        if (request.getTitle() != null) {
            item.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            item.setCategory(parseCategory(request.getCategory()));
        }
        if (request.getSubcategory() != null) {
            item.setSubcategory(request.getSubcategory());
        }
        if (request.getPrice() != null) {
            item.setPrice(request.getPrice());
        }
        if (request.getNegotiable() != null) {
            item.setNegotiable(request.getNegotiable());
        }
        if (request.getCondition() != null) {
            item.setCondition(parseCondition(request.getCondition()));
        }
        if (request.getCity() != null) {
            item.setCity(request.getCity());
        }
        if (request.getLocation() != null) {
            item.setLocation(request.getLocation());
        }
        if (request.getBrand() != null) {
            item.setBrand(request.getBrand());
        }
        if (request.getModel() != null) {
            item.setModel(request.getModel());
        }
        if (request.getYear() != null) {
            item.setYear(request.getYear());
        }
        if (request.getContactMethod() != null) {
            item.setContactMethod(parseContactMethod(request.getContactMethod()));
        }
        
        // Images
        if (request.getImages() != null) {
            item.setImages(request.getImages());
        }
        
        // Status
        if (request.getStatus() != null) {
            item.setStatus(parseItemStatus(request.getStatus()));
        }
    }

    private Item.Category parseCategory(String category) {
        if (category == null || category.isEmpty()) {
            return Item.Category.other;
        }
        
        try {
            return Item.Category.valueOf(category.toLowerCase());
        } catch (IllegalArgumentException e) {
            return Item.Category.other;
        }
    }

    private Item.Condition parseCondition(String condition) {
        if (condition == null || condition.isEmpty()) {
            return Item.Condition.good;
        }
        
        if ("new".equalsIgnoreCase(condition) || "NEW".equals(condition)) {
            return Item.Condition.NEW;
        } else if ("like-new".equalsIgnoreCase(condition) || "likenew".equalsIgnoreCase(condition) || "likeNew".equals(condition)) {
            return Item.Condition.likeNew;
        } else {
            try {
                return Item.Condition.valueOf(condition.toLowerCase());
            } catch (IllegalArgumentException e) {
                return Item.Condition.good;
            }
        }
    }

    private Item.ContactMethod parseContactMethod(String contactMethod) {
        if (contactMethod == null || contactMethod.isEmpty()) {
            return Item.ContactMethod.chat;
        }
        
        try {
            return Item.ContactMethod.valueOf(contactMethod.toLowerCase());
        } catch (IllegalArgumentException e) {
            return Item.ContactMethod.chat;
        }
    }

    private Item.ItemStatus parseItemStatus(String status) {
        if (status == null || status.isEmpty()) {
            return Item.ItemStatus.available;
        }
        
        try {
            return Item.ItemStatus.valueOf(status.toLowerCase());
        } catch (IllegalArgumentException e) {
            return Item.ItemStatus.available;
        }
    }
}

