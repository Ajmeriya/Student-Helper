package com.studenthelper.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        logger.warn("Resource not found: {}", ex.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("error", "Resource Not Found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequestException(BadRequestException ex) {
        logger.warn("Bad request: {}", ex.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("error", "Bad Request");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.warn("Illegal argument: {}", ex.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("error", "Invalid Argument");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        logger.error("Runtime exception: {}", ex.getMessage(), ex);
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("error", "Internal Server Error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        logger.warn("Access denied: {}", ex.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Access denied. You don't have permission to perform this action.");
        response.put("error", "Forbidden");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        logger.warn("Bad credentials: {}", ex.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid email or password");
        response.put("error", "Unauthorized");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        logger.warn("Validation error: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Validation failed");
        response.put("errors", errors);
        response.put("error", "Validation Error");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "An unexpected error occurred. Please try again later.");
        response.put("error", "Internal Server Error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

