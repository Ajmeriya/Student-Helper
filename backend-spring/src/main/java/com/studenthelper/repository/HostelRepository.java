package com.studenthelper.repository;

import com.studenthelper.entity.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long>, JpaSpecificationExecutor<Hostel> {
    // Use admin.id to query by admin's ID (since admin is a ManyToOne relationship)
    List<Hostel> findByAdmin_Id(Long adminId);
}

