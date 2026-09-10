package com.sangam.sangam.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sangam.sangam.dto.AchievementDto;
import com.sangam.sangam.dto.ProjectDto;
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
                authentication != null ? authentication.getName() : null);
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
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.updateUserProfile(id, request, authentication != null ? authentication.getName() : null));
    }

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<UserProfileResponse>> getUsersBySkill(
            @PathVariable Long skillId) {
        return ResponseEntity.ok(
                userService.getUsersBySkill(skillId));
    }

    // Skills Management
    @PostMapping("/{id}/skills")
    public ResponseEntity<UserProfileResponse> addSkill(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String skillName = payload.get("skillName") != null ? payload.get("skillName") : payload.get("name");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.addSkillToUser(id, skillName, authentication != null ? authentication.getName() : null));
    }

    @DeleteMapping("/{id}/skills/{skillName}")
    public ResponseEntity<UserProfileResponse> removeSkill(
            @PathVariable Long id,
            @PathVariable String skillName,
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.removeSkillFromUser(id, skillName, authentication != null ? authentication.getName() : null));
    }

    // Achievements Management
    @PostMapping("/{id}/achievements")
    public ResponseEntity<AchievementDto> addAchievement(
            @PathVariable Long id,
            @RequestBody AchievementDto dto,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.addAchievement(id, dto, authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/{id}/achievements/{achievementId}")
    public ResponseEntity<AchievementDto> updateAchievement(
            @PathVariable Long id,
            @PathVariable Long achievementId,
            @RequestBody AchievementDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.updateAchievement(id, achievementId, dto, authentication != null ? authentication.getName() : null));
    }

    @DeleteMapping("/{id}/achievements/{achievementId}")
    public ResponseEntity<String> deleteAchievement(
            @PathVariable Long id,
            @PathVariable Long achievementId,
            Authentication authentication) {
        userService.deleteAchievement(id, achievementId, authentication != null ? authentication.getName() : null);
        return ResponseEntity.ok("Achievement deleted successfully");
    }

    // Projects Management
    @PostMapping("/{id}/projects")
    public ResponseEntity<ProjectDto> addProject(
            @PathVariable Long id,
            @RequestBody ProjectDto dto,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.addProject(id, dto, authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/{id}/projects/{projectId}")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable Long id,
            @PathVariable Long projectId,
            @RequestBody ProjectDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.updateProject(id, projectId, dto, authentication != null ? authentication.getName() : null));
    }

    @DeleteMapping("/{id}/projects/{projectId}")
    public ResponseEntity<String> deleteProject(
            @PathVariable Long id,
            @PathVariable Long projectId,
            Authentication authentication) {
        userService.deleteProject(id, projectId, authentication != null ? authentication.getName() : null);
        return ResponseEntity.ok("Project deleted successfully");
    }

    // Self Account Deletion with OTP Verification (Protected)
    @PostMapping("/delete-account/send-otp")
    public ResponseEntity<Map<String, String>> sendDeleteAccountOtp(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }
        userService.sendDeleteAccountOtp(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "OTP has been sent to your registered email"));
    }

    @PostMapping("/delete-account/verify-and-delete")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }
        String otp = payload != null ? payload.get("otp") : null;
        userService.deleteAccount(otp, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}