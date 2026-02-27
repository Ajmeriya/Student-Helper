package com.studenthelper.mapper;

import com.studenthelper.dto.HostelRequest;
import com.studenthelper.dto.HostelResponse;
import com.studenthelper.entity.Hostel;
import org.springframework.stereotype.Component;

@Component
public class HostelMapper {

    public Hostel toEntity(HostelRequest request) {
        if (request == null) {
            return null;
        }

        Hostel hostel = new Hostel();
        hostel.setName(request.getName());
        hostel.setLocation(request.getLocation());
        hostel.setCity(request.getCity());
        hostel.setAddress(request.getAddress());
        
        // Map gender enum
        if (request.getGender() != null) {
            hostel.setGender(parseGender(request.getGender()));
        }
        
        hostel.setTotalRooms(request.getTotalRooms());
        hostel.setAvailableRooms(request.getAvailableRooms());
        hostel.setFees(request.getFees());
        
        // Map feesPeriod enum
        if (request.getFeesPeriod() != null) {
            hostel.setFeesPeriod(parseFeesPeriod(request.getFeesPeriod()));
        } else {
            hostel.setFeesPeriod(Hostel.FeesPeriod.monthly);
        }
        
        hostel.setDescription(request.getDescription());
        hostel.setRules(request.getRules());
        hostel.setContactNumber(request.getContactNumber());
        hostel.setContactEmail(request.getContactEmail());
        
        // Facilities
        if (request.getFacilities() != null) {
            Hostel.Facilities facilities = new Hostel.Facilities();
            facilities.setMess(request.getFacilities().getMess() != null ? request.getFacilities().getMess() : false);
            facilities.setWifi(request.getFacilities().getWifi() != null ? request.getFacilities().getWifi() : false);
            facilities.setLaundry(request.getFacilities().getLaundry() != null ? request.getFacilities().getLaundry() : false);
            facilities.setGym(request.getFacilities().getGym() != null ? request.getFacilities().getGym() : false);
            facilities.setLibrary(request.getFacilities().getLibrary() != null ? request.getFacilities().getLibrary() : false);
            facilities.setParking(request.getFacilities().getParking() != null ? request.getFacilities().getParking() : false);
            facilities.setSecurity(request.getFacilities().getSecurity() != null ? request.getFacilities().getSecurity() : false);
            facilities.setPowerBackup(request.getFacilities().getPowerBackup() != null ? request.getFacilities().getPowerBackup() : false);
            facilities.setWaterSupply(request.getFacilities().getWaterSupply() != null ? request.getFacilities().getWaterSupply() : false);
            hostel.setFacilities(facilities);
        } else {
            hostel.setFacilities(new Hostel.Facilities());
        }
        
        // Set coordinates
        if (request.getLatitude() != null && request.getLongitude() != null) {
            Hostel.Coordinates coords = new Hostel.Coordinates();
            coords.setLat(request.getLatitude());
            coords.setLng(request.getLongitude());
            hostel.setCoordinates(coords);
        }
        
        // Set images and videos
        if (request.getImages() != null) {
            hostel.setImages(request.getImages());
        }
        if (request.getVideos() != null) {
            hostel.setVideos(request.getVideos());
        }
        
        // Status
        if (request.getStatus() != null) {
            hostel.setStatus(parseHostelStatus(request.getStatus()));
        } else {
            hostel.setStatus(Hostel.HostelStatus.active);
        }
        
        return hostel;
    }

    public HostelResponse toResponse(Hostel hostel) {
        if (hostel == null) {
            return null;
        }

        HostelResponse response = new HostelResponse();
        response.setId(hostel.getId());
        response.setName(hostel.getName());
        response.setLocation(hostel.getLocation());
        response.setCity(hostel.getCity());
        response.setAddress(hostel.getAddress());
        response.setGender(hostel.getGender() != null ? hostel.getGender().name() : null);
        response.setTotalRooms(hostel.getTotalRooms());
        response.setAvailableRooms(hostel.getAvailableRooms());
        response.setFees(hostel.getFees());
        response.setFeesPeriod(hostel.getFeesPeriod() != null ? hostel.getFeesPeriod().name() : null);
        
        // Facilities
        if (hostel.getFacilities() != null) {
            HostelResponse.Facilities facilities = new HostelResponse.Facilities();
            facilities.setMess(hostel.getFacilities().getMess());
            facilities.setWifi(hostel.getFacilities().getWifi());
            facilities.setLaundry(hostel.getFacilities().getLaundry());
            facilities.setGym(hostel.getFacilities().getGym());
            facilities.setLibrary(hostel.getFacilities().getLibrary());
            facilities.setParking(hostel.getFacilities().getParking());
            facilities.setSecurity(hostel.getFacilities().getSecurity());
            facilities.setPowerBackup(hostel.getFacilities().getPowerBackup());
            facilities.setWaterSupply(hostel.getFacilities().getWaterSupply());
            response.setFacilities(facilities);
        }
        
        response.setDescription(hostel.getDescription());
        response.setRules(hostel.getRules());
        
        // Coordinates
        if (hostel.getCoordinates() != null) {
            HostelResponse.Coordinates coords = new HostelResponse.Coordinates();
            coords.setLat(hostel.getCoordinates().getLat());
            coords.setLng(hostel.getCoordinates().getLng());
            response.setCoordinates(coords);
        }
        
        response.setImages(hostel.getImages());
        response.setVideos(hostel.getVideos());
        
        // Admin information
        if (hostel.getAdmin() != null) {
            HostelResponse.AdminInfo adminInfo = new HostelResponse.AdminInfo();
            adminInfo.setId(hostel.getAdmin().getId());
            adminInfo.setName(hostel.getAdmin().getName());
            adminInfo.setEmail(hostel.getAdmin().getEmail());
            adminInfo.setPhoneNumber(hostel.getAdmin().getPhoneNumber());
            response.setAdmin(adminInfo);
        }
        
        response.setStatus(hostel.getStatus() != null ? hostel.getStatus().name() : null);
        response.setContactNumber(hostel.getContactNumber());
        response.setContactEmail(hostel.getContactEmail());
        response.setCreatedAt(hostel.getCreatedAt());
        response.setUpdatedAt(hostel.getUpdatedAt());
        
        return response;
    }

    public void updateEntityFromRequest(Hostel hostel, HostelRequest request) {
        if (hostel == null || request == null) {
            return;
        }

        if (request.getName() != null) {
            hostel.setName(request.getName());
        }
        if (request.getLocation() != null) {
            hostel.setLocation(request.getLocation());
        }
        if (request.getCity() != null) {
            hostel.setCity(request.getCity());
        }
        if (request.getAddress() != null) {
            hostel.setAddress(request.getAddress());
        }
        if (request.getGender() != null) {
            hostel.setGender(parseGender(request.getGender()));
        }
        if (request.getTotalRooms() != null) {
            hostel.setTotalRooms(request.getTotalRooms());
        }
        if (request.getAvailableRooms() != null) {
            hostel.setAvailableRooms(request.getAvailableRooms());
        }
        if (request.getFees() != null) {
            hostel.setFees(request.getFees());
        }
        if (request.getFeesPeriod() != null) {
            hostel.setFeesPeriod(parseFeesPeriod(request.getFeesPeriod()));
        }
        if (request.getDescription() != null) {
            hostel.setDescription(request.getDescription());
        }
        if (request.getRules() != null) {
            hostel.setRules(request.getRules());
        }
        if (request.getContactNumber() != null) {
            hostel.setContactNumber(request.getContactNumber());
        }
        if (request.getContactEmail() != null) {
            hostel.setContactEmail(request.getContactEmail());
        }
        
        // Facilities
        if (request.getFacilities() != null) {
            if (hostel.getFacilities() == null) {
                hostel.setFacilities(new Hostel.Facilities());
            }
            if (request.getFacilities().getMess() != null) {
                hostel.getFacilities().setMess(request.getFacilities().getMess());
            }
            if (request.getFacilities().getWifi() != null) {
                hostel.getFacilities().setWifi(request.getFacilities().getWifi());
            }
            if (request.getFacilities().getLaundry() != null) {
                hostel.getFacilities().setLaundry(request.getFacilities().getLaundry());
            }
            if (request.getFacilities().getGym() != null) {
                hostel.getFacilities().setGym(request.getFacilities().getGym());
            }
            if (request.getFacilities().getLibrary() != null) {
                hostel.getFacilities().setLibrary(request.getFacilities().getLibrary());
            }
            if (request.getFacilities().getParking() != null) {
                hostel.getFacilities().setParking(request.getFacilities().getParking());
            }
            if (request.getFacilities().getSecurity() != null) {
                hostel.getFacilities().setSecurity(request.getFacilities().getSecurity());
            }
            if (request.getFacilities().getPowerBackup() != null) {
                hostel.getFacilities().setPowerBackup(request.getFacilities().getPowerBackup());
            }
            if (request.getFacilities().getWaterSupply() != null) {
                hostel.getFacilities().setWaterSupply(request.getFacilities().getWaterSupply());
            }
        }
        
        // Coordinates
        if (request.getLatitude() != null && request.getLongitude() != null) {
            Hostel.Coordinates coords = new Hostel.Coordinates();
            coords.setLat(request.getLatitude());
            coords.setLng(request.getLongitude());
            hostel.setCoordinates(coords);
        }
        
        // Images and videos
        if (request.getImages() != null) {
            hostel.setImages(request.getImages());
        }
        if (request.getVideos() != null) {
            hostel.setVideos(request.getVideos());
        }
        
        // Status
        if (request.getStatus() != null) {
            hostel.setStatus(parseHostelStatus(request.getStatus()));
        }
    }

    private Hostel.Gender parseGender(String gender) {
        if (gender == null || gender.isEmpty()) {
            return Hostel.Gender.both;
        }
        
        try {
            return Hostel.Gender.valueOf(gender.toLowerCase());
        } catch (IllegalArgumentException e) {
            return Hostel.Gender.both;
        }
    }

    private Hostel.FeesPeriod parseFeesPeriod(String feesPeriod) {
        if (feesPeriod == null || feesPeriod.isEmpty()) {
            return Hostel.FeesPeriod.monthly;
        }
        
        try {
            return Hostel.FeesPeriod.valueOf(feesPeriod.toLowerCase());
        } catch (IllegalArgumentException e) {
            return Hostel.FeesPeriod.monthly;
        }
    }

    private Hostel.HostelStatus parseHostelStatus(String status) {
        if (status == null || status.isEmpty()) {
            return Hostel.HostelStatus.active;
        }
        
        try {
            return Hostel.HostelStatus.valueOf(status.toLowerCase());
        } catch (IllegalArgumentException e) {
            return Hostel.HostelStatus.active;
        }
    }
}

