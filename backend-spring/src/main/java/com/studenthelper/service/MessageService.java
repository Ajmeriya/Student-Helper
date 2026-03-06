package com.studenthelper.service;

import com.studenthelper.dto.MessageRequest;
import com.studenthelper.dto.MessageResponse;
import java.util.List;
import java.util.Map;

public interface MessageService {
    List<Map<String, Object>> getConversations(Long userId);
    List<MessageResponse> getMessages(Long currentUserId, Long otherUserId);
    MessageResponse sendMessage(Long senderId, MessageRequest messageRequest);
    long getUnreadCount(Long userId);
    void deleteMessage(Long messageId, Long userId);
}

