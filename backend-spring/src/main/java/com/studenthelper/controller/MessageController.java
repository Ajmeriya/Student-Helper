package com.studenthelper.controller;

import com.studenthelper.dto.MessageRequest;
import com.studenthelper.dto.MessageResponse;
import com.studenthelper.entity.User;
import com.studenthelper.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/message")
@CrossOrigin(origins = "*")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<Map<String, Object>> conversations = messageService.getConversations(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", conversations.size());
            response.put("conversations", conversations);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching conversations");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getMessages(@PathVariable Long userId, HttpServletRequest request) {
        try {
            Long currentUserId = (Long) request.getAttribute("userId");
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<MessageResponse> messages = messageService.getMessages(currentUserId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", messages.size());
            response.put("messages", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching messages");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> sendMessage(
            @Valid @RequestBody MessageRequest messageRequest, 
            HttpServletRequest request) {
        try {
            Long senderId = (Long) request.getAttribute("userId");
            if (senderId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            MessageResponse savedMessage = messageService.sendMessage(senderId, messageRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message sent successfully");
            response.put("data", savedMessage);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error sending message");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            long count = messageService.getUnreadCount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("unreadCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching unread count");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable Long messageId, HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            
            if (userId == null) {
                // Try to get from SecurityContext as fallback
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    User user = (User) authentication.getPrincipal();
                    userId = user.getId();
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Authentication required. Please provide a valid token.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
                }
            }

            messageService.deleteMessage(messageId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            logger.error("Error deleting message: " + messageId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting message");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

