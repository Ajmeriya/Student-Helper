package com.studenthelper.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private String content;
    private Boolean read;
    private LocalDateTime createdAt;
    private RelatedToResponse relatedTo;

    @Data
    public static class RelatedToResponse {
        private String type;
        private Long relatedId;
    }
}

