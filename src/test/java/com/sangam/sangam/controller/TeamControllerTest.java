package com.sangam.sangam.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.config.GlobalExceptionHandler;
import com.sangam.sangam.dto.TeamInvitationResponse;
import com.sangam.sangam.dto.TeamJoinRequestResponse;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.dto.UpdateTeamRequest;
import com.sangam.sangam.repository.UserRepository;
import com.sangam.sangam.service.TeamService;

@ExtendWith(MockitoExtension.class)
class TeamControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TeamService teamService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TeamController teamController;

    private Authentication leaderAuth;
    private Authentication studentAuth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(teamController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        leaderAuth = new UsernamePasswordAuthenticationToken("leader@college.edu", null);
        studentAuth = new UsernamePasswordAuthenticationToken("student@college.edu", null);
    }

    @Test
    @DisplayName("POST /api/teams/{teamId}/invite/{userId} -> 201 Created on success")
    void testInviteStudentSuccess() throws Exception {
        TeamInvitationResponse response = new TeamInvitationResponse(
                100L, 10L, "Team Alpha", "AI project", 1L, "Leader", 2L, "Student", "PENDING",
                LocalDateTime.now(), LocalDateTime.now(), (byte) 4
        );

        when(teamService.inviteStudent(eq(10L), eq(2L), eq("leader@college.edu"), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/teams/10/invite/2")
                        .principal(leaderAuth))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invitationId").value(100))
                .andExpect(jsonPath("$.teamId").value(10))
                .andExpect(jsonPath("$.teamName").value("Team Alpha"))
                .andExpect(jsonPath("$.invitedUserId").value(2))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /api/teams/{teamId}/invite/{userId} -> 403 Forbidden for non-leader")
    void testInviteStudentForbidden() throws Exception {
        when(teamService.inviteStudent(eq(10L), eq(2L), eq("student@college.edu"), any(), any()))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the team leader can invite members"));

        mockMvc.perform(post("/api/teams/10/invite/2")
                        .principal(studentAuth))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/teams/invitations/{invitationId}/accept -> 200 OK")
    void testAcceptInvitationSuccess() throws Exception {
        doNothing().when(teamService).acceptInvitation(eq(50L), eq("student@college.edu"), any(), any());

        mockMvc.perform(post("/api/teams/invitations/50/accept")
                        .principal(studentAuth))
                .andExpect(status().isOk())
                .andExpect(content().string("Invitation accepted successfully"));
    }

    @Test
    @DisplayName("POST /api/teams/invitations/{invitationId}/reject -> 200 OK")
    void testRejectInvitationSuccess() throws Exception {
        doNothing().when(teamService).rejectInvitation(50L, "student@college.edu");

        mockMvc.perform(post("/api/teams/invitations/50/reject")
                        .principal(studentAuth))
                .andExpect(status().isOk())
                .andExpect(content().string("Invitation rejected successfully"));
    }

    @Test
    @DisplayName("GET /api/teams/invitations/my -> 200 OK with list")
    void testGetMyInvitations() throws Exception {
        TeamInvitationResponse inv = new TeamInvitationResponse(
                50L, 10L, "Team Alpha", "Desc", 1L, "Leader", 2L, "Student", "PENDING",
                LocalDateTime.now(), LocalDateTime.now(), (byte) 4
        );

        when(teamService.getMyInvitations("student@college.edu", null)).thenReturn(List.of(inv));

        mockMvc.perform(get("/api/teams/invitations/my")
                        .principal(studentAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].invitationId").value(50))
                .andExpect(jsonPath("$[0].teamName").value("Team Alpha"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/teams/{teamId}/invitations -> 200 OK for team leader")
    void testGetTeamInvitations() throws Exception {
        TeamInvitationResponse inv = new TeamInvitationResponse(
                50L, 10L, "Team Alpha", "Desc", 1L, "Leader", 2L, "Student", "PENDING",
                LocalDateTime.now(), LocalDateTime.now(), (byte) 4
        );

        when(teamService.getTeamInvitations(10L, "leader@college.edu")).thenReturn(List.of(inv));

        mockMvc.perform(get("/api/teams/10/invitations")
                        .principal(leaderAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].invitationId").value(50))
                .andExpect(jsonPath("$[0].invitedUserName").value("Student"));
    }

    @Test
    @DisplayName("PUT /api/teams/{teamId} -> 200 OK for team leader")
    void testUpdateTeamSuccess() throws Exception {
        TeamResponse resp = new TeamResponse();
        resp.setId(10L);
        resp.setName("Updated Alpha");
        resp.setProjectName("AI System");
        resp.setStatus("OPEN");
        resp.setMemberCount(1);

        when(teamService.updateTeam(eq(10L), any(UpdateTeamRequest.class), eq("leader@college.edu"))).thenReturn(resp);

        mockMvc.perform(put("/api/teams/10")
                        .principal(leaderAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated Alpha\",\"projectName\":\"AI System\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Updated Alpha"))
                .andExpect(jsonPath("$.projectName").value("AI System"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @DisplayName("DELETE /api/teams/{id} -> 200 OK for team leader")
    void testDeleteTeamSuccess() throws Exception {
        doNothing().when(teamService).deleteTeam(10L, "leader@college.edu");

        mockMvc.perform(delete("/api/teams/10")
                        .principal(leaderAuth))
                .andExpect(status().isOk())
                .andExpect(content().string("Team deleted successfully"));
    }

    @Test
    @DisplayName("DELETE /api/teams/{id} -> 403 Forbidden for non-leader")
    void testDeleteTeamForbidden() throws Exception {
        org.mockito.Mockito.doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the team leader can delete the team"))
                .when(teamService).deleteTeam(10L, "student@college.edu");

        mockMvc.perform(delete("/api/teams/10")
                        .principal(studentAuth))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/teams/{id} -> 401 Unauthorized when unauthenticated")
    void testDeleteTeamUnauthorized() throws Exception {
        mockMvc.perform(delete("/api/teams/10"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/teams/invitations/{invitationId}/request-another -> 201 Created")
    void testRequestAnotherRoleSuccess() throws Exception {
        TeamJoinRequestResponse resp = new TeamJoinRequestResponse(
                100L, 10L, "Team Alpha", 2L, "Student", "PENDING", "Researcher", null, LocalDateTime.now()
        );

        when(teamService.requestAnotherRole(eq(50L), eq("student@college.edu"), eq("Researcher"), any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/teams/invitations/50/request-another")
                        .principal(studentAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"requestedRole\":\"Researcher\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.teamId").value(10))
                .andExpect(jsonPath("$.requestedRole").value("Researcher"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
