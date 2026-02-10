package com.studenthelper.converter;

import com.studenthelper.entity.PG;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class SharingTypeConverter implements AttributeConverter<PG.SharingType, String> {

    private static final Logger logger = LoggerFactory.getLogger(SharingTypeConverter.class);

    @Override
    public String convertToDatabaseColumn(PG.SharingType attribute) {
        if (attribute == null) {
            return null;
        }
        // Store the enum name (lowercase) or custom value
        return attribute.getValue();
    }

    @Override
    public PG.SharingType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        
        // Handle case-insensitive conversion
        String normalized = dbData.toLowerCase().trim();
        
        // Map database values to enum constants
        switch (normalized) {
            case "single":
                return PG.SharingType.single;
            case "double":
                return PG.SharingType.DOUBLE;
            case "triple":
                return PG.SharingType.triple;
            case "quad":
                return PG.SharingType.quad;
            default:
                // Try to find by enum name (case-insensitive)
                try {
                    // Try exact match first
                    for (PG.SharingType type : PG.SharingType.values()) {
                        if (type.name().equalsIgnoreCase(dbData) || type.getValue().equalsIgnoreCase(dbData)) {
                            return type;
                        }
                    }
                } catch (Exception e) {
                    // Fall through to default
                }
                // Default to single if unknown
                logger.warn("Unknown SharingType value: {}, defaulting to single", dbData);
                return PG.SharingType.single;
        }
    }
}

