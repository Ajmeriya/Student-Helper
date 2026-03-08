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
public class CloudinaryServiceImpl implements CloudinaryService {

    private Cloudinary cloudinary;

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryServiceImpl(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret) {

        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    private Cloudinary getCloudinary() {
        if (cloudinary == null) {
            Map<String, String> config = Map.of(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            );
            cloudinary = new Cloudinary(config);
        }
        return cloudinary;
    }

    @Override
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<?, ?> uploadResult = getCloudinary().uploader().upload(
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

    @Override
    public String uploadVideo(MultipartFile file, String folder) throws IOException {
        Map<?, ?> uploadResult = getCloudinary().uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "video",
                        "folder", folder,
                        "quality", "auto"
                )
        );
        return (String) uploadResult.get("secure_url");
    }

    @Override
    public List<String> uploadImages(List<MultipartFile> files, String folder) throws IOException {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                urls.add(uploadImage(file, folder));
            }
        }
        return urls;
    }

    @Override
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

