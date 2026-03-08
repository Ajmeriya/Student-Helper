package com.studenthelper.service;

import com.studenthelper.util.DistanceUtil;
import com.studenthelper.util.GeocodingUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DistanceServiceImpl implements DistanceService {

    private static final Logger logger = LoggerFactory.getLogger(DistanceServiceImpl.class);

    @Autowired
    private GeocodingUtil geocodingUtil;

    @Autowired
    private DistanceUtil distanceUtil;

    @Override
    public GeocodingUtil.GeocodeResult geocode(String address, String city) {
        if (address == null || address.trim().isEmpty()) {
            throw new RuntimeException("Address is required");
        }
        return geocodingUtil.geocodeAddress(address, city);
    }

    @Override
    public String reverseGeocode(Double lat, Double lng) {
        return geocodingUtil.reverseGeocode(lat, lng);
    }

    @Override
    public Map<String, Object> validateLocation(Double lat, Double lng) {
        Map<String, Object> result = new HashMap<>();
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            result.put("valid", false);
            result.put("message", "Coordinates are outside valid range");
            return result;
        }

        try {
            String address = geocodingUtil.reverseGeocode(lat, lng);
            String addressLower = address.toLowerCase();
            String[] waterTerms = {"ocean", "sea", "water", "lake", "river", "bay", "gulf", "strait"};
            boolean isWater = false;
            for (String term : waterTerms) {
                if (addressLower.contains(term)) {
                    isWater = true;
                    break;
                }
            }

            result.put("valid", !isWater);
            if (isWater) {
                result.put("message", "This location appears to be in water. Please select a location on land.");
            } else {
                result.put("message", "Location is valid");
                result.put("address", address);
            }
        } catch (Exception e) {
            result.put("valid", true);
            result.put("message", "Location validation completed");
        }

        return result;
    }

    @Override
    public DistanceUtil.DistanceResult calculateDistance(DistanceUtil.Coordinates origin, DistanceUtil.Coordinates destination) {
        return distanceUtil.calculateRoadDistance(origin, destination);
    }
}

