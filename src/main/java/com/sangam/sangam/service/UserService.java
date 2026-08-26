package com.sangam.sangam.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
                .map(user -> new UserProfileResponse(
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
                                .collect(Collectors.toSet())))
                .toList();
    }

    public UserProfileResponse getUserProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
                        .collect(Collectors.toSet()));
    }

    public UserProfileResponse updateUserProfile(
            Long userId,
            UpdateProfileRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setBio(request.getBio());

        userRepository.save(user);

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
                        .collect(Collectors.toSet()));
    }

    public List<UserProfileResponse> getUsersBySkill(Long skillId) {

        return userRepository.findUsersBySkillId(skillId)
                .stream()
                .map(user -> new UserProfileResponse(
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
                                .collect(Collectors.toSet())))
                .toList();
    }
}