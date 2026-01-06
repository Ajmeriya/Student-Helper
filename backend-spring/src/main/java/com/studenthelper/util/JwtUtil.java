package com.studenthelper.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey signingKey = null;

    private synchronized SecretKey getSigningKey() {
        if (signingKey == null) {
            // For HS512, we need at least 512 bits (64 bytes)
            // Use SHA-512 to derive a consistent 64-byte key from the secret
            try {
                java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-512");
                byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
                // SHA-512 produces exactly 64 bytes, perfect for HS512
                signingKey = Keys.hmacShaKeyFor(keyBytes);
            } catch (java.security.NoSuchAlgorithmException e) {
                // Fallback: pad the secret if SHA-512 fails
                byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
                if (keyBytes.length < 64) {
                    byte[] padded = new byte[64];
                    for (int i = 0; i < 64; i++) {
                        padded[i] = keyBytes[i % keyBytes.length];
                    }
                    signingKey = Keys.hmacShaKeyFor(padded);
                } else {
                    signingKey = Keys.hmacShaKeyFor(keyBytes);
                }
            }
        }
        return signingKey;
    }

    public String generateToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        SecretKey key = getSigningKey();
        
        return Jwts.builder()
                .claim("userId", userId.toString())
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, Jwts.SIG.HS512)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Object userIdObj = claims.get("userId");
        if (userIdObj != null) {
            return Long.parseLong(userIdObj.toString());
        }
        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return false;
            }

            SecretKey key = getSigningKey();
            
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return !claims.getExpiration().before(new Date());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.debug("JWT token expired");
            return false;
        } catch (io.jsonwebtoken.security.SignatureException e) {
            logger.warn("JWT signature validation failed");
            return false;
        } catch (io.jsonwebtoken.security.WeakKeyException e) {
            logger.error("JWT weak key exception", e);
            return false;
        } catch (Exception e) {
            logger.error("JWT validation error", e);
            return false;
        }
    }
}

