package com.studenthelper.controller;

import com.studenthelper.service.DistanceService;
import com.studenthelper.util.DistanceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/distance")
@CrossOrigin(origins = "*")
public class DistanceController {

    @Autowired
    private DistanceService distanceService;

    @PostMapping("/geocode")
    public ResponseEntity<Map<String, Object>> geocode(@RequestBody Map<String, String> request) {
        try {
            String address = request.get("address");
            String city = request.get("city");

            if (address == null || address.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Address is required");
                return ResponseEntity.badRequest().body(response);
            }

            com.studenthelper.util.GeocodingUtil.GeocodeResult result = distanceService.geocode(address, city);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            Map<String, Object> data = new HashMap<>();
            data.put("lat", result.getLat());
            data.put("lng", result.getLng());
            data.put("display_name", result.getDisplayName());
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/validate-location")
    public ResponseEntity<Map<String, Object>> validateLocation(@RequestBody Map<String, Object> request) {
        try {
            Object latObj = request.get("lat");
            Object lngObj = request.get("lng");

            if (latObj == null || lngObj == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("valid", false);
                response.put("message", "Invalid coordinates provided");
                return ResponseEntity.badRequest().body(response);
            }

            Double lat = Double.parseDouble(latObj.toString());
            Double lng = Double.parseDouble(lngObj.toString());

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("valid", false);
                response.put("message", "Coordinates are outside valid range");
                return ResponseEntity.ok(response);
            }

            Map<String, Object> validationResult = distanceService.validateLocation(lat, lng);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.putAll(validationResult);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("valid", false);
            response.put("message", "Error validating location");
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateDistance(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> originCoords = (Map<String, Object>) request.get("originCoordinates");
            @SuppressWarnings("unchecked")
            Map<String, Object> destCoords = (Map<String, Object>) request.get("destinationCoordinates");
            String address = (String) request.get("address");

            if (destCoords == null || destCoords.get("lat") == null || destCoords.get("lng") == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Destination coordinates are required");
                return ResponseEntity.badRequest().body(response);
            }

            DistanceUtil.Coordinates sourceCoords;
            if (originCoords != null && originCoords.get("lat") != null && originCoords.get("lng") != null) {
                sourceCoords = new DistanceUtil.Coordinates(
                    Double.parseDouble(originCoords.get("lat").toString()),
                    Double.parseDouble(originCoords.get("lng").toString())
                );
            } else if (address != null && !address.trim().isEmpty()) {
                com.studenthelper.util.GeocodingUtil.GeocodeResult geocoded = distanceService.geocode(address, null);
                sourceCoords = new DistanceUtil.Coordinates(geocoded.getLat(), geocoded.getLng());
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Either originCoordinates or address must be provided");
                return ResponseEntity.badRequest().body(response);
            }

            DistanceUtil.Coordinates targetCoords = new DistanceUtil.Coordinates(
                Double.parseDouble(destCoords.get("lat").toString()),
                Double.parseDouble(destCoords.get("lng").toString())
            );

            DistanceUtil.DistanceResult result = distanceService.calculateDistance(sourceCoords, targetCoords);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            Map<String, Object> data = new HashMap<>();
            data.put("distance", result.getDistance());
            data.put("duration", result.getDuration());
            data.put("method", result.getMethod());
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error calculating distance: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

