package com.studenthelper.controller;

import com.studenthelper.dto.ApiResponse;
import com.studenthelper.dto.HostelFilterRequest;
import com.studenthelper.dto.HostelRequest;
import com.studenthelper.dto.HostelResponse;
import com.studenthelper.entity.User;
import com.studenthelper.service.HostelService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
    public ResponseEntity<ApiResponse<List<HostelResponse>>> getAllHostels(HostelFilterRequest filters) {
        List<HostelResponse> hostels = hostelService.getAllHostels(filters);
        return ResponseEntity.ok(ApiResponse.success(hostels, hostels.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HostelResponse>> getHostelById(@PathVariable Long id) {
        HostelResponse hostel = hostelService.getHostelById(id);
        return ResponseEntity.ok(ApiResponse.success(hostel));
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSTEL_ADMIN')")
    public ResponseEntity<ApiResponse<HostelResponse>> createHostel(
            @Valid @ModelAttribute HostelRequest hostelRequest,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos,
            @AuthenticationPrincipal User user) {
        
        // Spring automatically binds:
        // - facilities.mess, facilities.wifi, etc. → Facilities object
        // Service layer handles file uploads and business logic
        HostelResponse createdHostel = hostelService.createHostel(
            hostelRequest, user.getId(), images, videos);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdHostel, "Hostel created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSTEL_ADMIN')")
    public ResponseEntity<ApiResponse<HostelResponse>> updateHostel(
            @PathVariable Long id,
            @Valid @ModelAttribute HostelRequest hostelRequest,
            @RequestParam(required = false) MultipartFile[] images,
            @RequestParam(required = false) MultipartFile[] videos,
            @AuthenticationPrincipal User user) {
        
        // Spring automatically binds:
        // - facilities.mess, facilities.wifi, etc. → Facilities object
        // Service layer handles file uploads and business logic
        HostelResponse updatedHostel = hostelService.updateHostel(
            id, hostelRequest, user.getId(), images, videos);
        
        return ResponseEntity.ok(ApiResponse.success(updatedHostel, "Hostel updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSTEL_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHostel(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        hostelService.deleteHostel(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Hostel deleted successfully"));
    }

    @GetMapping("/my-hostels")
    @PreAuthorize("hasRole('HOSTEL_ADMIN')")
    public ResponseEntity<ApiResponse<List<HostelResponse>>> getMyHostels(@AuthenticationPrincipal User user) {
        List<HostelResponse> hostels = hostelService.getMyHostels(user.getId());
        return ResponseEntity.ok(ApiResponse.success(hostels, hostels.size()));
    }
}

