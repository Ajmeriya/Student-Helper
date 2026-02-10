package com.studenthelper.service;

import com.studenthelper.entity.PG;
import java.util.List;
import java.util.Map;

public interface PGService {
    List<PG> getAllPGs(Map<String, String> filters);
    PG getPGById(Long id);
    PG createPG(PG pg, Long brokerId);
    PG updatePG(Long id, PG updatedPG, Long brokerId);
    void deletePG(Long id, Long brokerId);
    List<PG> getMyPGs(Long brokerId);
    PG updatePGStatus(Long id, String status, Long brokerId, Map<String, Object> statusData);
}

