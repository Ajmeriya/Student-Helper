package com.studenthelper.service;

import com.studenthelper.util.DistanceUtil;
import com.studenthelper.util.GeocodingUtil;
import java.util.Map;

public interface DistanceService {
    GeocodingUtil.GeocodeResult geocode(String address, String city);
    String reverseGeocode(Double lat, Double lng);
    Map<String, Object> validateLocation(Double lat, Double lng);
    DistanceUtil.DistanceResult calculateDistance(DistanceUtil.Coordinates origin, DistanceUtil.Coordinates destination);
}

