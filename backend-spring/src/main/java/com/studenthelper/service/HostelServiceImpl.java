package com.studenthelper.service;

import com.studenthelper.dto.HostelFilterRequest;
import com.studenthelper.dto.HostelRequest;
import com.studenthelper.dto.HostelResponse;
import com.studenthelper.entity.Hostel;
import com.studenthelper.entity.User;
import com.studenthelper.exception.ResourceNotFoundException;
import com.studenthelper.mapper.HostelMapper;
import com.studenthelper.repository.HostelRepository;
import com.studenthelper.repository.UserRepository;
import com.studenthelper.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HostelServiceImpl implements HostelService {

    private static final Logger logger = LoggerFactory.getLogger(HostelServiceImpl.class);

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HostelMapper hostelMapper;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    public List<HostelResponse> getAllHostels(HostelFilterRequest filters) {
        final HostelFilterRequest finalFilters = filters != null ? filters : new HostelFilterRequest();
        
        Specification<Hostel> spec = buildSpecification(finalFilters);
        List<Hostel> hostels = hostelRepository.findAll(spec);
        return hostels.stream()
                .map(hostelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HostelResponse getHostelById(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", id));
        return hostelMapper.toResponse(hostel);
    }

    @Override
    public HostelResponse createHostel(
            HostelRequest request, 
            Long adminId,
            MultipartFile[] images,
            MultipartFile[] videos) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", adminId));
        
        // Upload images and videos (business logic in service layer)
        if (images != null && images.length > 0) {
            try {
                List<String> imageUrls = cloudinaryService.uploadImages(
                    java.util.Arrays.asList(images), "student-helper/hostels");
                request.setImages(imageUrls);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload images: " + e.getMessage(), e);
            }
        }

        if (videos != null && videos.length > 0) {
            try {
                List<String> videoUrls = cloudinaryService.uploadVideos(
                    java.util.Arrays.asList(videos), "student-helper/hostels/videos");
                request.setVideos(videoUrls);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload videos: " + e.getMessage(), e);
            }
        }

        Hostel hostel = hostelMapper.toEntity(request);
        hostel.setAdmin(admin);
        hostel.setStatus(Hostel.HostelStatus.active);
        
        Hostel savedHostel = hostelRepository.save(hostel);
        return hostelMapper.toResponse(savedHostel);
    }

    @Override
    public HostelResponse updateHostel(
            Long id, 
            HostelRequest request, 
            Long adminId,
            MultipartFile[] images,
            MultipartFile[] videos) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", id));
        
        if (!hostel.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Not authorized to update this hostel");
        }

        // Upload new images if provided
        if (images != null && images.length > 0) {
            try {
                List<String> newImageUrls = cloudinaryService.uploadImages(
                    java.util.Arrays.asList(images), "student-helper/hostels");
                if (request.getImages() != null) {
                    request.getImages().addAll(newImageUrls);
                } else {
                    request.setImages(newImageUrls);
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload images: " + e.getMessage(), e);
            }
        }

        // Upload new videos if provided
        if (videos != null && videos.length > 0) {
            try {
                List<String> newVideoUrls = cloudinaryService.uploadVideos(
                    java.util.Arrays.asList(videos), "student-helper/hostels/videos");
                if (request.getVideos() != null) {
                    request.getVideos().addAll(newVideoUrls);
                } else {
                    request.setVideos(newVideoUrls);
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload videos: " + e.getMessage(), e);
            }
        }

        hostelMapper.updateEntityFromRequest(hostel, request);
        Hostel savedHostel = hostelRepository.save(hostel);
        return hostelMapper.toResponse(savedHostel);
    }

    @Override
    public void deleteHostel(Long id, Long adminId) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", id));
        
        if (!hostel.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("Not authorized to delete this hostel");
        }
        hostelRepository.delete(hostel);
    }

    @Override
    public List<HostelResponse> getMyHostels(Long adminId) {
        List<Hostel> hostels = hostelRepository.findByAdmin_Id(adminId);
        return hostels.stream()
                .map(hostelMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Specification<Hostel> buildSpecification(final HostelFilterRequest filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Fix: Use correct syntax for IN clause
            predicates.add(root.get("status").in(Hostel.HostelStatus.active, Hostel.HostelStatus.full));

            if (filters.getCity() != null && !filters.getCity().isEmpty()) {
                predicates.add(cb.equal(root.get("city"), filters.getCity()));
            }

            if (filters.getGender() != null && !filters.getGender().isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("gender"), Hostel.Gender.valueOf(filters.getGender().toLowerCase())));
                } catch (IllegalArgumentException e) {
                    logger.debug("Invalid gender filter: {}", filters.getGender());
                }
            }

            if (filters.getMinFees() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fees"), filters.getMinFees()));
            }

            if (filters.getMaxFees() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fees"), filters.getMaxFees()));
            }

            if (filters.getSearch() != null && !filters.getSearch().isEmpty()) {
                String search = filters.getSearch().toLowerCase();
                Predicate namePred = cb.like(cb.lower(root.get("name")), "%" + search + "%");
                Predicate locationPred = cb.like(cb.lower(root.get("location")), "%" + search + "%");
                Predicate addressPred = cb.like(cb.lower(root.get("address")), "%" + search + "%");
                predicates.add(cb.or(namePred, locationPred, addressPred));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

