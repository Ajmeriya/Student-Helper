package com.studenthelper.service;

import com.studenthelper.dto.ItemFilterRequest;
import com.studenthelper.dto.ItemRequest;
import com.studenthelper.dto.ItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ItemService {
    Page<ItemResponse> getAllItems(ItemFilterRequest filters, Pageable pageable);
    ItemResponse getItemById(Long id);
    ItemResponse createItem(ItemRequest request, Long sellerId);
    ItemResponse updateItem(Long id, ItemRequest request, Long sellerId);
    ItemResponse updateItemStatus(Long id, String status, Long sellerId);
    void deleteItem(Long id, Long sellerId);
    List<ItemResponse> getMyItems(Long sellerId);
}

