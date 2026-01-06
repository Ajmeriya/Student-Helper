package com.studenthelper.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Student Helper API is running");
        
        Map<String, String> apis = new HashMap<>();
        apis.put("auth", "/api/auth");
        apis.put("pg", "/api/pg");
        apis.put("hostel", "/api/hostel");
        apis.put("item", "/api/item");
        apis.put("message", "/api/message");
        apis.put("user", "/api/user");
        apis.put("distance", "/api/distance");
        
        response.put("apis", apis);
        response.put("timestamp", java.time.Instant.now().toString());
        
        return ResponseEntity.ok(response);
    }

}

