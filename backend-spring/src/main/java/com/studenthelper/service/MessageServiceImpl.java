package com.studenthelper.service;

import com.studenthelper.dto.MessageRequest;
import com.studenthelper.dto.MessageResponse;
import com.studenthelper.entity.Message;
import com.studenthelper.entity.User;
import com.studenthelper.mapper.MessageMapper;
import com.studenthelper.repository.MessageRepository;
import com.studenthelper.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private static final Logger logger = LoggerFactory.getLogger(MessageServiceImpl.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private MessageMapper messageMapper;

    @Override
    public List<Map<String, Object>> getConversations(Long userId) {
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

        return conversations;
    }

    @Override
    public List<MessageResponse> getMessages(Long currentUserId, Long otherUserId) {
        List<Message> messages = messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
            currentUserId, otherUserId, otherUserId, currentUserId);

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

        // Convert Entity to DTO and return
        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MessageResponse sendMessage(Long senderId, MessageRequest messageRequest) {
        if (messageRequest.getReceiverId().equals(senderId)) {
            throw new RuntimeException("Cannot send message to yourself");
        }

        User receiver = userRepository.findById(messageRequest.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        User sender = userRepository.findById(senderId).orElseThrow();

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageRequest.getContent().trim());
        message.setRead(false);

        if (messageRequest.getRelatedTo() != null) {
            Message.RelatedTo related = messageMapper.toRelatedTo(messageRequest.getRelatedTo());
            message.setRelatedTo(related);
        }

        Message savedMessage = messageRepository.save(message);
        
        // Convert Entity to DTO and return
        return toMessageResponse(savedMessage);
    }

    private MessageResponse toMessageResponse(Message message) {
        MessageResponse response = modelMapper.map(message, MessageResponse.class);
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getName());
        response.setReceiverId(message.getReceiver().getId());
        response.setReceiverName(message.getReceiver().getName());
        
        if (message.getRelatedTo() != null) {
            MessageResponse.RelatedToResponse relatedToResponse = new MessageResponse.RelatedToResponse();
            relatedToResponse.setType(message.getRelatedTo().getType().name());
            relatedToResponse.setRelatedId(message.getRelatedTo().getRelatedId());
            response.setRelatedTo(relatedToResponse);
        }
        
        return response;
    }

    @Override
    public long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverIdAndReadFalse(userId);
    }

    @Override
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Only allow deletion if user is the sender
        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own messages");
        }

        messageRepository.delete(message);
    }
}

