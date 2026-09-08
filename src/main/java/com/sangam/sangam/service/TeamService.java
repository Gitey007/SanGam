package com.sangam.sangam.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.CreateTeamRequest;
import com.sangam.sangam.dto.TeamInvitationResponse;
import com.sangam.sangam.dto.TeamJoinRequestResponse;
import com.sangam.sangam.dto.TeamMemberResponse;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.dto.TeamRoleSlotDto;
import com.sangam.sangam.dto.UpdateTeamRequest;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.entity.TeamInvitation;
import com.sangam.sangam.entity.TeamJoinRequest;
import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.TeamMemberId;
import com.sangam.sangam.entity.TeamRoleSlot;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.SkillRepository;
import com.sangam.sangam.repository.TeamInvitationRepository;
import com.sangam.sangam.repository.TeamJoinRequestRepository;
import com.sangam.sangam.repository.TeamMemberRepository;
import com.sangam.sangam.repository.TeamRepository;
import com.sangam.sangam.repository.UserRepository;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final SkillRepository skillRepository;

    public TeamService(
            TeamRepository teamRepository,
            UserRepository userRepository,
            TeamMemberRepository teamMemberRepository,
            TeamJoinRequestRepository teamJoinRequestRepository,
            TeamInvitationRepository teamInvitationRepository,
            SkillRepository skillRepository) {

        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamJoinRequestRepository = teamJoinRequestRepository;
        this.teamInvitationRepository = teamInvitationRepository;
        this.skillRepository = skillRepository;
    }

    public static boolean isOtherRole(String roleName) {
        if (roleName == null) return false;
        String trimmed = roleName.trim();
        return trimmed.equalsIgnoreCase("OTHER")
                || trimmed.equalsIgnoreCase("Other / Custom")
                || trimmed.equalsIgnoreCase("Other/Custom")
                || trimmed.equalsIgnoreCase("Other");
    }

    public static boolean roleMatches(String slotRole, String assignedRole) {
        if (slotRole == null || assignedRole == null) return false;
        if (isOtherRole(slotRole)) {
            return isOtherRole(assignedRole);
        }
        return slotRole.trim().equalsIgnoreCase(assignedRole.trim());
    }

    private String validateAndCleanUrl(String url, String fieldName) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String trimmed = url.trim();
        String lower = trimmed.toLowerCase();
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must start with http:// or https://");
        }
        return trimmed;
    }

    @Transactional
    public Team createTeam(CreateTeamRequest request, String authenticatedEmail) {
        User leader;
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            leader = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leader not found"));
        } else if (request.getLeaderId() != null) {
            leader = userRepository.findById(request.getLeaderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leader not found"));
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Leader ID or authentication required");
        }

        Team team = new Team();
        team.setName(request.getName() != null ? request.getName().trim() : "");
        team.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        team.setLeader(leader);
        team.setProjectName(request.getProjectName());
        team.setProjectDescription(request.getProjectDescription());
        team.setTeamVision(request.getTeamVision());
        team.setProjectType(request.getProjectType());
        team.setHackathonName(request.getHackathonName());
        team.setHackathonUrl(validateAndCleanUrl(request.getHackathonUrl(), "Hackathon URL"));
        team.setHackathonDeadline(request.getHackathonDeadline());

        team.setGithubRepositoryUrl(validateAndCleanUrl(request.getGithubRepositoryUrl(), "GitHub repository URL"));
        team.setDocumentationUrl(validateAndCleanUrl(request.getDocumentationUrl(), "Documentation URL"));

        byte maxMembers = request.getMaxMembers() != null ? request.getMaxMembers() : 4;
        team.setMaxMembers(maxMembers);

        if (request.getRoleSlots() != null && !request.getRoleSlots().isEmpty()) {
            int sumSlots = 0;
            List<TeamRoleSlot> slots = new ArrayList<>();
            for (TeamRoleSlotDto dto : request.getRoleSlots()) {
                if (dto.getRoleName() != null && !dto.getRoleName().isBlank()) {
                    int count = (dto.getSlotCount() != null && dto.getSlotCount() > 0) ? dto.getSlotCount() : 1;
                    sumSlots += count;
                    slots.add(new TeamRoleSlot(dto.getRoleName().trim(), count));
                }
            }
            if (sumSlots != maxMembers) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "The sum of all role slots (" + sumSlots + ") must equal the maximum team size (" + maxMembers + ").");
            }
            team.setRoleSlots(slots);
        } else if (request.getRequiredRoles() != null && !request.getRequiredRoles().isEmpty()) {
            team.setRequiredRoles(new HashSet<>(request.getRequiredRoles()));
        }

        if (request.getRequiredSkills() != null && skillRepository != null) {
            Set<Skill> skills = new HashSet<>();
            for (String skillName : request.getRequiredSkills()) {
                if (skillName != null && !skillName.isBlank()) {
                    String trimmed = skillName.trim();
                    Skill s = skillRepository.findByNameIgnoreCase(trimmed)
                            .orElseGet(() -> {
                                Skill newSkill = new Skill();
                                newSkill.setName(trimmed);
                                return skillRepository.save(newSkill);
                            });
                    skills.add(s);
                }
            }
            team.setRequiredSkills(skills);
        }

        team.setCreatedAt(LocalDateTime.now());
        team.setUpdatedAt(LocalDateTime.now());

        Team savedTeam = teamRepository.save(team);

        TeamMember member = new TeamMember();
        member.setTeamId(savedTeam.getId());
        member.setUserId(leader.getId());
        member.setRole(TeamMember.Role.LEADER);
        if (request.getLeaderRole() != null && !request.getLeaderRole().isBlank()) {
            member.setAssignedRole(request.getLeaderRole().trim());
            if (request.getLeaderCustomRole() != null && !request.getLeaderCustomRole().isBlank()) {
                member.setCustomRole(request.getLeaderCustomRole().trim());
            }
        }
        member.setJoinedAt(LocalDateTime.now());

        teamMemberRepository.save(member);

        return savedTeam;
    }

    @Transactional
    public Team createTeam(CreateTeamRequest request) {
        return createTeam(request, null);
    }

    @Transactional
    public TeamResponse updateTeam(Long teamId, UpdateTeamRequest request, String authenticatedEmail) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            if (!team.getLeader().getEmail().equalsIgnoreCase(authenticatedEmail.trim())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the team leader can update team details");
            }
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            team.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription().trim());
        }
        if (request.getMaxMembers() != null) {
            long currentCount = teamMemberRepository.countByTeamId(teamId);
            if (request.getMaxMembers() < currentCount) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Max members cannot be less than current member count (" + currentCount + ")");
            }
            team.setMaxMembers(request.getMaxMembers());
        }
        team.setProjectName(request.getProjectName());
        team.setProjectDescription(request.getProjectDescription());
        team.setTeamVision(request.getTeamVision());
        team.setProjectType(request.getProjectType());
        team.setHackathonName(request.getHackathonName());
        team.setHackathonUrl(validateAndCleanUrl(request.getHackathonUrl(), "Hackathon URL"));
        team.setHackathonDeadline(request.getHackathonDeadline());

        team.setGithubRepositoryUrl(validateAndCleanUrl(request.getGithubRepositoryUrl(), "GitHub repository URL"));
        team.setDocumentationUrl(validateAndCleanUrl(request.getDocumentationUrl(), "Documentation URL"));

        if (request.getRoleSlots() != null && !request.getRoleSlots().isEmpty()) {
            int sumSlots = 0;
            List<TeamRoleSlot> slots = new ArrayList<>();
            for (TeamRoleSlotDto dto : request.getRoleSlots()) {
                if (dto.getRoleName() != null && !dto.getRoleName().isBlank()) {
                    int count = (dto.getSlotCount() != null && dto.getSlotCount() > 0) ? dto.getSlotCount() : 1;
                    sumSlots += count;
                    slots.add(new TeamRoleSlot(dto.getRoleName().trim(), count));
                }
            }
            byte maxMembers = team.getMaxMembers() != null ? team.getMaxMembers() : 4;
            if (sumSlots != maxMembers) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "The sum of all role slots (" + sumSlots + ") must equal the maximum team size (" + maxMembers + ").");
            }
            team.setRoleSlots(slots);
        } else if (request.getRequiredRoles() != null) {
            team.setRequiredRoles(new HashSet<>(request.getRequiredRoles()));
        }

        if (request.getRequiredSkills() != null && skillRepository != null) {
            Set<Skill> skills = new HashSet<>();
            for (String skillName : request.getRequiredSkills()) {
                if (skillName != null && !skillName.isBlank()) {
                    String trimmed = skillName.trim();
                    Skill s = skillRepository.findByNameIgnoreCase(trimmed)
                            .orElseGet(() -> {
                                Skill newSkill = new Skill();
                                newSkill.setName(trimmed);
                                return skillRepository.save(newSkill);
                            });
                    skills.add(s);
                }
            }
            team.setRequiredSkills(skills);
        }

        team.setUpdatedAt(LocalDateTime.now());
        Team saved = teamRepository.save(team);
        return toTeamResponse(saved);
    }

    public TeamResponse toTeamResponse(Team team) {
        List<TeamMember> members = Collections.emptyList();
        try {
            members = teamMemberRepository.findByTeamId(team.getId());
        } catch (Exception e) {
            // fallback
        }
        int memberCount = members.size();

        int max = team.getMaxMembers() != null ? team.getMaxMembers() : 4;
        String status = "OPEN";
        if (memberCount >= max) {
            status = "FULL";
        } else if (memberCount >= max - 1) {
            status = "ALMOST_FULL";
        }

        Set<String> skillNames = team.getRequiredSkills() != null
                ? team.getRequiredSkills().stream()
                        .map(Skill::getName)
                        .filter(name -> name != null && !name.isBlank())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        Set<String> roles = team.getRequiredRoles() != null
                ? new HashSet<>(team.getRequiredRoles())
                : Collections.emptySet();

        List<TeamRoleSlotDto> roleSlotDtos = new ArrayList<>();
        if (team.getRoleSlots() != null && !team.getRoleSlots().isEmpty()) {
            for (TeamRoleSlot slot : team.getRoleSlots()) {
                if (slot == null || slot.getRoleName() == null) continue;
                int filled = 0;
                for (TeamMember m : members) {
                    if (roleMatches(slot.getRoleName(), m.getAssignedRole())) {
                        filled++;
                    }
                }
                int available = Math.max(0, slot.getSlotCount() - filled);
                roleSlotDtos.add(new TeamRoleSlotDto(slot.getRoleName(), slot.getSlotCount(), filled, available));
            }
        } else if (team.getRequiredRoles() != null && !team.getRequiredRoles().isEmpty()) {
            for (String r : team.getRequiredRoles()) {
                int filled = 0;
                for (TeamMember m : members) {
                    if (roleMatches(r, m.getAssignedRole())) {
                        filled++;
                    }
                }
                int available = Math.max(0, 1 - filled);
                roleSlotDtos.add(new TeamRoleSlotDto(r, 1, filled, available));
            }
        }

        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getDescription(),
                team.getLeader() != null ? team.getLeader().getId() : null,
                team.getLeader() != null ? team.getLeader().getName() : null,
                team.getMaxMembers(),
                team.getProjectName(),
                team.getProjectDescription(),
                team.getTeamVision(),
                team.getProjectType(),
                team.getHackathonName(),
                team.getHackathonUrl(),
                team.getHackathonDeadline(),
                team.getGithubRepositoryUrl(),
                team.getDocumentationUrl(),
                skillNames,
                roles,
                roleSlotDtos,
                memberCount,
                status);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll()
                .stream()
                .map(this::toTeamResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        return toTeamResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found");
        }

        return teamMemberRepository.findByTeamId(teamId)
                .stream()
                .map(member -> {
                    User user = userRepository.findById(member.getUserId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

                    return new TeamMemberResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getCollege(),
                            user.getBranch(),
                            user.getYear(),
                            member.getRole() != null ? member.getRole().name() : "MEMBER",
                            member.getAssignedRole(),
                            member.getCustomRole());
                })
                .toList();
    }

    @Transactional
    public void removeMember(
            Long teamId,
            Long memberId,
            Long leaderId) {

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (!team.getLeader().getId().equals(leaderId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the team leader can remove members");
        }

        if (memberId.equals(leaderId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Leader cannot remove themselves");
        }

        TeamMemberId memberKey = new TeamMemberId(teamId, memberId);

        if (!teamMemberRepository.existsById(memberKey)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User is not a member of this team");
        }

        teamMemberRepository.deleteById(memberKey);
    }

    @Transactional
    public void leaveTeam(Long teamId, Long userId) {

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (team.getLeader().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Team leader cannot leave the team");
        }

        TeamMemberId memberKey = new TeamMemberId(teamId, userId);

        if (!teamMemberRepository.existsById(memberKey)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User is not a member of this team");
        }

        teamMemberRepository.deleteById(memberKey);
    }

    public TeamJoinRequestResponse toJoinRequestResponse(TeamJoinRequest request) {
        return new TeamJoinRequestResponse(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getName(),
                request.getStatus().name(),
                request.getRequestedRole(),
                request.getCustomRole(),
                request.getCreatedAt());
    }

    @Transactional
    public TeamJoinRequestResponse sendJoinRequest(Long teamId, Long userId, String requestedRole, String customRole) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        TeamMemberId memberKey = new TeamMemberId(teamId, userId);
        if (teamMemberRepository.existsById(memberKey)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User is already a member of this team");
        }

        long currentMemberCount = teamMemberRepository.countByTeamId(teamId);
        if (team.getMaxMembers() != null && currentMemberCount >= team.getMaxMembers()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Team is full");
        }

        Optional<TeamJoinRequest> existingRequest = teamJoinRequestRepository.findByTeamIdAndUserId(teamId, userId);

        if (existingRequest.isPresent()) {
            TeamJoinRequest req = existingRequest.get();
            if (req.getStatus() == TeamJoinRequest.RequestStatus.PENDING) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "User already has a pending join request for this team");
            }
            req.setStatus(TeamJoinRequest.RequestStatus.PENDING);
            req.setRequestedRole(requestedRole != null ? requestedRole.trim() : null);
            req.setCustomRole(customRole != null ? customRole.trim() : null);
            req.setCreatedAt(LocalDateTime.now());
            req.setUpdatedAt(LocalDateTime.now());
            TeamJoinRequest saved = teamJoinRequestRepository.save(req);
            return toJoinRequestResponse(saved);
        }

        TeamJoinRequest request = new TeamJoinRequest(
                team, user, TeamJoinRequest.RequestStatus.PENDING,
                requestedRole != null ? requestedRole.trim() : null,
                customRole != null ? customRole.trim() : null);
        TeamJoinRequest saved = teamJoinRequestRepository.save(request);

        return toJoinRequestResponse(saved);
    }

    @Transactional
    public TeamJoinRequestResponse sendJoinRequest(Long teamId, Long userId) {
        return sendJoinRequest(teamId, userId, null, null);
    }

    @Transactional(readOnly = true)
    public List<TeamJoinRequestResponse> getPendingJoinRequests(Long teamId, Long leaderId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team not found"));

        if (leaderId != null && !team.getLeader().getId().equals(leaderId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the team leader can view join requests");
        }

        return teamJoinRequestRepository.findByTeamIdAndStatus(teamId, TeamJoinRequest.RequestStatus.PENDING)
                .stream()
                .map(this::toJoinRequestResponse)
                .toList();
    }

    @Transactional
    public void acceptJoinRequest(Long teamId, Long requestId, Long leaderId, String selectedRole, String customRole) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team not found"));

        TeamJoinRequest request = teamJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Join request not found"));

        if (!request.getTeam().getId().equals(teamId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Join request does not belong to this team");
        }

        if (leaderId != null && !team.getLeader().getId().equals(leaderId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the team leader can accept join requests");
        }

        if (request.getStatus() != TeamJoinRequest.RequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Join request is not pending");
        }

        Long applicantUserId = request.getUser().getId();
        TeamMemberId memberKey = new TeamMemberId(teamId, applicantUserId);

        if (teamMemberRepository.existsById(memberKey)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User is already a member of this team");
        }

        List<TeamMember> currentMembers = teamMemberRepository.findByTeamId(teamId);
        if (team.getMaxMembers() != null && currentMembers.size() >= team.getMaxMembers()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Team is full");
        }

        String effectiveRole = (selectedRole != null && !selectedRole.isBlank()) ? selectedRole.trim() : request.getRequestedRole();
        String effectiveCustomRole = (customRole != null && !customRole.isBlank()) ? customRole.trim() : request.getCustomRole();

        if (effectiveRole != null && !effectiveRole.isBlank() && team.getRoleSlots() != null && !team.getRoleSlots().isEmpty()) {
            TeamRoleSlot matchingSlot = team.getRoleSlots().stream()
                    .filter(slot -> roleMatches(slot.getRoleName(), effectiveRole))
                    .findFirst()
                    .orElse(null);

            if (matchingSlot != null) {
                long filled = currentMembers.stream()
                        .filter(m -> roleMatches(matchingSlot.getRoleName(), m.getAssignedRole()))
                        .count();

                if (filled >= matchingSlot.getSlotCount()) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "This role is no longer available.");
                }
            }
        }

        TeamMember member = new TeamMember();
        member.setTeamId(team.getId());
        member.setUserId(applicantUserId);
        member.setRole(TeamMember.Role.MEMBER);
        member.setAssignedRole(effectiveRole);
        member.setCustomRole(effectiveCustomRole);
        member.setJoinedAt(LocalDateTime.now());
        teamMemberRepository.save(member);

        request.setStatus(TeamJoinRequest.RequestStatus.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());
        teamJoinRequestRepository.save(request);
    }

    @Transactional
    public void acceptJoinRequest(Long teamId, Long requestId, Long leaderId) {
        acceptJoinRequest(teamId, requestId, leaderId, null, null);
    }

    @Transactional
    public void rejectJoinRequest(Long teamId, Long requestId, Long leaderId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team not found"));

        TeamJoinRequest request = teamJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Join request not found"));

        if (!request.getTeam().getId().equals(teamId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Join request does not belong to this team");
        }

        if (leaderId != null && !team.getLeader().getId().equals(leaderId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the team leader can reject join requests");
        }

        if (request.getStatus() != TeamJoinRequest.RequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Join request is not pending");
        }

        request.setStatus(TeamJoinRequest.RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());
        teamJoinRequestRepository.save(request);
    }

    public TeamInvitationResponse toInvitationResponse(TeamInvitation invitation) {
        return new TeamInvitationResponse(
                invitation.getId(),
                invitation.getTeam().getId(),
                invitation.getTeam().getName(),
                invitation.getTeam().getDescription(),
                invitation.getInvitedBy().getId(),
                invitation.getInvitedBy().getName(),
                invitation.getInvitedUser().getId(),
                invitation.getInvitedUser().getName(),
                invitation.getStatus().name(),
                invitation.getInvitedRole(),
                invitation.getCustomRole(),
                invitation.getCreatedAt(),
                invitation.getUpdatedAt(),
                invitation.getTeam().getMaxMembers());
    }

    @Transactional
    public TeamInvitationResponse inviteStudent(Long teamId, Long targetUserId, String authenticatedEmail, String invitedRole, String customRole) {
        User inviter = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not authenticated"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team not found"));

        if (!team.getLeader().getId().equals(inviter.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the team leader can invite members");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student not found"));

        if (targetUser.getId().equals(team.getLeader().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot invite the team leader to their own team");
        }

        TeamMemberId memberKey = new TeamMemberId(teamId, targetUserId);
        if (teamMemberRepository.existsById(memberKey)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Student is already a member of this team");
        }

        long currentMemberCount = teamMemberRepository.countByTeamId(teamId);
        if (team.getMaxMembers() != null && currentMemberCount >= team.getMaxMembers()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Team is full");
        }

        Optional<TeamInvitation> existingOpt = teamInvitationRepository.findByTeamIdAndInvitedUserId(teamId, targetUserId);
        if (existingOpt.isPresent()) {
            TeamInvitation existing = existingOpt.get();
            if (existing.getStatus() == TeamInvitation.InvitationStatus.PENDING) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "A pending invitation already exists for this student");
            }
            existing.setStatus(TeamInvitation.InvitationStatus.PENDING);
            existing.setInvitedBy(inviter);
            existing.setInvitedRole(invitedRole != null ? invitedRole.trim() : null);
            existing.setCustomRole(customRole != null ? customRole.trim() : null);
            existing.setCreatedAt(LocalDateTime.now());
            existing.setUpdatedAt(LocalDateTime.now());
            TeamInvitation saved = teamInvitationRepository.save(existing);
            return toInvitationResponse(saved);
        }

        TeamInvitation invitation = new TeamInvitation(
                team, targetUser, inviter, TeamInvitation.InvitationStatus.PENDING,
                invitedRole != null ? invitedRole.trim() : null,
                customRole != null ? customRole.trim() : null);
        TeamInvitation saved = teamInvitationRepository.save(invitation);
        return toInvitationResponse(saved);
    }

    @Transactional
    public TeamInvitationResponse inviteStudent(Long teamId, Long targetUserId, String authenticatedEmail) {
        return inviteStudent(teamId, targetUserId, authenticatedEmail, null, null);
    }

    @Transactional
    public void acceptInvitation(Long invitationId, String authenticatedEmail, String selectedRole, String customRole) {
        User currentUser = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not authenticated"));

        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found"));

        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to accept this invitation");
        }

        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation is not pending");
        }

        Team team = invitation.getTeam();
        if (team == null || !teamRepository.existsById(team.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Team no longer exists");
        }

        TeamMemberId memberKey = new TeamMemberId(team.getId(), currentUser.getId());
        if (teamMemberRepository.existsById(memberKey)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User is already a member of this team");
        }

        List<TeamMember> currentMembers = teamMemberRepository.findByTeamId(team.getId());
        if (team.getMaxMembers() != null && currentMembers.size() >= team.getMaxMembers()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Team is full");
        }

        String effectiveRole = (selectedRole != null && !selectedRole.isBlank()) ? selectedRole.trim() : invitation.getInvitedRole();
        String effectiveCustomRole = (customRole != null && !customRole.isBlank()) ? customRole.trim() : invitation.getCustomRole();

        if (effectiveRole != null && !effectiveRole.isBlank() && team.getRoleSlots() != null && !team.getRoleSlots().isEmpty()) {
            TeamRoleSlot matchingSlot = team.getRoleSlots().stream()
                    .filter(slot -> roleMatches(slot.getRoleName(), effectiveRole))
                    .findFirst()
                    .orElse(null);

            if (matchingSlot != null) {
                long filled = currentMembers.stream()
                        .filter(m -> roleMatches(matchingSlot.getRoleName(), m.getAssignedRole()))
                        .count();

                if (filled >= matchingSlot.getSlotCount()) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "This role is no longer available.");
                }
            }
        }

        TeamMember member = new TeamMember();
        member.setTeamId(team.getId());
        member.setUserId(currentUser.getId());
        member.setRole(TeamMember.Role.MEMBER);
        member.setAssignedRole(effectiveRole);
        member.setCustomRole(effectiveCustomRole);
        member.setJoinedAt(LocalDateTime.now());
        teamMemberRepository.save(member);

        invitation.setStatus(TeamInvitation.InvitationStatus.ACCEPTED);
        invitation.setUpdatedAt(LocalDateTime.now());
        teamInvitationRepository.save(invitation);
    }

    @Transactional
    public void acceptInvitation(Long invitationId, String authenticatedEmail) {
        acceptInvitation(invitationId, authenticatedEmail, null, null);
    }

    @Transactional
    public void rejectInvitation(Long invitationId, String authenticatedEmail) {
        User currentUser = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not authenticated"));

        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation not found"));

        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to reject this invitation");
        }

        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation is not pending");
        }

        invitation.setStatus(TeamInvitation.InvitationStatus.REJECTED);
        invitation.setUpdatedAt(LocalDateTime.now());
        teamInvitationRepository.save(invitation);
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationResponse> getMyInvitations(String authenticatedEmail, TeamInvitation.InvitationStatus status) {
        User currentUser = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not authenticated"));

        List<TeamInvitation> invitations;
        if (status != null) {
            invitations = teamInvitationRepository.findByInvitedUserIdAndStatus(currentUser.getId(), status);
        } else {
            invitations = teamInvitationRepository.findByInvitedUserId(currentUser.getId());
        }

        return invitations.stream()
                .map(this::toInvitationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationResponse> getTeamInvitations(Long teamId, String authenticatedEmail) {
        User currentUser = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not authenticated"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Team not found"));

        if (!team.getLeader().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the team leader can view team invitations");
        }

        return teamInvitationRepository.findByTeamId(teamId)
                .stream()
                .map(this::toInvitationResponse)
                .toList();
    }
}