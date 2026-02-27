package com.studenthelper.service;

import com.studenthelper.dto.ItemFilterRequest;
import com.studenthelper.dto.ItemRequest;
import com.studenthelper.dto.ItemResponse;
import com.studenthelper.entity.Item;
import com.studenthelper.entity.User;
import com.studenthelper.mapper.ItemMapper;
import com.studenthelper.repository.ItemRepository;
import com.studenthelper.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemServiceImpl implements ItemService {

    private static final Logger logger = LoggerFactory.getLogger(ItemServiceImpl.class);

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemMapper itemMapper;

    @Override
    public List<ItemResponse> getAllItems(ItemFilterRequest filters) {
        final ItemFilterRequest finalFilters = filters != null ? filters : new ItemFilterRequest();
        
        Specification<Item> spec = buildSpecification(finalFilters);
        List<Item> items = itemRepository.findAll(spec);
        return items.stream()
                .map(itemMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id).orElse(null);
        return item != null ? itemMapper.toResponse(item) : null;
    }

    @Override
    public ItemResponse createItem(ItemRequest request, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        Item item = itemMapper.toEntity(request);
        item.setSeller(seller);
        item.setStatus(Item.ItemStatus.available);
        
        Item savedItem = itemRepository.save(item);
        return itemMapper.toResponse(savedItem);
    }

    @Override
    public ItemResponse updateItem(Long id, ItemRequest request, Long sellerId) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Not authorized to update this item");
        }
        
        itemMapper.updateEntityFromRequest(item, request);
        Item savedItem = itemRepository.save(item);
        return itemMapper.toResponse(savedItem);
    }

    @Override
    public void deleteItem(Long id, Long sellerId) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        if (!item.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Not authorized to delete this item");
        }
        itemRepository.delete(item);
    }

    @Override
    public List<ItemResponse> getMyItems(Long sellerId) {
        List<Item> items = itemRepository.findBySeller_Id(sellerId);
        return items.stream()
                .map(itemMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Specification<Item> buildSpecification(final ItemFilterRequest filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            String status = filters.getStatus() != null ? filters.getStatus() : "available";
            try {
                predicates.add(cb.equal(root.get("status"), 
                    Enum.valueOf(Item.ItemStatus.class, status.toLowerCase())));
            } catch (IllegalArgumentException e) {
                predicates.add(cb.equal(root.get("status"), Item.ItemStatus.available));
            }

            if (filters.getCity() != null && !filters.getCity().isEmpty()) {
                predicates.add(cb.equal(root.get("city"), filters.getCity()));
            }

            if (filters.getCategory() != null && !filters.getCategory().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("category"), 
                        Enum.valueOf(Item.Category.class, filters.getCategory().toLowerCase())));
                } catch (IllegalArgumentException e) {
                    logger.debug("Invalid category filter: {}", filters.getCategory());
                }
            }

            if (filters.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filters.getMinPrice()));
            }

            if (filters.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filters.getMaxPrice()));
            }

            if (filters.getSearch() != null && !filters.getSearch().isEmpty()) {
                String search = filters.getSearch().toLowerCase();
                Predicate titlePred = cb.like(cb.lower(root.get("title")), "%" + search + "%");
                Predicate descPred = cb.like(cb.lower(root.get("description")), "%" + search + "%");
                predicates.add(cb.or(titlePred, descPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

