package com.studenthelper.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret) {
        Map<String, String> config = Map.of(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        );
        this.cloudinary = new Cloudinary(config);
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "image",
                        "folder", folder,
                        "width", 1200,
                        "height", 800,
                        "crop", "limit",
                        "quality", "auto"
                )
        );
        return (String) uploadResult.get("secure_url");
    }

    public String uploadVideo(MultipartFile file, String folder) throws IOException {
         Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "folder", folder,
                        "quality", "auto"
                )
        );
        return (String) uploadResult.get("secure_url");
    }

    public List<String> uploadImages(List<MultipartFile> files, String folder) throws IOException {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                urls.add(uploadImage(file, folder));
            }
        }
        return urls;
    }

    public List<String> uploadVideos(List<MultipartFile> files, String folder) throws IOException {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                urls.add(uploadVideo(file, folder));
            }
        }
        return urls;
    }
}

