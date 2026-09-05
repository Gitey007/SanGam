package com.sangam.sangam.service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAllWithSkills()
                .stream()
                .map(this::mapToUserProfileResponse)
                .toList();
    }

    public List<UserProfileResponse> getUsers(
            String scope,
            Integer year,
            String skill,
            String email) {

        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        User currentUser = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentCollege = currentUser.getCollege();
        Byte byteYear = year != null ? year.byteValue() : null;

        List<User> users;

        if ("MY_COLLEGE".equalsIgnoreCase(scope)) {
            if (byteYear != null) {
                users = userRepository.findByCollegeAndYear(currentCollege, byteYear);
            } else {
                users = userRepository.findByCollege(currentCollege);
            }
        } else if ("INTER_COLLEGE".equalsIgnoreCase(scope)) {
            if (byteYear != null) {
                users = userRepository.findByCollegeNotAndYear(currentCollege, byteYear);
            } else {
                users = userRepository.findByCollegeNot(currentCollege);
            }
        } else {
            if (byteYear != null) {
                users = userRepository.findByYear(byteYear);
            } else {
                users = userRepository.findAllWithSkills();
            }
        }

        if (skill != null && !skill.isBlank()) {
            String trimmedSkill = skill.trim();
            users = users.stream()
                    .filter(user -> user.getSkills() != null && user.getSkills().stream()
                            .anyMatch(s -> s.getName() != null && s.getName().equalsIgnoreCase(trimmedSkill)))
                    .toList();
        }

        return users.stream()
                .map(this::mapToUserProfileResponse)
                .toList();
    }

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findWithSkillsById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateUserProfile(
            Long userId,
            UpdateProfileRequest request) {

        User user = userRepository.findWithSkillsById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setBio(request.getBio());

        userRepository.save(user);

        return mapToUserProfileResponse(user);
    }

    public List<UserProfileResponse> getUsersBySkill(Long skillId) {
        return userRepository.findUsersBySkillId(skillId)
                .stream()
                .map(this::mapToUserProfileResponse)
                .toList();
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        Set<String> skillNames = user.getSkills() != null
                ? user.getSkills().stream()
                        .map(Skill::getName)
                        .filter(name -> name != null && !name.isBlank())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getBranch(),
                user.getYear(),
                user.getBio(),
                skillNames
        );
    }
}