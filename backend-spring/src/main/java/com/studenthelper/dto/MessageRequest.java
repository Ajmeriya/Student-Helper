package com.studenthelper.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private Long receiverId;
    private String content;
    private RelatedToRequest relatedTo;

    @Data
    public static class RelatedToRequest {
        private String type;
        private Long id;
    }
}

