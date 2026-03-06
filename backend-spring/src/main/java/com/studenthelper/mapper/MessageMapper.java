package com.studenthelper.mapper;

import com.studenthelper.dto.MessageRequest;
import com.studenthelper.entity.Message;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MessageMapper {

    public MessageRequest.RelatedToRequest toRelatedToRequest(Message.RelatedTo relatedTo) {
        if (relatedTo == null) {
            return null;
        }

        MessageRequest.RelatedToRequest request = new MessageRequest.RelatedToRequest();
        request.setType(relatedTo.getType() != null ? relatedTo.getType().name() : null);
        request.setId(relatedTo.getRelatedId());
        return request;
    }

    public Message.RelatedTo toRelatedTo(MessageRequest.RelatedToRequest request) {
        if (request == null) {
            return null;
        }

        Message.RelatedTo relatedTo = new Message.RelatedTo();
        if (request.getType() != null) {
            relatedTo.setType(Message.RelatedTo.RelatedToType.valueOf(request.getType()));
        }
        relatedTo.setRelatedId(request.getId());
        return relatedTo;
    }

    public Message.RelatedTo toRelatedToFromMap(Map<String, Object> relatedToMap) {
        if (relatedToMap == null) {
            return null;
        }

        Message.RelatedTo relatedTo = new Message.RelatedTo();
        if (relatedToMap.get("type") != null) {
            relatedTo.setType(Message.RelatedTo.RelatedToType.valueOf(relatedToMap.get("type").toString()));
        }
        if (relatedToMap.get("id") != null) {
            relatedTo.setRelatedId(Long.parseLong(relatedToMap.get("id").toString()));
        }
        return relatedTo;
    }
}

