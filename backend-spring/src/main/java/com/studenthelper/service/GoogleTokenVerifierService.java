package com.studenthelper.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class GoogleTokenVerifierService {

    private final WebClient webClient;
    private final Set<String> allowedClientIds;

    public GoogleTokenVerifierService(
            @Value("${google.oauth.client-ids:}") String googleClientIds,
            WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://oauth2.googleapis.com").build();
        this.allowedClientIds = new HashSet<>();
        if (StringUtils.hasText(googleClientIds)) {
            Arrays.stream(googleClientIds.split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .forEach(allowedClientIds::add);
        }
    }

    public GoogleUserInfo verify(String idToken) {
        if (!StringUtils.hasText(idToken)) {
            throw new RuntimeException("Google token is required");
        }

        Map<String, Object> payload = webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/tokeninfo").queryParam("id_token", idToken).build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (payload == null) {
            throw new RuntimeException("Unable to verify Google token");
        }

        String audience = toStringValue(payload.get("aud"));
        if (!allowedClientIds.isEmpty() && !allowedClientIds.contains(audience)) {
            throw new RuntimeException("Google token audience mismatch");
        }

        String emailVerified = toStringValue(payload.get("email_verified"));
        if (!"true".equalsIgnoreCase(emailVerified)) {
            throw new RuntimeException("Google email is not verified");
        }

        GoogleUserInfo info = new GoogleUserInfo();
        info.setGoogleId(toStringValue(payload.get("sub")));
        info.setEmail(toStringValue(payload.get("email")));
        info.setName(toStringValue(payload.get("name")));
        return info;
    }

    private String toStringValue(Object value) {
        return value == null ? null : value.toString();
    }

    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String name;

        public String getGoogleId() {
            return googleId;
        }

        public void setGoogleId(String googleId) {
            this.googleId = googleId;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
