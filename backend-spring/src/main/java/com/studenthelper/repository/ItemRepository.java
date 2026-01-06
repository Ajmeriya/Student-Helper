package com.studenthelper.repository;

import com.studenthelper.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {
    // Use seller.id to query by seller's ID (since seller is a ManyToOne relationship)
    List<Item> findBySeller_Id(Long sellerId);
}

