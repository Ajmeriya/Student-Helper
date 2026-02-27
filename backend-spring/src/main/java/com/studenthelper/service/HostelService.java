package com.studenthelper.service;

import com.studenthelper.dto.HostelFilterRequest;
import com.studenthelper.dto.HostelRequest;
import com.studenthelper.dto.HostelResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HostelService {
    List<HostelResponse> getAllHostels(HostelFilterRequest filters);
    HostelResponse getHostelById(Long id);
    HostelResponse createHostel(
            HostelRequest request, 
            Long adminId,
            MultipartFile[] images,
            MultipartFile[] videos);
    HostelResponse updateHostel(
            Long id, 
            HostelRequest request, 
            Long adminId,
            MultipartFile[] images,
            MultipartFile[] videos);
    void deleteHostel(Long id, Long adminId);
    List<HostelResponse> getMyHostels(Long adminId);
}

