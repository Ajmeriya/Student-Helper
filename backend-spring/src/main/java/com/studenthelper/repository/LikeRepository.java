package com.studenthelper.repository;

import com.studenthelper.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUser_IdAndPg_Id(Long userId, Long pgId);
    Long countByPg_Id(Long pgId);
    boolean existsByUser_IdAndPg_Id(Long userId, Long pgId);
}

