package com.studenthelper.service;

import com.studenthelper.dto.PGFilterRequest;
import com.studenthelper.dto.PGRequest;
import com.studenthelper.dto.PGResponse;
import java.util.List;
import java.util.Map;

public interface PGService {
    List<PGResponse> getAllPGs(PGFilterRequest filters);
    PGResponse getPGById(Long id);
    PGResponse createPG(PGRequest request, Long brokerId);
    PGResponse updatePG(Long id, PGRequest request, Long brokerId);
    void deletePG(Long id, Long brokerId);
    List<PGResponse> getMyPGs(Long brokerId);
    PGResponse updatePGStatus(Long id, String status, Long brokerId, Map<String, Object> statusData);
}
