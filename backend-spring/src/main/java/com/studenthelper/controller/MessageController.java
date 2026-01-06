package com.studenthelper.controller;

import com.studenthelper.entity.Message;
import com.studenthelper.entity.User;
import com.studenthelper.repository.MessageRepository;
import com.studenthelper.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/message")
@CrossOrigin(origins = "*")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(HttpServletRequest request) {
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<Message> messages = messageRepository.findBySenderIdOrReceiverId(userId, userId);
            
            Map<Long, Map<String, Object>> conversationsMap = new HashMap<>();
            
            for (Message msg : messages) {
                Long partnerId = msg.getSender().getId().equals(userId) 
                    ? msg.getReceiver().getId() 
                    : msg.getSender().getId();
                
                if (!conversationsMap.containsKey(partnerId)) {
                    User partner = msg.getSender().getId().equals(userId) 
                        ? msg.getReceiver() 
                        : msg.getSender();
                    
                    Map<String, Object> conv = new HashMap<>();
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", partner.getId());
                    userData.put("name", partner.getName());
                    userData.put("email", partner.getEmail());
                    conv.put("user", userData);
                    conv.put("lastMessage", msg.getContent());
                    conv.put("lastMessageTime", msg.getCreatedAt());
                    conv.put("unreadCount", 0);
                    conv.put("relatedTo", msg.getRelatedTo());
                    conversationsMap.put(partnerId, conv);
                }
                
                if (msg.getReceiver().getId().equals(userId) && !msg.getRead()) {
                    conversationsMap.get(partnerId).put("unreadCount", 
                        ((Integer) conversationsMap.get(partnerId).get("unreadCount")) + 1);
                }
            }

            List<Map<String, Object>> conversations = new ArrayList<>(conversationsMap.values());
            conversations.sort((a, b) -> ((LocalDateTime) b.get("lastMessageTime"))
                .compareTo((LocalDateTime) a.get("lastMessageTime")));

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

            List<Message> messages = messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
                currentUserId, userId, userId, currentUserId);

            // Sort messages by createdAt (oldest first) - like WhatsApp
            messages.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));

            // Mark as read
            for (Message msg : messages) {
                if (msg.getReceiver().getId().equals(currentUserId) && !msg.getRead()) {
                    msg.setRead(true);
                    msg.setReadAt(LocalDateTime.now());
                    messageRepository.save(msg);
                }
            }

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
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> requestData, HttpServletRequest request) {
        try {
            Long senderId = (Long) request.getAttribute("userId");
            if (senderId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Long receiverId = Long.parseLong(requestData.get("receiverId").toString());
            String content = (String) requestData.get("content");

            if (receiverId.equals(senderId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Cannot send message to yourself");
                return ResponseEntity.badRequest().body(response);
            }

            User receiver = userRepository.findById(receiverId).orElse(null);
            if (receiver == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Receiver not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            User sender = userRepository.findById(senderId).orElseThrow();

            Message message = new Message();
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setContent(content.trim());
            message.setRead(false);

            @SuppressWarnings("unchecked")
            Map<String, Object> relatedTo = (Map<String, Object>) requestData.get("relatedTo");
            if (relatedTo != null) {
                Message.RelatedTo related = new Message.RelatedTo();
                related.setType(Message.RelatedTo.RelatedToType.valueOf(
                    relatedTo.get("type").toString()));
                related.setRelatedId(Long.parseLong(relatedTo.get("id").toString()));
                message.setRelatedTo(related);
            }

            Message savedMessage = messageRepository.save(message);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message sent successfully");
            response.put("data", savedMessage);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

            long count = messageRepository.countByReceiverIdAndReadFalse(userId);

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

            Message message = messageRepository.findById(messageId).orElse(null);
            if (message == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Message not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Only allow deletion if user is the sender
            if (!message.getSender().getId().equals(userId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You can only delete your own messages");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            messageRepository.delete(message);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deleting message: " + messageId, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting message");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

