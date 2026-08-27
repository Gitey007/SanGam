package com.sangam.sangam.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.CreateTeamRequest;
import com.sangam.sangam.dto.TeamJoinRequestResponse;
import com.sangam.sangam.dto.TeamMemberResponse;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.entity.TeamJoinRequest;
import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.TeamMemberId;
import com.sangam.sangam.entity.User;
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

        public TeamService(
                        TeamRepository teamRepository,
                        UserRepository userRepository,
                        TeamMemberRepository teamMemberRepository,
                        TeamJoinRequestRepository teamJoinRequestRepository) {

                this.teamRepository = teamRepository;
                this.userRepository = userRepository;
                this.teamMemberRepository = teamMemberRepository;
                this.teamJoinRequestRepository = teamJoinRequestRepository;
        }

        public Team createTeam(CreateTeamRequest request) {

                User leader = userRepository.findById(request.getLeaderId())
                                .orElseThrow(() -> new RuntimeException("Leader not found"));

                Team team = new Team();

                team.setName(request.getName());
                team.setDescription(request.getDescription());
                team.setLeader(leader);

                if (request.getMaxMembers() != null) {
                        team.setMaxMembers(request.getMaxMembers());
                }

                Team savedTeam = teamRepository.save(team);

                TeamMember member = new TeamMember();

                member.setTeamId(savedTeam.getId());
                member.setUserId(leader.getId());
                member.setRole(TeamMember.Role.LEADER);

                teamMemberRepository.save(member);

                return savedTeam;
        }

        public TeamResponse toTeamResponse(Team team) {

                return new TeamResponse(
                                team.getId(),
                                team.getName(),
                                team.getDescription(),
                                team.getLeader().getId(),
                                team.getLeader().getName(),
                                team.getMaxMembers());
        }

        public List<TeamResponse> getAllTeams() {

                return teamRepository.findAll()
                                .stream()
                                .map(this::toTeamResponse)
                                .toList();
        }

        public TeamResponse getTeamById(Long teamId) {

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new RuntimeException("Team not found"));

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
}