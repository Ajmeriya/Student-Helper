package com.studenthelper.service;

import com.studenthelper.entity.PG;
import com.studenthelper.entity.User;
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

@Service
public class PGServiceImpl implements PGService {

    private static final Logger logger = LoggerFactory.getLogger(PGServiceImpl.class);

    @Autowired
    private PGRepository pgRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<PG> getAllPGs(Map<String, String> filters) {
        Specification<PG> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            predicates.add(cb.equal(root.get("isActive"), true));
            // Fix: Use correct syntax for IN clause
            predicates.add(root.get("status").in(PG.PGStatus.available, PG.PGStatus.onRent));

            if (filters.containsKey("city")) {
                predicates.add(cb.equal(root.get("city"), filters.get("city")));
            }

            if (filters.containsKey("minPrice")) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), Double.parseDouble(filters.get("minPrice"))));
            }

            if (filters.containsKey("maxPrice")) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), Double.parseDouble(filters.get("maxPrice"))));
            }

            if (filters.containsKey("sharingType")) {
                String sharingType = filters.get("sharingType");
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

            if ("true".equals(filters.get("ac"))) {
                predicates.add(cb.equal(root.get("ac"), true));
            }

            if ("true".equals(filters.get("furnished"))) {
                predicates.add(cb.equal(root.get("furnished"), true));
            }

            if ("true".equals(filters.get("ownerOnFirstFloor"))) {
                predicates.add(cb.equal(root.get("ownerOnFirstFloor"), true));
            }

            if ("true".equals(filters.get("foodAvailable"))) {
                predicates.add(cb.equal(root.get("foodAvailable"), true));
            }

            if ("true".equals(filters.get("parking"))) {
                predicates.add(cb.equal(root.get("parking"), true));
            }

            if (filters.containsKey("search")) {
                String search = filters.get("search");
                Predicate titlePred = cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%");
                Predicate locationPred = cb.like(cb.lower(root.get("location")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(titlePred, locationPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return pgRepository.findAll(spec);
    }

    @Override
    public PG getPGById(Long id) {
        return pgRepository.findById(id).orElse(null);
    }

    @Override
    public PG createPG(PG pg, Long brokerId) {
        User broker = userRepository.findById(brokerId).orElseThrow();
        pg.setBroker(broker);
        pg.setStatus(PG.PGStatus.available);
        pg.setIsActive(true);
        return pgRepository.save(pg);
    }

    @Override
    public PG updatePG(Long id, PG updatedPG, Long brokerId) {
        PG pg = pgRepository.findById(id).orElseThrow();
        if (!pg.getBroker().getId().equals(brokerId)) {
            throw new RuntimeException("Not authorized to update this PG");
        }
        
        // Update fields
        if (updatedPG.getTitle() != null) pg.setTitle(updatedPG.getTitle());
        if (updatedPG.getLocation() != null) pg.setLocation(updatedPG.getLocation());
        if (updatedPG.getCity() != null) pg.setCity(updatedPG.getCity());
        if (updatedPG.getPrice() != null) pg.setPrice(updatedPG.getPrice());
        // Add more field updates as needed
        
        return pgRepository.save(pg);
    }

    @Override
    public void deletePG(Long id, Long brokerId) {
        PG pg = pgRepository.findById(id).orElseThrow();
        if (!pg.getBroker().getId().equals(brokerId)) {
            throw new RuntimeException("Not authorized to delete this PG");
        }
        pgRepository.delete(pg);
    }

    @Override
    public List<PG> getMyPGs(Long brokerId) {
        return pgRepository.findByBroker_Id(brokerId);
    }

    @Override
    public PG updatePGStatus(Long id, String status, Long brokerId, Map<String, Object> statusData) {
        PG pg = pgRepository.findById(id).orElseThrow();
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

        return pgRepository.save(pg);
    }
}

