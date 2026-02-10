package com.studenthelper.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface CloudinaryService {
    String uploadImage(MultipartFile file, String folder) throws IOException;
    String uploadVideo(MultipartFile file, String folder) throws IOException;
    List<String> uploadImages(List<MultipartFile> files, String folder) throws IOException;
    List<String> uploadVideos(List<MultipartFile> files, String folder) throws IOException;
}

