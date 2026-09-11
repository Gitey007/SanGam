package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.sangam.sangam.dto.CreateTeamRequest;
import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.dto.TeamRoleSlotDto;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.SkillRepository;
import com.sangam.sangam.repository.TeamInvitationRepository;
import com.sangam.sangam.repository.TeamJoinRequestRepository;
import com.sangam.sangam.repository.TeamMemberRepository;
import com.sangam.sangam.repository.TeamRepository;
import com.sangam.sangam.repository.UserRepository;

@SpringBootTest
class TeamLazyLoadingIntegrationTest {

    @Autowired
    private TeamService teamService;

    @Autowired
    private UserService userService;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamJoinRequestRepository teamJoinRequestRepository;

    @Autowired
    private TeamInvitationRepository teamInvitationRepository;

    @BeforeEach
    void cleanDatabase() {
        teamInvitationRepository.deleteAll();
        teamJoinRequestRepository.deleteAll();
        teamMemberRepository.deleteAll();
        teamRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();
    }

    @Test
    @DisplayName("Team reads with requiredRoles and requiredSkills succeed without LazyInitializationException when open-in-view=false")
    void testTeamReadsWithoutLazyInitializationException() {
        // 1. Create a user
        User leader = new User();
        leader.setName("Alice Dev");
        leader.setEmail("alice@college.edu");
        leader.setPasswordHash("hashed_pass");
        leader.setCollege("MIT");
        leader.setBranch("CSE");
        leader.setYear((byte) 3);
        leader.setLookingFor(Set.of("Hackathon Teammates", "Open Source"));
        userRepository.save(leader);

        // 2. Create team via TeamService
        CreateTeamRequest request = new CreateTeamRequest();
        request.setName("Web3 Innovators");
        request.setDescription("Building decentralized applications");
        request.setProjectName("DeFi Protocol");
        request.setProjectDescription("Automated market maker on Ethereum");
        request.setTeamVision("Build decentralized future");
        request.setProjectType("Hackathon");
        request.setHackathonName("ETHGlobal 2026");
        request.setMaxMembers((byte) 4);
        request.setRequiredRoles(Set.of("Solidity Engineer", "Frontend Dev"));
        request.setRequiredSkills(Set.of("Solidity", "React"));

        Team createdTeam = teamService.createTeam(request, "alice@college.edu");
        assertNotNull(createdTeam);
        assertNotNull(createdTeam.getId());

        // 3. Test getTeamById
        TeamResponse singleTeam = teamService.getTeamById(createdTeam.getId());
        assertNotNull(singleTeam);
        assertEquals("Web3 Innovators", singleTeam.getName());
        assertEquals("Alice Dev", singleTeam.getLeaderName());
        assertEquals("DeFi Protocol", singleTeam.getProjectName());
        assertEquals("ETHGlobal 2026", singleTeam.getHackathonName());
        assertEquals("OPEN", singleTeam.getStatus());
        assertEquals(1, singleTeam.getMemberCount());
        assertEquals(2, singleTeam.getRequiredRoles().size());
        assertTrue(singleTeam.getRequiredRoles().contains("Solidity Engineer"));
        assertTrue(singleTeam.getRequiredRoles().contains("Frontend Dev"));
        assertEquals(2, singleTeam.getRequiredSkills().size());
        assertTrue(singleTeam.getRequiredSkills().contains("Solidity"));
        assertTrue(singleTeam.getRequiredSkills().contains("React"));

        // 4. Test getAllTeams
        List<TeamResponse> allTeams = teamService.getAllTeams();
        assertNotNull(allTeams);
        assertEquals(1, allTeams.size());
        TeamResponse listedTeam = allTeams.get(0);
        assertEquals(createdTeam.getId(), listedTeam.getId());
        assertEquals(2, listedTeam.getRequiredRoles().size());
        assertEquals(2, listedTeam.getRequiredSkills().size());
        assertEquals("Alice Dev", listedTeam.getLeaderName());

        // 5. Test UserService reads with lookingFor and skills
        UserProfileResponse userProfile = userService.getUserProfile(leader.getId());
        assertNotNull(userProfile);
        assertEquals("Alice Dev", userProfile.getName());
        assertEquals(2, userProfile.getLookingFor().size());
        assertTrue(userProfile.getLookingFor().contains("Hackathon Teammates"));
        assertTrue(userProfile.getLookingFor().contains("Open Source"));

        List<UserProfileResponse> users = userService.getAllUsers();
        assertNotNull(users);
        assertFalse(users.isEmpty());
        assertEquals(2, users.get(0).getLookingFor().size());
    }

    @Test
    @DisplayName("getAllTeams loads multiple teams and bulk-fetches members and role slots correctly with open-in-view=false")
    void testGetAllTeamsBulkLoadingWithMultipleTeamsAndMembers() {
        // 1. Create users
        User leader1 = new User();
        leader1.setName("Leader One");
        leader1.setEmail("leader1@college.edu");
        leader1.setPasswordHash("hashed_pass");
        leader1.setCollege("Stanford");
        leader1.setBranch("CSE");
        leader1.setYear((byte) 4);
        userRepository.save(leader1);

        User leader2 = new User();
        leader2.setName("Leader Two");
        leader2.setEmail("leader2@college.edu");
        leader2.setPasswordHash("hashed_pass");
        leader2.setCollege("Stanford");
        leader2.setBranch("ECE");
        leader2.setYear((byte) 3);
        userRepository.save(leader2);

        User memberUser = new User();
        memberUser.setName("Bob Member");
        memberUser.setEmail("bob@college.edu");
        memberUser.setPasswordHash("hashed_pass");
        memberUser.setCollege("Stanford");
        memberUser.setBranch("CSE");
        memberUser.setYear((byte) 2);
        userRepository.save(memberUser);

        // 2. Create Team 1
        CreateTeamRequest req1 = new CreateTeamRequest();
        req1.setName("Alpha Team");
        req1.setDescription("Alpha Description");
        req1.setMaxMembers((byte) 4);
        req1.setRequiredRoles(Set.of("Backend Dev", "Frontend Dev"));
        req1.setRequiredSkills(Set.of("Java", "React"));
        Team team1 = teamService.createTeam(req1, leader1.getEmail());

        // 3. Create Team 2
        CreateTeamRequest req2 = new CreateTeamRequest();
        req2.setName("Beta Team");
        req2.setDescription("Beta Description");
        req2.setMaxMembers((byte) 3);
        req2.setRequiredRoles(Set.of("DevOps"));
        req2.setRequiredSkills(Set.of("Docker"));
        Team team2 = teamService.createTeam(req2, leader2.getEmail());

        // 4. Add memberUser to Team 1 as Backend Dev
        TeamMember tm = new TeamMember();
        tm.setTeamId(team1.getId());
        tm.setUserId(memberUser.getId());
        tm.setRole(TeamMember.Role.MEMBER);
        tm.setAssignedRole("Backend Dev");
        tm.setJoinedAt(java.time.LocalDateTime.now());
        teamMemberRepository.save(tm);

        // 5. Test getAllTeams bulk fetch
        List<TeamResponse> teams = teamService.getAllTeams();
        assertNotNull(teams);
        assertEquals(2, teams.size());

        TeamResponse alpha = teams.stream().filter(t -> t.getId().equals(team1.getId())).findFirst().orElseThrow();
        assertEquals("Alpha Team", alpha.getName());
        assertEquals("Leader One", alpha.getLeaderName());
        assertEquals(2, alpha.getMemberCount()); // leader + bob
        assertEquals(2, alpha.getAvailableCapacity()); // 4 - 2 = 2
        assertEquals("OPEN", alpha.getStatus());
        assertEquals(2, alpha.getRequiredSkills().size());
        assertEquals(2, alpha.getRoleSlots().size());

        TeamRoleSlotDto backendSlot = alpha.getRoleSlots().stream()
                .filter(s -> "Backend Dev".equalsIgnoreCase(s.getRoleName()))
                .findFirst().orElseThrow();
        assertEquals(1, backendSlot.getSlotCount());
        assertEquals(1, backendSlot.getFilledSlots());
        assertEquals(0, backendSlot.getAvailableSlots());

        TeamResponse beta = teams.stream().filter(t -> t.getId().equals(team2.getId())).findFirst().orElseThrow();
        assertEquals("Beta Team", beta.getName());
        assertEquals("Leader Two", beta.getLeaderName());
        assertEquals(1, beta.getMemberCount()); // leader only
        assertEquals(2, beta.getAvailableCapacity()); // 3 - 1 = 2
        assertEquals("OPEN", beta.getStatus());
        assertEquals(1, beta.getRequiredSkills().size());
        assertEquals(1, beta.getRoleSlots().size());
    }
}
