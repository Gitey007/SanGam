package com.sangam.sangam.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sangam.sangam.dto.CreateTeamRequest;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.TeamMemberRepository;
import com.sangam.sangam.repository.TeamRepository;
import com.sangam.sangam.repository.UserRepository;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;

    public TeamService(
            TeamRepository teamRepository,
            UserRepository userRepository,
            TeamMemberRepository teamMemberRepository) {

        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.teamMemberRepository = teamMemberRepository;
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
}