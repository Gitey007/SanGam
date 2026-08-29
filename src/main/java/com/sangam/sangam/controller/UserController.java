package com.sangam.sangam.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserProfileResponse> getUsers(
            @RequestParam(required = false, defaultValue = "ALL") String scope,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String skill,
            Authentication authentication) {

        return userService.getUsers(
                scope,
                year,
                skill,
                authentication.getName());
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