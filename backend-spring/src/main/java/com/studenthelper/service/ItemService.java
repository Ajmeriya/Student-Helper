package com.studenthelper.service;

import com.studenthelper.dto.ItemFilterRequest;
import com.studenthelper.dto.ItemRequest;
import com.studenthelper.dto.ItemResponse;
import java.util.List;

public interface ItemService {
    List<ItemResponse> getAllItems(ItemFilterRequest filters);
    ItemResponse getItemById(Long id);
    ItemResponse createItem(ItemRequest request, Long sellerId);
    ItemResponse updateItem(Long id, ItemRequest request, Long sellerId);
    void deleteItem(Long id, Long sellerId);
    List<ItemResponse> getMyItems(Long sellerId);
}

