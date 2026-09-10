package com.sangam.sangam.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.CreateTeamRequest;
import com.sangam.sangam.dto.RoleActionRequest;
import com.sangam.sangam.dto.TeamInvitationResponse;
import com.sangam.sangam.dto.TeamJoinRequestResponse;
import com.sangam.sangam.dto.TeamMemberResponse;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.dto.UpdateTeamRequest;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.entity.TeamInvitation;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;
import com.sangam.sangam.service.TeamService;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;
    private final UserRepository userRepository;

    public TeamController(TeamService teamService, UserRepository userRepository) {
        this.teamService = teamService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @RequestBody CreateTeamRequest request,
            Authentication authentication) {

        Team team = teamService.createTeam(request, authentication != null ? authentication.getName() : null);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(teamService.toTeamResponse(team));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable Long id,
            @RequestBody UpdateTeamRequest request,
            Authentication authentication) {

        TeamResponse response = teamService.updateTeam(id, request, authentication != null ? authentication.getName() : null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/deadline")
    public ResponseEntity<TeamResponse> extendDeadline(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String deadlineStr = body != null ? (String) body.get("joinDeadline") : null;
        if (deadlineStr == null || deadlineStr.isBlank()) {
            deadlineStr = body != null ? (String) body.get("deadline") : null;
        }

        if (deadlineStr == null || deadlineStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline date is required");
        }

        LocalDateTime deadline;
        try {
            if (deadlineStr.contains("T")) {
                deadline = LocalDateTime.parse(deadlineStr);
            } else {
                deadline = LocalDate.parse(deadlineStr).atTime(23, 59, 59);
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date format. Expected YYYY-MM-DD or ISO-8601 DateTime");
        }

        TeamResponse response = teamService.extendDeadline(id, deadline, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTeam(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        teamService.deleteTeam(id, authentication.getName());
        return ResponseEntity.ok("Team deleted successfully");
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
            @RequestParam(required = false) Long leaderId,
            Authentication authentication) {

        Long effectiveLeaderId = null;
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName().trim().toLowerCase()).orElse(null);
            if (user != null) {
                effectiveLeaderId = user.getId();
            }
        }
        if (effectiveLeaderId == null) {
            effectiveLeaderId = leaderId;
        }

        if (effectiveLeaderId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        teamService.removeMember(
                teamId,
                memberId,
                effectiveLeaderId);

        return ResponseEntity.ok(
                "Member removed successfully");
    }

    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<String> leaveTeam(
            @PathVariable Long teamId,
            @RequestParam(required = false) Long userId,
            Authentication authentication) {

        Long effectiveUserId = null;
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName().trim().toLowerCase()).orElse(null);
            if (user != null) {
                effectiveUserId = user.getId();
            }
        }
        if (effectiveUserId == null) {
            effectiveUserId = userId;
        }

        if (effectiveUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        teamService.leaveTeam(teamId, effectiveUserId);

        return ResponseEntity.ok(
                "Left team successfully");
    }

    @PostMapping("/{teamId}/join-request")
    public ResponseEntity<String> sendJoinRequest(
            @PathVariable Long teamId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String requestedRole,
            @RequestParam(required = false) String customRole,
            @RequestBody(required = false) RoleActionRequest body,
            Authentication authentication) {

        Long effectiveUserId = null;
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName().trim().toLowerCase()).orElse(null);
            if (user != null) {
                effectiveUserId = user.getId();
            }
        }
        if (effectiveUserId == null) {
            effectiveUserId = userId;
            if (effectiveUserId == null && body != null && body.getUserId() != null) {
                effectiveUserId = body.getUserId();
            }
        }

        if (effectiveUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String effectiveRole = (requestedRole != null && !requestedRole.isBlank())
                ? requestedRole
                : (body != null ? body.getRequestedRole() : null);

        String effectiveCustomRole = (customRole != null && !customRole.isBlank())
                ? customRole
                : (body != null ? body.getCustomRole() : null);

        teamService.sendJoinRequest(teamId, effectiveUserId, effectiveRole, effectiveCustomRole);

        return ResponseEntity.ok(
                "Join request sent successfully");
    }

    @GetMapping("/{teamId}/join-requests")
    public ResponseEntity<List<TeamJoinRequestResponse>> getPendingJoinRequests(
            @PathVariable Long teamId,
            @RequestParam(required = false) Long leaderId,
            Authentication authentication) {

        Long effectiveLeaderId = null;
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName().trim().toLowerCase()).orElse(null);
            if (user != null) {
                effectiveLeaderId = user.getId();
            }
        }
        if (effectiveLeaderId == null) {
            effectiveLeaderId = leaderId;
        }

        if (effectiveLeaderId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        return ResponseEntity.ok(
                teamService.getPendingJoinRequests(teamId, effectiveLeaderId));
    }

    @PostMapping("/{teamId}/join-requests/{requestId}/accept")
    public ResponseEntity<String> acceptJoinRequest(
            @PathVariable Long teamId,
            @PathVariable Long requestId,
            @RequestParam(required = false) Long leaderId,
            @RequestParam(required = false) String selectedRole,
            @RequestParam(required = false) String customRole,
            @RequestParam(required = false) Long memberIdToRemove,
            @RequestBody(required = false) RoleActionRequest body,
            Authentication authentication) {

        Long effectiveLeaderId = null;
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName().trim().toLowerCase()).orElse(null);
            if (user != null) {
                effectiveLeaderId = user.getId();
            }
        }
        if (effectiveLeaderId == null) {
            effectiveLeaderId = leaderId;
            if (effectiveLeaderId == null && body != null && body.getLeaderId() != null) {
                effectiveLeaderId = body.getLeaderId();
            }
        }

        if (effectiveLeaderId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String effectiveRole = (selectedRole != null && !selectedRole.isBlank())
                ? selectedRole
                : (body != null ? body.getSelectedRole() : null);

        String effectiveCustomRole = (customRole != null && !customRole.isBlank())
                ? customRole
                : (body != null ? body.getCustomRole() : null);

        Long effectiveMemberIdToRemove = memberIdToRemove;
        if (effectiveMemberIdToRemove == null && body != null && body.getMemberIdToRemove() != null) {
            effectiveMemberIdToRemove = body.getMemberIdToRemove();
        }

        teamService.acceptJoinRequest(teamId, requestId, effectiveLeaderId, effectiveRole, effectiveCustomRole, effectiveMemberIdToRemove);

        return ResponseEntity.ok(
                "Join request accepted successfully");
    }

    @PostMapping("/{teamId}/join-requests/{requestId}/reject")
    public ResponseEntity<String> rejectJoinRequest(
            @PathVariable Long teamId,
            @PathVariable Long requestId,
            @RequestParam(required = false) Long leaderId,
            Authentication authentication) {

        Long effectiveLeaderId = null;
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName().trim().toLowerCase()).orElse(null);
            if (user != null) {
                effectiveLeaderId = user.getId();
            }
        }
        if (effectiveLeaderId == null) {
            effectiveLeaderId = leaderId;
        }

        if (effectiveLeaderId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        teamService.rejectJoinRequest(teamId, requestId, effectiveLeaderId);

        return ResponseEntity.ok(
                "Join request rejected successfully");
    }

    @PostMapping("/{teamId}/invite/{userId}")
    public ResponseEntity<TeamInvitationResponse> inviteStudent(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            @RequestParam(required = false) String invitedRole,
            @RequestParam(required = false) String customRole,
            @RequestBody(required = false) RoleActionRequest body,
            Authentication authentication) {

        String effectiveRole = (invitedRole != null && !invitedRole.isBlank())
                ? invitedRole
                : (body != null ? body.getInvitedRole() : null);

        String effectiveCustomRole = (customRole != null && !customRole.isBlank())
                ? customRole
                : (body != null ? body.getCustomRole() : null);

        TeamInvitationResponse response = teamService.inviteStudent(
                teamId,
                userId,
                authentication != null ? authentication.getName() : null,
                effectiveRole,
                effectiveCustomRole);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<String> acceptInvitation(
            @PathVariable Long invitationId,
            @RequestParam(required = false) String selectedRole,
            @RequestParam(required = false) String customRole,
            @RequestBody(required = false) RoleActionRequest body,
            Authentication authentication) {

        String effectiveRole = (selectedRole != null && !selectedRole.isBlank())
                ? selectedRole
                : (body != null ? body.getSelectedRole() : null);

        String effectiveCustomRole = (customRole != null && !customRole.isBlank())
                ? customRole
                : (body != null ? body.getCustomRole() : null);

        teamService.acceptInvitation(
                invitationId,
                authentication != null ? authentication.getName() : null,
                effectiveRole,
                effectiveCustomRole);

        return ResponseEntity.ok(
                "Invitation accepted successfully");
    }

    @PostMapping("/invitations/{invitationId}/reject")
    public ResponseEntity<String> rejectInvitation(
            @PathVariable Long invitationId,
            Authentication authentication) {

        teamService.rejectInvitation(invitationId, authentication != null ? authentication.getName() : null);

        return ResponseEntity.ok(
                "Invitation rejected successfully");
    }

    @GetMapping("/invitations/my")
    public ResponseEntity<List<TeamInvitationResponse>> getMyInvitations(
            @RequestParam(required = false) TeamInvitation.InvitationStatus status,
            Authentication authentication) {

        return ResponseEntity.ok(
                teamService.getMyInvitations(authentication != null ? authentication.getName() : null, status));
    }

    @GetMapping("/{teamId}/invitations")
    public ResponseEntity<List<TeamInvitationResponse>> getTeamInvitations(
            @PathVariable Long teamId,
            Authentication authentication) {

        return ResponseEntity.ok(
                teamService.getTeamInvitations(teamId, authentication != null ? authentication.getName() : null));
    }
}