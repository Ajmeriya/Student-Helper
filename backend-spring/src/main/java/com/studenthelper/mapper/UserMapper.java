package com.studenthelper.mapper;

import com.studenthelper.dto.AuthResponse;
import com.studenthelper.dto.UpdateUserProfileRequest;
import com.studenthelper.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserMapper {

    @Autowired
    private ModelMapper modelMapper;

    public AuthResponse.UserData toUserData(User user) {
        if (user == null) {
            return null;
        }

        AuthResponse.UserData userData = modelMapper.map(user, AuthResponse.UserData.class);
        
        // Map enum to string
        if (user.getRole() != null) {
            userData.setRole(user.getRole().name());
        }

        return userData;
    }

    public void updateUserFromRequest(User user, UpdateUserProfileRequest request) {
        if (request == null || user == null) {
            return;
        }

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }

        if (request.getPhoneNumber() != null) {
            String phone = request.getPhoneNumber().replaceAll("\\D", "");
            if (phone.length() == 10) {
                user.setPhoneNumber(phone);
            } else {
                throw new RuntimeException("Phone number must be exactly 10 digits");
            }
        }

        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }

        if (user.getRole() == User.Role.student) {
            if (request.getCollegeName() != null) {
                user.setCollegeName(request.getCollegeName().trim());
            }

            if (request.getCollegeLocation() != null) {
                User.Location location = new User.Location();
                if (request.getCollegeLocation().getCoordinates() != null) {
                    User.Coordinates coordinates = new User.Coordinates();
                    coordinates.setLat(request.getCollegeLocation().getCoordinates().getLat());
                    coordinates.setLng(request.getCollegeLocation().getCoordinates().getLng());
                    location.setCoordinates(coordinates);
                }
                if (request.getCollegeLocation().getAddress() != null) {
                    location.setAddress(request.getCollegeLocation().getAddress().trim());
                }
                user.setCollegeLocation(location);
            }
        }
    }

    public void updateUserFromMap(User user, Map<String, Object> updateData) {
        if (updateData == null || user == null) {
            return;
        }

        if (updateData.containsKey("name")) {
            user.setName(updateData.get("name").toString().trim());
        }

        if (updateData.containsKey("phoneNumber")) {
            String phone = updateData.get("phoneNumber").toString().replaceAll("\\D", "");
            if (phone.length() == 10) {
                user.setPhoneNumber(phone);
            } else {
                throw new RuntimeException("Phone number must be exactly 10 digits");
            }
        }

        if (updateData.containsKey("city")) {
            user.setCity(updateData.get("city").toString().trim());
        }

        if (user.getRole() == User.Role.student) {
            if (updateData.containsKey("collegeName")) {
                user.setCollegeName(updateData.get("collegeName").toString().trim());
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> collegeLocation = (Map<String, Object>) updateData.get("collegeLocation");
            if (collegeLocation != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> coords = (Map<String, Object>) collegeLocation.get("coordinates");
                if (coords != null) {
                    User.Location location = new User.Location();
                    User.Coordinates coordinates = new User.Coordinates();
                    coordinates.setLat(Double.parseDouble(coords.get("lat").toString()));
                    coordinates.setLng(Double.parseDouble(coords.get("lng").toString()));
                    location.setCoordinates(coordinates);
                    user.setCollegeLocation(location);
                }
            }
        }
    }
}

