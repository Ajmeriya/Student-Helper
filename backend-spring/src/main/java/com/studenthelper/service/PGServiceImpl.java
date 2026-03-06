package com.studenthelper.service;

import com.studenthelper.dto.PGFilterRequest;
import com.studenthelper.dto.PGRequest;
import com.studenthelper.dto.PGResponse;
import com.studenthelper.entity.PG;
import com.studenthelper.entity.User;
import com.studenthelper.mapper.PGMapper;
import com.studenthelper.repository.PGRepository;
import com.studenthelper.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PGServiceImpl implements PGService {

    private static final Logger logger = LoggerFactory.getLogger(PGServiceImpl.class);

    @Autowired
    private PGRepository pgRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PGMapper pgMapper;

    @Override
    public List<PGResponse> getAllPGs(PGFilterRequest filters) {
        final PGFilterRequest finalFilters = filters != null ? filters : new PGFilterRequest();
        
        Specification<PG> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            predicates.add(cb.equal(root.get("isActive"), true));
            // Fix: Use correct syntax for IN clause
            predicates.add(root.get("status").in(PG.PGStatus.available, PG.PGStatus.onRent));

            if (finalFilters.getCity() != null && !finalFilters.getCity().isEmpty()) {
                predicates.add(cb.equal(root.get("city"), finalFilters.getCity()));
            }

            if (finalFilters.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), finalFilters.getMinPrice()));
            }

            if (finalFilters.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), finalFilters.getMaxPrice()));
            }

            if (finalFilters.getSharingType() != null && !finalFilters.getSharingType().isEmpty()) {
                String sharingType = finalFilters.getSharingType();
                try {
                    if ("double".equalsIgnoreCase(sharingType)) {
                        predicates.add(cb.equal(root.get("sharingType"), PG.SharingType.DOUBLE));
                    } else {
                        // Handle lowercase enum values: single, triple, quad
                        String normalized = sharingType.toLowerCase();
                        if ("single".equals(normalized)) {
                            predicates.add(cb.equal(root.get("sharingType"), PG.SharingType.single));
                        } else if ("triple".equals(normalized)) {
                            predicates.add(cb.equal(root.get("sharingType"), PG.SharingType.triple));
                        } else if ("quad".equals(normalized)) {
                            predicates.add(cb.equal(root.get("sharingType"), PG.SharingType.quad));
                        } else {
                            // Try valueOf as fallback
                            predicates.add(cb.equal(root.get("sharingType"), PG.SharingType.valueOf(sharingType)));
                        }
                    }
                } catch (IllegalArgumentException e) {
                    // Invalid sharingType, skip this filter
                    logger.debug("Invalid sharingType filter: {}", sharingType);
                }
            }

            if (finalFilters.getAc() != null && finalFilters.getAc()) {
                predicates.add(cb.equal(root.get("ac"), true));
            }

            if (finalFilters.getFurnished() != null && finalFilters.getFurnished()) {
                predicates.add(cb.equal(root.get("furnished"), true));
            }

            if (finalFilters.getOwnerOnFirstFloor() != null && finalFilters.getOwnerOnFirstFloor()) {
                predicates.add(cb.equal(root.get("ownerOnFirstFloor"), true));
            }

            if (finalFilters.getFoodAvailable() != null && finalFilters.getFoodAvailable()) {
                predicates.add(cb.equal(root.get("foodAvailable"), true));
            }

            if (finalFilters.getParking() != null && finalFilters.getParking()) {
                predicates.add(cb.equal(root.get("parking"), true));
            }

            if (finalFilters.getSearch() != null && !finalFilters.getSearch().isEmpty()) {
                String search = finalFilters.getSearch();
                Predicate titlePred = cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
                Predicate locationPred = cb.like(cb.lower(root.get("location")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(titlePred, locationPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<PG> pgs = pgRepository.findAll(spec);
        return pgs.stream()
                .map(pgMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PGResponse getPGById(Long id) {
        PG pg = pgRepository.findById(id)
                .orElseThrow(() -> new com.studenthelper.exception.ResourceNotFoundException("PG", "id", id));
        return pgMapper.toResponse(pg);
    }

    @Override
    public PGResponse createPG(PGRequest request, Long brokerId) {
        User broker = userRepository.findById(brokerId)
                .orElseThrow(() -> new RuntimeException("Broker not found"));
        
        PG pg = pgMapper.toEntity(request);
        pg.setBroker(broker);
        pg.setStatus(PG.PGStatus.available);
        pg.setIsActive(true);
        
        PG savedPG = pgRepository.save(pg);
        return pgMapper.toResponse(savedPG);
    }

    @Override
    public PGResponse updatePG(Long id, PGRequest request, Long brokerId) {
        PG pg = pgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PG not found"));
        
        if (!pg.getBroker().getId().equals(brokerId)) {
            throw new RuntimeException("Not authorized to update this PG");
        }
        
        pgMapper.updateEntityFromRequest(pg, request);
        PG savedPG = pgRepository.save(pg);
        return pgMapper.toResponse(savedPG);
    }

    @Override
    public void deletePG(Long id, Long brokerId) {
        PG pg = pgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PG not found"));
        
        if (!pg.getBroker().getId().equals(brokerId)) {
            throw new RuntimeException("Not authorized to delete this PG");
        }
        pgRepository.delete(pg);
    }

    @Override
    public List<PGResponse> getMyPGs(Long brokerId) {
        List<PG> pgs = pgRepository.findByBroker_Id(brokerId);
        return pgs.stream()
                .map(pgMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PGResponse updatePGStatus(Long id, String status, Long brokerId, Map<String, Object> statusData) {
        PG pg = pgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PG not found"));
        
        if (!pg.getBroker().getId().equals(brokerId)) {
            throw new RuntimeException("Not authorized to update this PG");
        }

        pg.setStatus(PG.PGStatus.valueOf(status));

        if ("sold".equals(status)) {
            pg.setSoldDate(java.time.LocalDateTime.now());
            pg.setRentalStartDate(null);
            pg.setRentalEndDate(null);
            pg.setRentalPeriod(null);
        } else if ("onRent".equals(status)) {
            Integer rentalPeriod = (Integer) statusData.get("rentalPeriod");
            if (rentalPeriod == null) {
                throw new RuntimeException("Rental period is required for onRent status");
            }
            pg.setRentalPeriod(rentalPeriod);
            pg.setRentalStartDate(java.time.LocalDateTime.now());
            pg.setRentalEndDate(pg.getRentalStartDate().plusMonths(rentalPeriod));
            pg.setSoldDate(null);
        } else if ("available".equals(status)) {
            pg.setSoldDate(null);
            pg.setRentalStartDate(null);
            pg.setRentalEndDate(null);
            pg.setRentalPeriod(null);
        }

        PG savedPG = pgRepository.save(pg);
        return pgMapper.toResponse(savedPG);
    }
}

