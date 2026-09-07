package com.sangam.sangam.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.CreateTeamRequest;
import com.sangam.sangam.dto.TeamInvitationResponse;
import com.sangam.sangam.dto.TeamJoinRequestResponse;
import com.sangam.sangam.dto.TeamMemberResponse;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.entity.TeamInvitation;
import com.sangam.sangam.entity.TeamJoinRequest;
import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.TeamMemberId;
import com.sangam.sangam.entity.User;
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
        private final com.sangam.sangam.repository.SkillRepository skillRepository;

        public TeamService(
                        TeamRepository teamRepository,
                        UserRepository userRepository,
                        TeamMemberRepository teamMemberRepository,
                        TeamJoinRequestRepository teamJoinRequestRepository,
                        TeamInvitationRepository teamInvitationRepository,
                        com.sangam.sangam.repository.SkillRepository skillRepository) {

                this.teamRepository = teamRepository;
                this.userRepository = userRepository;
                this.teamMemberRepository = teamMemberRepository;
                this.teamJoinRequestRepository = teamJoinRequestRepository;
                this.teamInvitationRepository = teamInvitationRepository;
                this.skillRepository = skillRepository;
        }

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

                team.setName(request.getName());
                team.setDescription(request.getDescription());
                team.setLeader(leader);
                team.setProjectName(request.getProjectName());
                team.setProjectDescription(request.getProjectDescription());
                team.setTeamVision(request.getTeamVision());
                team.setProjectType(request.getProjectType());
                team.setHackathonName(request.getHackathonName());
                team.setHackathonUrl(request.getHackathonUrl());
                team.setHackathonDeadline(request.getHackathonDeadline());

                if (request.getMaxMembers() != null) {
                        team.setMaxMembers(request.getMaxMembers());
                }

                if (request.getRequiredRoles() != null) {
                        team.setRequiredRoles(new java.util.HashSet<>(request.getRequiredRoles()));
                }

                if (request.getRequiredSkills() != null && skillRepository != null) {
                        java.util.Set<com.sangam.sangam.entity.Skill> skills = new java.util.HashSet<>();
                        for (String skillName : request.getRequiredSkills()) {
                                if (skillName != null && !skillName.isBlank()) {
                                        String trimmed = skillName.trim();
                                        com.sangam.sangam.entity.Skill s = skillRepository.findByNameIgnoreCase(trimmed)
                                                        .orElseGet(() -> {
                                                                com.sangam.sangam.entity.Skill newSkill = new com.sangam.sangam.entity.Skill();
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
                member.setJoinedAt(LocalDateTime.now());

                teamMemberRepository.save(member);

                return savedTeam;
        }

        public Team createTeam(CreateTeamRequest request) {
                return createTeam(request, null);
        }

        public TeamResponse updateTeam(Long teamId, com.sangam.sangam.dto.UpdateTeamRequest request, String authenticatedEmail) {
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
                                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max members cannot be less than current member count (" + currentCount + ")");
                        }
                        team.setMaxMembers(request.getMaxMembers());
                }
                team.setProjectName(request.getProjectName());
                team.setProjectDescription(request.getProjectDescription());
                team.setTeamVision(request.getTeamVision());
                team.setProjectType(request.getProjectType());
                team.setHackathonName(request.getHackathonName());
                team.setHackathonUrl(request.getHackathonUrl());
                team.setHackathonDeadline(request.getHackathonDeadline());

                if (request.getRequiredRoles() != null) {
                        team.setRequiredRoles(new java.util.HashSet<>(request.getRequiredRoles()));
                }

                if (request.getRequiredSkills() != null && skillRepository != null) {
                        java.util.Set<com.sangam.sangam.entity.Skill> skills = new java.util.HashSet<>();
                        for (String skillName : request.getRequiredSkills()) {
                                if (skillName != null && !skillName.isBlank()) {
                                        String trimmed = skillName.trim();
                                        com.sangam.sangam.entity.Skill s = skillRepository.findByNameIgnoreCase(trimmed)
                                                        .orElseGet(() -> {
                                                                com.sangam.sangam.entity.Skill newSkill = new com.sangam.sangam.entity.Skill();
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
                long memberCount = 0;
                try {
                        memberCount = teamMemberRepository.countByTeamId(team.getId());
                } catch (Exception e) {
                        memberCount = 1;
                }

                int max = team.getMaxMembers() != null ? team.getMaxMembers() : 4;
                String status = "OPEN";
                if (memberCount >= max) {
                        status = "FULL";
                } else if (memberCount >= max - 1) {
                        status = "ALMOST_FULL";
                }

                java.util.Set<String> skillNames = java.util.Collections.emptySet();
                try {
                        if (team.getRequiredSkills() != null) {
                                skillNames = team.getRequiredSkills().stream()
                                                .map(com.sangam.sangam.entity.Skill::getName)
                                                .filter(name -> name != null && !name.isBlank())
                                                .collect(java.util.stream.Collectors.toSet());
                        }
                } catch (Exception e) {
                        // Lazy loading fallback if not loaded
                }

                java.util.Set<String> roles = team.getRequiredRoles() != null
                                ? new java.util.HashSet<>(team.getRequiredRoles())
                                : java.util.Collections.emptySet();

                return new TeamResponse(
                                team.getId(),
                                team.getName(),
                                team.getDescription(),
                                team.getLeader().getId(),
                                team.getLeader().getName(),
                                team.getMaxMembers(),
                                team.getProjectName(),
                                team.getProjectDescription(),
                                team.getTeamVision(),
                                team.getProjectType(),
                                team.getHackathonName(),
                                team.getHackathonUrl(),
                                team.getHackathonDeadline(),
                                skillNames,
                                roles,
                                (int) memberCount,
                                status);
        }

        public List<TeamResponse> getAllTeams() {

                return teamRepository.findAll()
                                .stream()
                                .map(this::toTeamResponse)
                                .toList();
        }

        public TeamResponse getTeamById(Long teamId) {

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

                return toTeamResponse(team);
        }


        public List<TeamMemberResponse> getTeamMembers(Long teamId) {

                if (!teamRepository.existsById(teamId)) {
                        throw new RuntimeException("Team not found");
                }

                return teamMemberRepository.findByTeamId(teamId)
                                .stream()
                                .map(member -> {

                                        User user = userRepository.findById(member.getUserId())
                                                        .orElseThrow(() -> new RuntimeException("User not found"));

                                        return new TeamMemberResponse(
                                                        user.getId(),
                                                        user.getName(),
                                                        user.getEmail(),
                                                        user.getCollege(),
                                                        user.getBranch(),
                                                        user.getYear(),
                                                        member.getRole().name());
                                })
                                .toList();
        }

        public void removeMember(
                        Long teamId,
                        Long memberId,
                        Long leaderId) {

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new RuntimeException("Team not found"));

                if (!team.getLeader().getId().equals(leaderId)) {
                        throw new RuntimeException(
                                        "Only the team leader can remove members");
                }

                if (memberId.equals(leaderId)) {
                        throw new RuntimeException(
                                        "Leader cannot remove themselves");
                }

                TeamMemberId memberKey = new TeamMemberId(teamId, memberId);

                if (!teamMemberRepository.existsById(memberKey)) {
                        throw new RuntimeException(
                                        "User is not a member of this team");
                }

                teamMemberRepository.deleteById(memberKey);
        }

        public void leaveTeam(Long teamId, Long userId) {

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new RuntimeException("Team not found"));

                if (team.getLeader().getId().equals(userId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "Team leader cannot leave the team");
                }

                TeamMemberId memberKey = new TeamMemberId(teamId, userId);

                if (!teamMemberRepository.existsById(memberKey)) {
                        throw new RuntimeException(
                                        "User is not a member of this team");
                }

                teamMemberRepository.deleteById(memberKey);
        }

        public TeamJoinRequestResponse toJoinRequestResponse(TeamJoinRequest request) {

                return new TeamJoinRequestResponse(
                                request.getId(),
                                request.getUser().getId(),
                                request.getUser().getName(),
                                request.getStatus().name(),
                                request.getCreatedAt());
        }

        @Transactional
        public TeamJoinRequestResponse sendJoinRequest(Long teamId, Long userId) {

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

                Optional<TeamJoinRequest> existingRequest = teamJoinRequestRepository.findByTeamIdAndUserId(teamId,
                                userId);

                if (existingRequest.isPresent()) {
                        TeamJoinRequest req = existingRequest.get();
                        if (req.getStatus() == TeamJoinRequest.RequestStatus.PENDING) {
                                throw new ResponseStatusException(
                                                HttpStatus.CONFLICT,
                                                "User already has a pending join request for this team");
                        }
                        req.setStatus(TeamJoinRequest.RequestStatus.PENDING);
                        req.setCreatedAt(LocalDateTime.now());
                        req.setUpdatedAt(LocalDateTime.now());
                        TeamJoinRequest saved = teamJoinRequestRepository.save(req);
                        return toJoinRequestResponse(saved);
                }

                TeamJoinRequest request = new TeamJoinRequest(team, user, TeamJoinRequest.RequestStatus.PENDING);
                TeamJoinRequest saved = teamJoinRequestRepository.save(request);

                return toJoinRequestResponse(saved);
        }

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
        public void acceptJoinRequest(Long teamId, Long requestId, Long leaderId) {

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

                long currentMemberCount = teamMemberRepository.countByTeamId(teamId);
                if (team.getMaxMembers() != null && currentMemberCount >= team.getMaxMembers()) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Team is full");
                }

                TeamMember member = new TeamMember();
                member.setTeamId(team.getId());
                member.setUserId(applicantUserId);
                member.setRole(TeamMember.Role.MEMBER);
                member.setJoinedAt(LocalDateTime.now());
                teamMemberRepository.save(member);

                request.setStatus(TeamJoinRequest.RequestStatus.ACCEPTED);
                request.setUpdatedAt(LocalDateTime.now());
                teamJoinRequestRepository.save(request);
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
                                invitation.getCreatedAt(),
                                invitation.getUpdatedAt(),
                                invitation.getTeam().getMaxMembers());
        }

        @Transactional
        public TeamInvitationResponse inviteStudent(Long teamId, Long targetUserId, String authenticatedEmail) {
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
                        existing.setCreatedAt(LocalDateTime.now());
                        existing.setUpdatedAt(LocalDateTime.now());
                        TeamInvitation saved = teamInvitationRepository.save(existing);
                        return toInvitationResponse(saved);
                }

                TeamInvitation invitation = new TeamInvitation(team, targetUser, inviter, TeamInvitation.InvitationStatus.PENDING);
                TeamInvitation saved = teamInvitationRepository.save(invitation);
                return toInvitationResponse(saved);
        }

        @Transactional
        public void acceptInvitation(Long invitationId, String authenticatedEmail) {
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

                long currentMemberCount = teamMemberRepository.countByTeamId(team.getId());
                if (team.getMaxMembers() != null && currentMemberCount >= team.getMaxMembers()) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Team is full");
                }

                TeamMember member = new TeamMember();
                member.setTeamId(team.getId());
                member.setUserId(currentUser.getId());
                member.setRole(TeamMember.Role.MEMBER);
                member.setJoinedAt(LocalDateTime.now());
                teamMemberRepository.save(member);

                invitation.setStatus(TeamInvitation.InvitationStatus.ACCEPTED);
                invitation.setUpdatedAt(LocalDateTime.now());
                teamInvitationRepository.save(invitation);
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