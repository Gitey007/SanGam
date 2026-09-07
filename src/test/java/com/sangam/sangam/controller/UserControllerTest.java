package com.sangam.sangam.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.sangam.sangam.config.GlobalExceptionHandler;
import com.sangam.sangam.dto.AchievementDto;
import com.sangam.sangam.dto.ProjectDto;
import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.service.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private Authentication userAuth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        userAuth = new UsernamePasswordAuthenticationToken("user@college.edu", null);
    }

    @Test
    @DisplayName("GET /api/users/{id} -> 200 OK with full profile")
    void testGetUserProfile() throws Exception {
        UserProfileResponse resp = new UserProfileResponse();
        resp.setId(1L);
        resp.setName("Test User");
        resp.setEmail("user@college.edu");
        resp.setSkills(Set.of("Java", "React"));
        resp.setLookingFor(Set.of("Hackathons"));

        when(userService.getUserProfile(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("user@college.edu"));
    }

    @Test
    @DisplayName("PUT /api/users/{id} -> 200 OK on profile update")
    void testUpdateProfile() throws Exception {
        UserProfileResponse resp = new UserProfileResponse();
        resp.setId(1L);
        resp.setName("Updated User");
        resp.setGithubUrl("https://github.com/updated");

        when(userService.updateUserProfile(eq(1L), any(UpdateProfileRequest.class), eq("user@college.edu"))).thenReturn(resp);

        mockMvc.perform(put("/api/users/1")
                        .principal(userAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated User\",\"githubUrl\":\"https://github.com/updated\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated User"))
                .andExpect(jsonPath("$.githubUrl").value("https://github.com/updated"));
    }

    @Test
    @DisplayName("POST /api/users/{id}/skills -> 201 Created on adding skill")
    void testAddSkill() throws Exception {
        UserProfileResponse resp = new UserProfileResponse();
        resp.setId(1L);
        resp.setSkills(Set.of("React", "Spring Boot"));

        when(userService.addSkillToUser(eq(1L), eq("Spring Boot"), eq("user@college.edu"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/1/skills")
                        .principal(userAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"skillName\":\"Spring Boot\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("DELETE /api/users/{id}/skills/{skillName} -> 200 OK on removing skill")
    void testRemoveSkill() throws Exception {
        UserProfileResponse resp = new UserProfileResponse();
        resp.setId(1L);
        resp.setSkills(Set.of("React"));

        when(userService.removeSkillFromUser(eq(1L), eq("Spring Boot"), eq("user@college.edu"))).thenReturn(resp);

        mockMvc.perform(delete("/api/users/1/skills/Spring Boot")
                        .principal(userAuth))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/users/{id}/achievements -> 201 Created on adding achievement")
    void testAddAchievement() throws Exception {
        AchievementDto resp = new AchievementDto(10L, "SIH Winner", "1st prize", "Hackathon", "2024", "https://proof.com");

        when(userService.addAchievement(eq(1L), any(AchievementDto.class), eq("user@college.edu"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/1/achievements")
                        .principal(userAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"SIH Winner\",\"description\":\"1st prize\",\"category\":\"Hackathon\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("SIH Winner"));
    }

    @Test
    @DisplayName("POST /api/users/{id}/projects -> 201 Created on adding project")
    void testAddProject() throws Exception {
        ProjectDto resp = new ProjectDto(20L, "SanGam", "Peer platform", "React, Spring", "https://github.com", "https://demo.com");

        when(userService.addProject(eq(1L), any(ProjectDto.class), eq("user@college.edu"))).thenReturn(resp);

        mockMvc.perform(post("/api/users/1/projects")
                        .principal(userAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"SanGam\",\"description\":\"Peer platform\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.name").value("SanGam"));
    }
}
