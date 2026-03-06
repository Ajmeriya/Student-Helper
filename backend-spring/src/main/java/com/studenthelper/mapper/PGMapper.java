package com.studenthelper.mapper;

import com.studenthelper.dto.PGRequest;
import com.studenthelper.dto.PGResponse;
import com.studenthelper.entity.PG;
import org.springframework.stereotype.Component;

@Component
public class PGMapper {

    public PG toEntity(PGRequest request) {
        if (request == null) {
            return null;
        }

        PG pg = new PG();
        pg.setTitle(request.getTitle());
        pg.setLocation(request.getLocation());
        pg.setCity(request.getCity());
        pg.setCollegeName(request.getCollegeName());
        
        // Map sharingType enum
        if (request.getSharingType() != null) {
            pg.setSharingType(parseSharingType(request.getSharingType()));
        }
        
        pg.setBedrooms(request.getBedrooms());
        pg.setBathrooms(request.getBathrooms());
        pg.setFloorNumber(request.getFloorNumber() != null ? request.getFloorNumber() : 0);
        pg.setPrice(request.getPrice());
        pg.setSecurityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : 0.0);
        pg.setMaintenance(request.getMaintenance() != null ? request.getMaintenance() : 0.0);
        
        // Facilities
        pg.setAc(request.getAc() != null ? request.getAc() : false);
        pg.setFurnished(request.getFurnished() != null ? request.getFurnished() : false);
        pg.setOwnerOnFirstFloor(request.getOwnerOnFirstFloor() != null ? request.getOwnerOnFirstFloor() : false);
        pg.setFoodAvailable(request.getFoodAvailable() != null ? request.getFoodAvailable() : false);
        pg.setPowerBackup(request.getPowerBackup() != null ? request.getPowerBackup() : false);
        pg.setParking(request.getParking() != null ? request.getParking() : false);
        
        // Map waterSupply enum
        if (request.getWaterSupply() != null && !request.getWaterSupply().isEmpty()) {
            pg.setWaterSupply(parseWaterSupply(request.getWaterSupply()));
        } else {
            pg.setWaterSupply(PG.WaterSupply.EMPTY);
        }
        
        // Map preferredTenant enum
        if (request.getPreferredTenant() != null && !request.getPreferredTenant().isEmpty()) {
            pg.setPreferredTenant(parsePreferredTenant(request.getPreferredTenant()));
        } else {
            pg.setPreferredTenant(PG.PreferredTenant.EMPTY);
        }
        
        pg.setAvailabilityDate(request.getAvailabilityDate());
        pg.setNearbyLandmarks(request.getNearbyLandmarks());
        pg.setInstructions(request.getInstructions());
        
        // Set coordinates
        if (request.getLatitude() != null && request.getLongitude() != null) {
            PG.Coordinates coords = new PG.Coordinates();
            coords.setLat(request.getLatitude());
            coords.setLng(request.getLongitude());
            pg.setCoordinates(coords);
        }
        
        // Set images and videos
        if (request.getImages() != null) {
            pg.setImages(request.getImages());
        }
        if (request.getVideos() != null) {
            pg.setVideos(request.getVideos());
        }
        
        // Status fields
        if (request.getStatus() != null) {
            pg.setStatus(parsePGStatus(request.getStatus()));
        } else {
            pg.setStatus(PG.PGStatus.available);
        }
        pg.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        pg.setRentalPeriod(request.getRentalPeriod());
        pg.setSoldDate(request.getSoldDate());
        pg.setRentalStartDate(request.getRentalStartDate());
        pg.setRentalEndDate(request.getRentalEndDate());
        
        return pg;
    }

    public PGResponse toResponse(PG pg) {
        if (pg == null) {
            return null;
        }

        PGResponse response = new PGResponse();
        response.setId(pg.getId());
        response.setTitle(pg.getTitle());
        response.setLocation(pg.getLocation());
        response.setCity(pg.getCity());
        response.setCollegeName(pg.getCollegeName());
        response.setSharingType(pg.getSharingType() != null ? pg.getSharingType().getValue() : null);
        response.setBedrooms(pg.getBedrooms());
        response.setBathrooms(pg.getBathrooms());
        response.setFloorNumber(pg.getFloorNumber());
        response.setPrice(pg.getPrice());
        response.setSecurityDeposit(pg.getSecurityDeposit());
        response.setMaintenance(pg.getMaintenance());
        
        // Facilities
        response.setAc(pg.getAc());
        response.setFurnished(pg.getFurnished());
        response.setOwnerOnFirstFloor(pg.getOwnerOnFirstFloor());
        response.setFoodAvailable(pg.getFoodAvailable());
        response.setPowerBackup(pg.getPowerBackup());
        response.setParking(pg.getParking());
        response.setWaterSupply(pg.getWaterSupply() != null ? pg.getWaterSupply().getValue() : null);
        response.setPreferredTenant(pg.getPreferredTenant() != null ? pg.getPreferredTenant().getValue() : null);
        
        response.setAvailabilityDate(pg.getAvailabilityDate());
        response.setNearbyLandmarks(pg.getNearbyLandmarks());
        response.setInstructions(pg.getInstructions());
        
        // Coordinates
        if (pg.getCoordinates() != null) {
            PGResponse.Coordinates coords = new PGResponse.Coordinates();
            coords.setLat(pg.getCoordinates().getLat());
            coords.setLng(pg.getCoordinates().getLng());
            response.setCoordinates(coords);
        }
        
        response.setDistanceToCollege(pg.getDistanceToCollege());
        response.setImages(pg.getImages());
        response.setVideos(pg.getVideos());
        
        // Broker information
        if (pg.getBroker() != null) {
            PGResponse.BrokerInfo brokerInfo = new PGResponse.BrokerInfo();
            brokerInfo.setId(pg.getBroker().getId());
            brokerInfo.setName(pg.getBroker().getName());
            brokerInfo.setEmail(pg.getBroker().getEmail());
            brokerInfo.setPhoneNumber(pg.getBroker().getPhoneNumber());
            response.setBroker(brokerInfo);
        }
        
        response.setIsActive(pg.getIsActive());
        response.setStatus(pg.getStatus() != null ? pg.getStatus().name() : null);
        response.setRentalPeriod(pg.getRentalPeriod());
        response.setSoldDate(pg.getSoldDate());
        response.setRentalStartDate(pg.getRentalStartDate());
        response.setRentalEndDate(pg.getRentalEndDate());
        response.setCreatedAt(pg.getCreatedAt());
        response.setUpdatedAt(pg.getUpdatedAt());
        
        return response;
    }

    public void updateEntityFromRequest(PG pg, PGRequest request) {
        if (pg == null || request == null) {
            return;
        }

        if (request.getTitle() != null) {
            pg.setTitle(request.getTitle());
        }
        if (request.getLocation() != null) {
            pg.setLocation(request.getLocation());
        }
        if (request.getCity() != null) {
            pg.setCity(request.getCity());
        }
        if (request.getCollegeName() != null) {
            pg.setCollegeName(request.getCollegeName());
        }
        if (request.getSharingType() != null) {
            pg.setSharingType(parseSharingType(request.getSharingType()));
        }
        if (request.getBedrooms() != null) {
            pg.setBedrooms(request.getBedrooms());
        }
        if (request.getBathrooms() != null) {
            pg.setBathrooms(request.getBathrooms());
        }
        if (request.getFloorNumber() != null) {
            pg.setFloorNumber(request.getFloorNumber());
        }
        if (request.getPrice() != null) {
            pg.setPrice(request.getPrice());
        }
        if (request.getSecurityDeposit() != null) {
            pg.setSecurityDeposit(request.getSecurityDeposit());
        }
        if (request.getMaintenance() != null) {
            pg.setMaintenance(request.getMaintenance());
        }
        
        // Facilities
        if (request.getAc() != null) {
            pg.setAc(request.getAc());
        }
        if (request.getFurnished() != null) {
            pg.setFurnished(request.getFurnished());
        }
        if (request.getOwnerOnFirstFloor() != null) {
            pg.setOwnerOnFirstFloor(request.getOwnerOnFirstFloor());
        }
        if (request.getFoodAvailable() != null) {
            pg.setFoodAvailable(request.getFoodAvailable());
        }
        if (request.getPowerBackup() != null) {
            pg.setPowerBackup(request.getPowerBackup());
        }
        if (request.getParking() != null) {
            pg.setParking(request.getParking());
        }
        
        if (request.getWaterSupply() != null) {
            pg.setWaterSupply(parseWaterSupply(request.getWaterSupply()));
        }
        if (request.getPreferredTenant() != null) {
            pg.setPreferredTenant(parsePreferredTenant(request.getPreferredTenant()));
        }
        
        if (request.getAvailabilityDate() != null) {
            pg.setAvailabilityDate(request.getAvailabilityDate());
        }
        if (request.getNearbyLandmarks() != null) {
            pg.setNearbyLandmarks(request.getNearbyLandmarks());
        }
        if (request.getInstructions() != null) {
            pg.setInstructions(request.getInstructions());
        }
        
        // Coordinates
        if (request.getLatitude() != null && request.getLongitude() != null) {
            PG.Coordinates coords = new PG.Coordinates();
            coords.setLat(request.getLatitude());
            coords.setLng(request.getLongitude());
            pg.setCoordinates(coords);
        }
        
        // Images and videos
        if (request.getImages() != null) {
            pg.setImages(request.getImages());
        }
        if (request.getVideos() != null) {
            pg.setVideos(request.getVideos());
        }
        
        // Status fields
        if (request.getStatus() != null) {
            pg.setStatus(parsePGStatus(request.getStatus()));
        }
        if (request.getIsActive() != null) {
            pg.setIsActive(request.getIsActive());
        }
        if (request.getRentalPeriod() != null) {
            pg.setRentalPeriod(request.getRentalPeriod());
        }
        if (request.getSoldDate() != null) {
            pg.setSoldDate(request.getSoldDate());
        }
        if (request.getRentalStartDate() != null) {
            pg.setRentalStartDate(request.getRentalStartDate());
        }
        if (request.getRentalEndDate() != null) {
            pg.setRentalEndDate(request.getRentalEndDate());
        }
    }

    private PG.SharingType parseSharingType(String sharingType) {
        if (sharingType == null || sharingType.isEmpty()) {
            return PG.SharingType.single;
        }
        
        if ("double".equalsIgnoreCase(sharingType)) {
            return PG.SharingType.DOUBLE;
        }
        
        try {
            String normalized = sharingType.toLowerCase();
            if ("single".equals(normalized)) {
                return PG.SharingType.single;
            } else if ("triple".equals(normalized)) {
                return PG.SharingType.triple;
            } else if ("quad".equals(normalized)) {
                return PG.SharingType.quad;
            } else {
                return PG.SharingType.valueOf(sharingType);
            }
        } catch (IllegalArgumentException e) {
            return PG.SharingType.single;
        }
    }

    private PG.WaterSupply parseWaterSupply(String waterSupply) {
        if (waterSupply == null || waterSupply.isEmpty()) {
            return PG.WaterSupply.EMPTY;
        }
        
        if ("24x7".equals(waterSupply) || "FULL_24X7".equals(waterSupply)) {
            return PG.WaterSupply.FULL_24X7;
        } else if ("timing".equalsIgnoreCase(waterSupply) || "TIMING".equals(waterSupply)) {
            return PG.WaterSupply.TIMING;
        } else if ("limited".equalsIgnoreCase(waterSupply) || "LIMITED".equals(waterSupply)) {
            return PG.WaterSupply.LIMITED;
        } else {
            return PG.WaterSupply.EMPTY;
        }
    }

    private PG.PreferredTenant parsePreferredTenant(String preferredTenant) {
        if (preferredTenant == null || preferredTenant.isEmpty()) {
            return PG.PreferredTenant.EMPTY;
        }
        
        try {
            return PG.PreferredTenant.valueOf(preferredTenant.toLowerCase());
        } catch (IllegalArgumentException e) {
            return PG.PreferredTenant.EMPTY;
        }
    }

    private PG.PGStatus parsePGStatus(String status) {
        if (status == null || status.isEmpty()) {
            return PG.PGStatus.available;
        }
        
        try {
            return PG.PGStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return PG.PGStatus.available;
        }
    }
}

