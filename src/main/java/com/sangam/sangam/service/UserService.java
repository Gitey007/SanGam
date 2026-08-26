package com.sangam.sangam.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserProfileResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toUserProfileResponse)
                .toList();
    }

    public UserProfileResponse getUserProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return toUserProfileResponse(user);
    }

    public UserProfileResponse updateUserProfile(
            Long userId,
            UpdateProfileRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getCollege() != null && !request.getCollege().trim().isEmpty()) {
            user.setCollege(request.getCollege().trim());
        }
        if (request.getBranch() != null && !request.getBranch().trim().isEmpty()) {
            user.setBranch(request.getBranch().trim());
        }
        if (request.getYear() != null) {
            user.setYear(request.getYear());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return toUserProfileResponse(savedUser);
    }

    public List<UserProfileResponse> getUsersBySkill(Long skillId) {

        return userRepository.findUsersBySkillId(skillId)
                .stream()
                .map(this::toUserProfileResponse)
                .toList();
    }

    public UserProfileResponse toUserProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getBranch(),
                user.getYear(),
                user.getBio(),
                user.getSkills()
                        .stream()
                        .map(skill -> skill.getName())
                        .collect(Collectors.toSet())
        );
    }
}