package com.studenthelper.controller;

import com.studenthelper.dto.ApiResponse;
import com.studenthelper.dto.HostelFilterRequest;
import com.studenthelper.dto.HostelRequest;
import com.studenthelper.dto.HostelResponse;
import com.studenthelper.entity.User;
import com.studenthelper.service.HostelService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hostel")
@CrossOrigin(origins = "*")
public class HostelController {

    // Logger removed - using GlobalExceptionHandler for error handling

    @Autowired
    private HostelService hostelService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // Register custom property editor for Boolean to handle form-data string values
        binder.registerCustomEditor(Boolean.class, new org.springframework.beans.propertyeditors.CustomBooleanEditor(true));
        // Spring will automatically bind nested objects (facilities)
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllHostels(
            HostelFilterRequest filters,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        Page<HostelResponse> page = hostelService.getAllHostels(filters, pageable);
        Map<String, Object> pagedData = new LinkedHashMap<>();
        pagedData.put("content", page.getContent());
        pagedData.put("page", page.getNumber());
        pagedData.put("size", page.getSize());
        pagedData.put("totalElements", page.getTotalElements());
        pagedData.put("totalPages", page.getTotalPages());
        pagedData.put("sort", page.getSort().toString());
        return ResponseEntity.ok(ApiResponse.success(pagedData, page.getNumberOfElements()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HostelResponse>> getHostelById(@PathVariable Long id) {
        HostelResponse hostel = hostelService.getHostelById(id);
        return ResponseEntity.ok(ApiResponse.success(hostel));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSTELADMIN')")
    public ResponseEntity<ApiResponse<HostelResponse>> createHostel(
            @Valid @ModelAttribute HostelRequest hostelRequest,
            @RequestParam(name = "imageFiles", required = false) MultipartFile[] imageFiles,
            @RequestParam(name = "videoFiles", required = false) MultipartFile[] videoFiles,
            @AuthenticationPrincipal User user) {
        
        // Spring automatically binds:
        // - facilities.mess, facilities.wifi, etc. → Facilities object
        // Service layer handles file uploads and business logic
        HostelResponse createdHostel = hostelService.createHostel(
            hostelRequest, user.getId(), imageFiles, videoFiles);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdHostel, "Hostel created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSTELADMIN')")
    public ResponseEntity<ApiResponse<HostelResponse>> updateHostel(
            @PathVariable Long id,
            @Valid @ModelAttribute HostelRequest hostelRequest,
            @RequestParam(name = "imageFiles", required = false) MultipartFile[] imageFiles,
            @RequestParam(name = "videoFiles", required = false) MultipartFile[] videoFiles,
            @AuthenticationPrincipal User user) {
        
        // Spring automatically binds:
        // - facilities.mess, facilities.wifi, etc. → Facilities object
        // Service layer handles file uploads and business logic
        HostelResponse updatedHostel = hostelService.updateHostel(
            id, hostelRequest, user.getId(), imageFiles, videoFiles);
        
        return ResponseEntity.ok(ApiResponse.success(updatedHostel, "Hostel updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSTELADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHostel(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        hostelService.deleteHostel(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Hostel deleted successfully"));
    }

    @GetMapping("/my-hostels")
    @PreAuthorize("hasRole('HOSTELADMIN')")
    public ResponseEntity<ApiResponse<List<HostelResponse>>> getMyHostels(@AuthenticationPrincipal User user) {
        List<HostelResponse> hostels = hostelService.getMyHostels(user.getId());
        return ResponseEntity.ok(ApiResponse.success(hostels, hostels.size()));
    }
}

