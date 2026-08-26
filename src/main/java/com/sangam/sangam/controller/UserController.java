package com.sangam.sangam.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.security.SecurityUtils;
import com.sangam.sangam.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserProfileResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to view your profile");
        }
        return ResponseEntity.ok(userService.getUserProfile(currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                userService.getUserProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest request) {

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null && !currentUserId.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }

        return ResponseEntity.ok(
                userService.updateUserProfile(id, request));
    }

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<UserProfileResponse>> getUsersBySkill(
            @PathVariable Long skillId) {
        return ResponseEntity.ok(
                userService.getUsersBySkill(skillId));
    }
}