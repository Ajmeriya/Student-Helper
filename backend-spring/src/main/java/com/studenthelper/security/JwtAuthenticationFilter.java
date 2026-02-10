package com.studenthelper.security;

import com.studenthelper.entity.User;
import com.studenthelper.repository.UserRepository;
import com.studenthelper.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Skip filter for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Skip filter for OPTIONS requests (preflight)
            if ("OPTIONS".equals(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // Skip JWT validation for public endpoints (auth endpoints allow all methods)
            String requestURI = request.getRequestURI();
            String method = request.getMethod();
            
            // Allow all methods for auth endpoints (login, signup, etc.)
            if (requestURI.startsWith("/api/auth/")) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // Allow GET requests for other public endpoints
            if ("GET".equals(method) && (
                requestURI.equals("/api/health") ||
                requestURI.startsWith("/api/distance/") ||
                (requestURI.startsWith("/api/pg") && !requestURI.contains("/my-pgs")) ||
                (requestURI.startsWith("/api/hostel") && !requestURI.contains("/my-hostels")) ||
                (requestURI.startsWith("/api/item") && !requestURI.contains("/my-items"))
            )) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // For all other endpoints (including payment), validate JWT if present
            String jwt = getJwtFromRequest(request);
            
            if (jwt != null) {
                boolean isValid = jwtUtil.validateToken(jwt);
                
                if (isValid) {
                    try {
                        Long userId = jwtUtil.getUserIdFromToken(jwt);
                        
                        try {
                            User user = userRepository.findById(userId).orElse(null);
                            
                            if (user != null) {
                                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                                String role = "ROLE_" + user.getRole().name().toUpperCase();
                                authorities.add(new SimpleGrantedAuthority(role));
                                
                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(user, null, authorities);
                                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                                
                                // Also set request attributes for backward compatibility
                                request.setAttribute("userId", userId);
                                request.setAttribute("user", user);
                            } else {
                                logger.error("User not found in DB for userId: " + userId);
                            }
                        } catch (Exception dbError) {
                            logger.error("Database error while looking up user: " + dbError.getMessage(), dbError);
                        }
                    } catch (Exception e) {
                        logger.error("Error setting authentication: " + e.getMessage(), e);
                    }
                } else {
                    // Token is invalid - log but continue (Spring Security will handle authorization)
                    logger.debug("Invalid JWT token provided for: " + requestURI);
                }
            } else {
                // No token provided - log but continue (Spring Security will handle authorization)
                logger.debug("No JWT token provided for: " + requestURI);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: " + e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

