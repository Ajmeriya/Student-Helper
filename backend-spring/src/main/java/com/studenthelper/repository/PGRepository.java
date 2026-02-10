package com.studenthelper.repository;

import com.studenthelper.entity.PG;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PGRepository extends JpaRepository<PG, Long>, JpaSpecificationExecutor<PG> {
    // Use broker.id to query by broker's ID (since broker is a ManyToOne relationship)
    List<PG> findByBroker_Id(Long brokerId);
}

