package com.studenthelper.util;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
public class GeocodingUtil {

    private final WebClient webClient;

    public GeocodingUtil() {
        this.webClient = WebClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "Student-Helper-App/1.0")
                .build();
    }

    public GeocodeResult geocodeAddress(String address, String city) {
        try {
            String query = city != null && !city.isEmpty() ? address + ", " + city : address;
            String url = "/search?format=json&q=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8) + "&limit=1";

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (results != null && !results.isEmpty()) {
                Map<String, Object> result = results.get(0);
                Double lat = Double.parseDouble((String) result.get("lat"));
                Double lon = Double.parseDouble((String) result.get("lon"));
                String displayName = (String) result.get("display_name");

                return new GeocodeResult(lat, lon, displayName);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to geocode address: " + e.getMessage(), e);
        }

        throw new RuntimeException("Address not found. Please provide a more specific address.");
    }

    public String reverseGeocode(Double lat, Double lng) {
        try {
            String url = String.format("/reverse?format=json&lat=%s&lon=%s", lat, lng);

            Map<String, Object> result = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (result != null && result.get("display_name") != null) {
                return (String) result.get("display_name");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to reverse geocode: " + e.getMessage(), e);
        }

        throw new RuntimeException("Could not reverse geocode coordinates");
    }

    public static class GeocodeResult {
        private Double lat;
        private Double lng;
        private String displayName;

        public GeocodeResult(Double lat, Double lng, String displayName) {
            this.lat = lat;
            this.lng = lng;
            this.displayName = displayName;
        }

        public Double getLat() { return lat; }
        public Double getLng() { return lng; }
        public String getDisplayName() { return displayName; }
    }
}

