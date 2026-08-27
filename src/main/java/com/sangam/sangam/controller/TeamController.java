package com.sangam.sangam.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sangam.sangam.dto.CreateTeamRequest;
import com.sangam.sangam.dto.TeamJoinRequestResponse;
import com.sangam.sangam.dto.TeamMemberResponse;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.service.TeamService;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @RequestBody CreateTeamRequest request) {

        Team team = teamService.createTeam(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(teamService.toTeamResponse(team));
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(
                teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeamById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                teamService.getTeamById(id));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(
            @PathVariable Long teamId) {
        return ResponseEntity.ok(
                teamService.getTeamMembers(teamId));
    }

    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @RequestParam Long leaderId) {

        teamService.removeMember(
                teamId,
                memberId,
                leaderId);

        return ResponseEntity.ok(
                "Member removed successfully");
    }

    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<String> leaveTeam(
            @PathVariable Long teamId,
            @RequestParam Long userId) {

        teamService.leaveTeam(teamId, userId);

        return ResponseEntity.ok(
                "Left team successfully");
    }

  

    @PostMapping("/{teamId}/join-request")
    public ResponseEntity<String> sendJoinRequest(
            @PathVariable Long teamId,
            @RequestParam Long userId) {

        teamService.sendJoinRequest(teamId, userId);

        return ResponseEntity.ok(
                "Join request sent successfully");
    }

    @GetMapping("/{teamId}/join-requests")
    public ResponseEntity<List<TeamJoinRequestResponse>> getPendingJoinRequests(
            @PathVariable Long teamId,
            @RequestParam(required = false) Long leaderId) {

        return ResponseEntity.ok(
                teamService.getPendingJoinRequests(teamId, leaderId));
    }

    @PostMapping("/{teamId}/join-requests/{requestId}/accept")
    public ResponseEntity<String> acceptJoinRequest(
            @PathVariable Long teamId,
            @PathVariable Long requestId,
            @RequestParam(required = false) Long leaderId) {

        teamService.acceptJoinRequest(teamId, requestId, leaderId);

        return ResponseEntity.ok(
                "Join request accepted successfully");
    }

    @PostMapping("/{teamId}/join-requests/{requestId}/reject")
    public ResponseEntity<String> rejectJoinRequest(
            @PathVariable Long teamId,
            @PathVariable Long requestId,
            @RequestParam(required = false) Long leaderId) {

        teamService.rejectJoinRequest(teamId, requestId, leaderId);

        return ResponseEntity.ok(
                "Join request rejected successfully");
    }
}