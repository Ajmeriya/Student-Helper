package com.studenthelper.util;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
public class DistanceUtil {

    private final WebClient webClient;

    public DistanceUtil() {
        this.webClient = WebClient.builder()
                .baseUrl("http://router.project-osrm.org")
                .build();
    }

    public DistanceResult calculateRoadDistance(Coordinates point1, Coordinates point2) {
        try {
            String url = String.format("/route/v1/driving/%s,%s;%s,%s?overview=false&alternatives=false&steps=false",
                    point1.getLng(), point1.getLat(), point2.getLng(), point2.getLat());

            Map<String, Object> response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && "Ok".equals(response.get("code"))) {
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> routes = (java.util.List<Map<String, Object>>) response.get("routes");
                if (routes != null && !routes.isEmpty()) {
                    Map<String, Object> route = routes.get(0);
                    Double distanceInMeters = ((Number) route.get("distance")).doubleValue();
                    Double durationInSeconds = ((Number) route.get("duration")).doubleValue();

                    double distanceInKm = distanceInMeters / 1000.0;
                    int durationInMinutes = (int) Math.round(durationInSeconds / 60.0);

                    return new DistanceResult(distanceInKm, durationInMinutes, "road");
                }
            }
        } catch (Exception e) {
            // Fall through to direct distance
        }

        return calculateDirectDistance(point1, point2);
    }

    public DistanceResult calculateDirectDistance(Coordinates point1, Coordinates point2) {
        double R = 6371; // Earth's radius in kilometers
        double dLat = Math.toRadians(point2.getLat() - point1.getLat());
        double dLng = Math.toRadians(point2.getLng() - point1.getLng());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(point1.getLat())) *
                Math.cos(Math.toRadians(point2.getLat())) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;

        return new DistanceResult(distance, null, "direct");
    }

    public static class Coordinates {
        private Double lat;
        private Double lng;

        public Coordinates() {}

        public Coordinates(Double lat, Double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
    }

    public static class DistanceResult {
        private Double distance;
        private Integer duration;
        private String method;

        public DistanceResult(Double distance, Integer duration, String method) {
            this.distance = distance;
            this.duration = duration;
            this.method = method;
        }

        public Double getDistance() { return distance; }
        public Integer getDuration() { return duration; }
        public String getMethod() { return method; }
    }
}

