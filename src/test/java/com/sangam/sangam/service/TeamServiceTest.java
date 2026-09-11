package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
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

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private TeamJoinRequestRepository teamJoinRequestRepository;

    @Mock
    private TeamInvitationRepository teamInvitationRepository;

    @Mock
    private SkillRepository skillRepository;

    private TeamService teamService;

    private User leader;
    private User student;
    private User otherStudent;
    private Team team;

    @BeforeEach
    void setUp() {
        teamService = new TeamService(
                teamRepository,
                userRepository,
                teamMemberRepository,
                teamJoinRequestRepository,
                teamInvitationRepository,
                skillRepository);

        leader = new User();
        leader.setId(1L);
        leader.setName("Leader User");
        leader.setEmail("leader@college.edu");
        leader.setCollege("Engineering College");
        leader.setBranch("CSE");
        leader.setYear((byte) 3);

        student = new User();
        student.setId(2L);
        student.setName("Student User");
        student.setEmail("student@college.edu");
        student.setCollege("Engineering College");
        student.setBranch("ECE");
        student.setYear((byte) 2);

        otherStudent = new User();
        otherStudent.setId(3L);
        otherStudent.setName("Other Student");
        otherStudent.setEmail("other@college.edu");
        otherStudent.setCollege("Engineering College");
        otherStudent.setBranch("IT");
        otherStudent.setYear((byte) 2);

        team = new Team();
        team.setId(10L);
        team.setName("Team Alpha");
        team.setDescription("A project team for AI");
        team.setLeader(leader);
        team.setMaxMembers((byte) 4);
        team.setRoleSlots(List.of(
                new TeamRoleSlot("Backend Developer", 2),
                new TeamRoleSlot("Frontend Developer", 1),
                new TeamRoleSlot("Other / Custom", 1)
        ));
    }

    @Nested
    @DisplayName("Role Distribution & Slot Tests (Parts 1-6, 30)")
    class RoleDistributionTests {

        @Test
        @DisplayName("1 & 2. Valid role distribution sum equals maxMembers")
        void testValidRoleDistribution() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.save(any(Team.class))).thenAnswer(i -> {
                Team t = i.getArgument(0);
                t.setId(10L);
                return t;
            });

            CreateTeamRequest req = new CreateTeamRequest();
            req.setName("Innovators");
            req.setMaxMembers((byte) 5);
            req.setRoleSlots(List.of(
                    new TeamRoleSlotDto("Backend Developer", 2),
                    new TeamRoleSlotDto("Frontend Developer", 2),
                    new TeamRoleSlotDto("UI/UX Designer", 1)
            ));
            req.setLeaderRole("Backend Developer");

            Team created = teamService.createTeam(req, "leader@college.edu");
            assertNotNull(created);
            assertEquals(3, created.getRoleSlots().size());
            assertEquals(5, created.getRoleSlots().stream().mapToInt(TeamRoleSlot::getSlotCount).sum());

            ArgumentCaptor<TeamMember> memberCaptor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(memberCaptor.capture());
            assertEquals("Backend Developer", memberCaptor.getValue().getAssignedRole());
        }

        @Test
        @DisplayName("3. Invalid role distribution sum != maxMembers throws 400 Bad Request")
        void testInvalidRoleDistributionSum() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));

            CreateTeamRequest req = new CreateTeamRequest();
            req.setName("Innovators");
            req.setMaxMembers((byte) 5);
            req.setRoleSlots(List.of(
                    new TeamRoleSlotDto("Backend Developer", 2),
                    new TeamRoleSlotDto("Frontend Developer", 2)
                    // Total 4 != 5
            ));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.createTeam(req, "leader@college.edu"));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
            assertTrue(ex.getReason().contains("must equal the maximum team size"));
        }

        @Test
        @DisplayName("4, 5, 19, 20, 21. Other / Custom role category and custom role persistence")
        void testOtherCustomRoleCreationAndAssignment() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.save(any(Team.class))).thenAnswer(i -> {
                Team t = i.getArgument(0);
                t.setId(20L);
                return t;
            });

            CreateTeamRequest req = new CreateTeamRequest();
            req.setName("Web3 Pioneers");
            req.setMaxMembers((byte) 3);
            req.setRoleSlots(List.of(
                    new TeamRoleSlotDto("Frontend Developer", 1),
                    new TeamRoleSlotDto("Other / Custom", 2)
            ));
            req.setLeaderRole("Other / Custom");
            req.setLeaderCustomRole("Smart Contract Developer");

            Team created = teamService.createTeam(req, "leader@college.edu");
            assertNotNull(created);

            ArgumentCaptor<TeamMember> memberCaptor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(memberCaptor.capture());
            assertEquals("Other / Custom", memberCaptor.getValue().getAssignedRole());
            assertEquals("Smart Contract Developer", memberCaptor.getValue().getCustomRole());
        }
    }

    @Nested
    @DisplayName("Role Availability Calculation Tests (Part 7)")
    class RoleAvailabilityTests {

        @Test
        @DisplayName("6 & 7. Role availability calculation is based strictly on TeamMembers")
        void testRoleAvailabilityBasedOnTeamMembers() {
            TeamMember m1 = new TeamMember();
            m1.setTeamId(10L);
            m1.setUserId(1L);
            m1.setAssignedRole("Backend Developer");

            TeamMember m2 = new TeamMember();
            m2.setTeamId(10L);
            m2.setUserId(2L);
            m2.setAssignedRole("Other / Custom");
            m2.setCustomRole("ML Engineer");

            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of(m1, m2));

            TeamResponse resp = teamService.getTeamById(10L);
            assertNotNull(resp);
            assertEquals(2, resp.getMemberCount());

            List<TeamRoleSlotDto> slots = resp.getRoleSlots();
            assertEquals(3, slots.size());

            // Backend Developer: 1 of 2 filled, 1 available
            TeamRoleSlotDto backend = slots.stream().filter(s -> s.getRoleName().equals("Backend Developer")).findFirst().orElseThrow();
            assertEquals(2, backend.getSlotCount());
            assertEquals(1, backend.getFilledSlots());
            assertEquals(1, backend.getAvailableSlots());

            // Frontend Developer: 0 of 1 filled, 1 available
            TeamRoleSlotDto frontend = slots.stream().filter(s -> s.getRoleName().equals("Frontend Developer")).findFirst().orElseThrow();
            assertEquals(1, frontend.getSlotCount());
            assertEquals(0, frontend.getFilledSlots());
            assertEquals(1, frontend.getAvailableSlots());

            // Other / Custom: 1 of 1 filled, 0 available
            TeamRoleSlotDto other = slots.stream().filter(s -> s.getRoleName().equals("Other / Custom")).findFirst().orElseThrow();
            assertEquals(1, other.getSlotCount());
            assertEquals(1, other.getFilledSlots());
            assertEquals(0, other.getAvailableSlots());
        }
    }

    @Nested
    @DisplayName("Join Request with Role & Acceptance (Parts 8-11, 14, 25)")
    class JoinRequestWithRoleTests {

        @Test
        @DisplayName("8 & 9. Multiple pending requests for same role do not consume slots")
        void testMultiplePendingRequestsDoNotConsumeSlots() {
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);
            when(teamJoinRequestRepository.findByTeamIdAndUserId(10L, 2L)).thenReturn(Optional.empty());
            when(teamJoinRequestRepository.save(any(TeamJoinRequest.class))).thenAnswer(i -> {
                TeamJoinRequest r = i.getArgument(0);
                r.setId(101L);
                return r;
            });

            TeamJoinRequestResponse r1 = teamService.sendJoinRequest(10L, 2L, "Backend Developer", null);
            assertNotNull(r1);
            assertEquals("Backend Developer", r1.getRequestedRole());

            // Check that filled count in team response is still 0 (no team members added yet)
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of());
            TeamResponse tr = teamService.toTeamResponse(team);
            TeamRoleSlotDto backendSlot = tr.getRoleSlots().stream().filter(s -> s.getRoleName().equals("Backend Developer")).findFirst().orElseThrow();
            assertEquals(0, backendSlot.getFilledSlots());
            assertEquals(2, backendSlot.getAvailableSlots());
        }

        @Test
        @DisplayName("10 & 25. Accepting request consumes one slot and persists assigned role")
        void testAcceptingRequestConsumesSlot() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(55L);

            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamJoinRequestRepository.findById(55L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of());

            teamService.acceptJoinRequest(10L, 55L, 1L, null, null);

            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());
            ArgumentCaptor<TeamMember> captor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(captor.capture());
            assertEquals("Backend Developer", captor.getValue().getAssignedRole());
            assertNull(captor.getValue().getCustomRole());
        }

        @Test
        @DisplayName("11 & 12. Full role cannot be accepted directly, pending request remains")
        void testFullRoleCannotBeAccepted() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING, "Frontend Developer", null);
            req.setId(56L);

            TeamMember existingFrontendMember = new TeamMember();
            existingFrontendMember.setTeamId(10L);
            existingFrontendMember.setUserId(3L);
            existingFrontendMember.setAssignedRole("Frontend Developer");

            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamJoinRequestRepository.findById(56L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of(existingFrontendMember));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptJoinRequest(10L, 56L, 1L, null, null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertEquals("This role is no longer available.", ex.getReason());
            // Request is NOT modified or rejected; remains PENDING
            assertEquals(TeamJoinRequest.RequestStatus.PENDING, req.getStatus());
        }

        @Test
        @DisplayName("13. Accept as Another Role when requested role is full")
        void testAcceptAsAnotherRole() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING, "Frontend Developer", null);
            req.setId(57L);

            TeamMember existingFrontendMember = new TeamMember();
            existingFrontendMember.setTeamId(10L);
            existingFrontendMember.setUserId(3L);
            existingFrontendMember.setAssignedRole("Frontend Developer");

            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamJoinRequestRepository.findById(57L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of(existingFrontendMember));

            // Leader accepts student as "Backend Developer" instead
            teamService.acceptJoinRequest(10L, 57L, 1L, "Backend Developer", null);

            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());
            ArgumentCaptor<TeamMember> captor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(captor.capture());
            assertEquals("Backend Developer", captor.getValue().getAssignedRole());
        }
    }

    @Nested
    @DisplayName("Invitations with Role & Acceptance (Parts 12-14)")
    class InvitationWithRoleTests {

        @Test
        @DisplayName("14 & 15. Leader can send invitation with role; pending invitation does not consume slot")
        void testInviteWithRole() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);
            when(teamInvitationRepository.findByTeamIdAndInvitedUserId(10L, 2L)).thenReturn(Optional.empty());
            when(teamInvitationRepository.save(any(TeamInvitation.class))).thenAnswer(i -> {
                TeamInvitation inv = i.getArgument(0);
                inv.setId(201L);
                return inv;
            });

            TeamInvitationResponse resp = teamService.inviteStudent(10L, 2L, "leader@college.edu", "Other / Custom", "Cloud Architect");
            assertNotNull(resp);
            assertEquals("Other / Custom", resp.getInvitedRole());
            assertEquals("Cloud Architect", resp.getCustomRole());
        }

        @Test
        @DisplayName("16. Accepting invitation consumes slot and sets role")
        void testAcceptInvitationConsumesSlot() {
            TeamInvitation inv = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(202L);

            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(202L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of());

            teamService.acceptInvitation(202L, "student@college.edu", null, null);

            assertEquals(TeamInvitation.InvitationStatus.ACCEPTED, inv.getStatus());
            ArgumentCaptor<TeamMember> captor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(captor.capture());
            assertEquals("Backend Developer", captor.getValue().getAssignedRole());
        }

        @Test
        @DisplayName("17 & 18. Full role on invitation cannot be accepted directly, can accept as another role")
        void testFullRoleInvitationAndAcceptAlternateRole() {
            TeamInvitation inv = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING, "Frontend Developer", null);
            inv.setId(203L);

            TeamMember m = new TeamMember();
            m.setTeamId(10L);
            m.setUserId(3L);
            m.setAssignedRole("Frontend Developer");

            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(203L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of(m));

            // Direct acceptance fails
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(203L, "student@college.edu", null, null));
            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertEquals("This role is no longer available.", ex.getReason());

            // Accept as another role ("Backend Developer") succeeds
            teamService.acceptInvitation(203L, "student@college.edu", "Backend Developer", null);
            assertEquals(TeamInvitation.InvitationStatus.ACCEPTED, inv.getStatus());
        }

        @Test
        @DisplayName("Student with pending invitation cannot create Join Request")
        void testStudentWithPendingInvitationCannotCreateJoinRequest() {
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamInvitationRepository.existsByTeamIdAndInvitedUserIdAndStatus(10L, 2L, TeamInvitation.InvitationStatus.PENDING)).thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.sendJoinRequest(10L, 2L, "Backend Developer", null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("pending invitation"));
        }

        @Test
        @DisplayName("Student cannot accept invitation with non-existent role category")
        void testStudentCannotAcceptInvitationWithNonExistentRole() {
            TeamInvitation inv = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING, "Frontend Developer", null);
            inv.setId(204L);

            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(204L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(204L, "student@college.edu", "Quantum Computing Engineer", null));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
            assertTrue(ex.getReason().contains("not a defined team role"));
        }
    }

    @Nested
    @DisplayName("Leader Member Replacement & Authority (Parts 10, 11, 23, 24)")
    class LeaderReplacementTests {

        @Test
        @DisplayName("Leader can replace existing member to accept requester into full role")
        void testLeaderMemberReplacement() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING, "Frontend Developer", null);
            req.setId(60L);

            TeamMember existingMember = new TeamMember();
            existingMember.setTeamId(10L);
            existingMember.setUserId(3L);
            existingMember.setAssignedRole("Frontend Developer");

            when(teamJoinRequestRepository.findById(60L)).thenReturn(Optional.of(req));
            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 3L))).thenReturn(true);
            // After deleting member 3L, findByTeamId returns empty list
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of());

            teamService.acceptJoinRequest(10L, 60L, 1L, "Frontend Developer", null, 3L);

            verify(teamMemberRepository).deleteById(new TeamMemberId(10L, 3L));
            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());

            ArgumentCaptor<TeamMember> captor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(captor.capture());
            assertEquals(2L, captor.getValue().getUserId());
            assertEquals("Frontend Developer", captor.getValue().getAssignedRole());
        }

        @Test
        @DisplayName("Leader cannot remove/replace themselves")
        void testLeaderCannotReplaceThemselves() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(61L);

            when(teamJoinRequestRepository.findById(61L)).thenReturn(Optional.of(req));
            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptJoinRequest(10L, 61L, 1L, "Backend Developer", null, 1L));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Leader cannot remove themselves"));
        }

        @Test
        @DisplayName("Non-leader cannot accept join request with replacement (403 Forbidden)")
        void testNonLeaderCannotAcceptJoinRequest() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING, "Frontend Developer", null);
            req.setId(62L);

            when(teamJoinRequestRepository.findById(62L)).thenReturn(Optional.of(req));
            when(teamRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(team));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptJoinRequest(10L, 62L, 2L, "Frontend Developer", null, 3L));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Project Links Tests (Parts 18-25, 27-31)")
    class ProjectLinksTests {

        @Test
        @DisplayName("27 & 28. GitHub repository URL and documentation URL saved successfully")
        void testProjectUrlsSaved() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.save(any(Team.class))).thenAnswer(i -> {
                Team t = i.getArgument(0);
                t.setId(15L);
                return t;
            });

            CreateTeamRequest req = new CreateTeamRequest();
            req.setName("Project Link Team");
            req.setMaxMembers((byte) 4);
            req.setGithubRepositoryUrl("https://github.com/team-org/cool-project");
            req.setDocumentationUrl("https://docs.google.com/document/d/12345");

            Team created = teamService.createTeam(req, "leader@college.edu");
            assertNotNull(created);
            assertEquals("https://github.com/team-org/cool-project", created.getGithubRepositoryUrl());
            assertEquals("https://docs.google.com/document/d/12345", created.getDocumentationUrl());
        }

        @Test
        @DisplayName("29 & 30. Documentation URL can be null/empty, legacy teams work seamlessly")
        void testDocumentationUrlOptionalAndLegacyTeams() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.save(any(Team.class))).thenAnswer(i -> {
                Team t = i.getArgument(0);
                t.setId(16L);
                return t;
            });

            CreateTeamRequest req = new CreateTeamRequest();
            req.setName("Open Repo Team");
            req.setMaxMembers((byte) 4);
            req.setGithubRepositoryUrl("https://github.com/team-org/cool-project");
            req.setDocumentationUrl("");

            Team created = teamService.createTeam(req, "leader@college.edu");
            assertNotNull(created);
            assertEquals("https://github.com/team-org/cool-project", created.getGithubRepositoryUrl());
            assertNull(created.getDocumentationUrl());
        }

        @Test
        @DisplayName("31. Only team leader can update project links")
        void testOnlyLeaderCanUpdateProjectLinks() {
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(teamRepository.save(any(Team.class))).thenAnswer(i -> i.getArgument(0));

            UpdateTeamRequest req = new UpdateTeamRequest();
            req.setGithubRepositoryUrl("https://github.com/new/repo");
            req.setDocumentationUrl("https://notion.so/newdocs");

            TeamResponse resp = teamService.updateTeam(10L, req, "leader@college.edu");
            assertNotNull(resp);
            assertEquals("https://github.com/new/repo", resp.getGithubRepositoryUrl());
            assertEquals("https://notion.so/newdocs", resp.getDocumentationUrl());

            // Non-leader update throws 403
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.updateTeam(10L, req, "student@college.edu"));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Invalid URL scheme rejected (400 Bad Request)")
        void testInvalidUrlSchemeRejected() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));

            CreateTeamRequest req = new CreateTeamRequest();
            req.setName("Bad URL Team");
            req.setGithubRepositoryUrl("ftp://invalidscheme.com");

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.createTeam(req, "leader@college.edu"));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Team Member Management & Slot Release (Part 26)")
    class MemberManagementTests {

        @Test
        @DisplayName("26. Removing or leaving member frees up role slot")
        void testRemovingMemberFreesUpSlot() {
            TeamMember m = new TeamMember();
            m.setTeamId(10L);
            m.setUserId(2L);
            m.setAssignedRole("Backend Developer");

            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(true);

            teamService.removeMember(10L, 2L, 1L);
            verify(teamMemberRepository).deleteById(new TeamMemberId(10L, 2L));
        }

        @Test
        @DisplayName("Member list response returns assignedRole and customRole")
        void testGetTeamMembersReturnsRoles() {
            TeamMember m = new TeamMember();
            m.setTeamId(10L);
            m.setUserId(2L);
            m.setRole(TeamMember.Role.MEMBER);
            m.setAssignedRole("Other / Custom");
            m.setCustomRole("DevOps Engineer");

            when(teamRepository.existsById(10L)).thenReturn(true);
            when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of(m));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));

            List<TeamMemberResponse> members = teamService.getTeamMembers(10L);
            assertEquals(1, members.size());
            assertEquals("Other / Custom", members.get(0).getAssignedRole());
            assertEquals("DevOps Engineer", members.get(0).getCustomRole());
        }
    }

    @Nested
    @DisplayName("Team Deletion Tests (Parts 1-4, 17)")
    class TeamDeletionTests {

        @Test
        @DisplayName("1. Team leader can delete team successfully")
        void testLeaderCanDeleteTeam() {
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

            teamService.deleteTeam(10L, "leader@college.edu");

            verify(teamMemberRepository).deleteByTeamId(10L);
            verify(teamJoinRequestRepository).deleteByTeamId(10L);
            verify(teamInvitationRepository).deleteByTeamId(10L);
            verify(teamRepository).delete(team);
        }

        @Test
        @DisplayName("2. Non-leader cannot delete team (403 Forbidden)")
        void testNonLeaderCannotDeleteTeam() {
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.deleteTeam(10L, "student@college.edu"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
            verify(teamRepository, never()).delete(any());
            verify(teamMemberRepository, never()).deleteByTeamId(any());
        }

        @Test
        @DisplayName("3. Non-authenticated user cannot delete team (401 Unauthorized)")
        void testNonAuthenticatedUserCannotDeleteTeam() {
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.deleteTeam(10L, null));
            assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());

            ResponseStatusException ex2 = assertThrows(ResponseStatusException.class, () ->
                    teamService.deleteTeam(10L, "   "));
            assertEquals(HttpStatus.UNAUTHORIZED, ex2.getStatusCode());
        }

        @Test
        @DisplayName("4. Non-existent team returns 404 Not Found")
        void testNonExistentTeamReturnsNotFound() {
            when(teamRepository.findById(999L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.deleteTeam(999L, "leader@college.edu"));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("5-10. Cascade cleanup of members, requests, invitations, and role slots without touching users/skills")
        void testCascadeCleanupSafe() {
            Skill skill = new Skill();
            skill.setId(1L);
            skill.setName("React");
            team.getRequiredSkills().add(skill);

            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

            teamService.deleteTeam(10L, "leader@college.edu");

            verify(teamMemberRepository).deleteByTeamId(10L);
            verify(teamJoinRequestRepository).deleteByTeamId(10L);
            verify(teamInvitationRepository).deleteByTeamId(10L);
            assertTrue(team.getRequiredSkills().isEmpty(), "Required skills join association cleared");
            verify(teamRepository).delete(team);

            // Verify userRepository and skillRepository are NOT asked to delete user/skill records
            verify(userRepository, never()).delete(any());
            verify(userRepository, never()).deleteById(any());
            verify(skillRepository, never()).delete(any());
            verify(skillRepository, never()).deleteById(any());
        }

        @Test
        @DisplayName("13-17. Comprehensive role availability calculations (0/1, 0/2, 1/2, 2/2 FULL, requests/invites do not consume)")
        void testComprehensiveRoleSlotAvailability() {
            Team testTeam = new Team();
            testTeam.setId(20L);
            testTeam.setName("Slot Test Team");
            testTeam.setLeader(leader);
            testTeam.setMaxMembers((byte) 5);
            testTeam.setRoleSlots(List.of(
                    new TeamRoleSlot("Frontend Developer", 1),
                    new TeamRoleSlot("Backend Developer", 2),
                    new TeamRoleSlot("UI/UX Designer", 2)
            ));

            // Only 1 backend dev and 2 UI/UX designers joined
            TeamMember backendMember = new TeamMember();
            backendMember.setTeamId(20L);
            backendMember.setUserId(2L);
            backendMember.setAssignedRole("Backend Developer");

            TeamMember designer1 = new TeamMember();
            designer1.setTeamId(20L);
            designer1.setUserId(3L);
            designer1.setAssignedRole("UI/UX Designer");

            TeamMember designer2 = new TeamMember();
            designer2.setTeamId(20L);
            designer2.setUserId(4L);
            designer2.setAssignedRole("UI/UX Designer");

            when(teamRepository.findById(20L)).thenReturn(Optional.of(testTeam));
            when(teamMemberRepository.findByTeamId(20L)).thenReturn(List.of(backendMember, designer1, designer2));

            TeamResponse response = teamService.getTeamById(20L);
            assertNotNull(response);

            List<TeamRoleSlotDto> slotDtos = response.getRoleSlots();

            // 1. Frontend: 1 slot, 0 filled -> 0/1, 1 available
            TeamRoleSlotDto fe = slotDtos.stream().filter(s -> s.getRoleName().equals("Frontend Developer")).findFirst().orElseThrow();
            assertEquals(1, fe.getSlotCount());
            assertEquals(0, fe.getFilledSlots());
            assertEquals(1, fe.getAvailableSlots());

            // 2. Backend: 2 slots, 1 filled -> 1/2, 1 available
            TeamRoleSlotDto be = slotDtos.stream().filter(s -> s.getRoleName().equals("Backend Developer")).findFirst().orElseThrow();
            assertEquals(2, be.getSlotCount());
            assertEquals(1, be.getFilledSlots());
            assertEquals(1, be.getAvailableSlots());

            // 3. UI/UX: 2 slots, 2 filled -> 2/2, 0 available (FULL)
            TeamRoleSlotDto ui = slotDtos.stream().filter(s -> s.getRoleName().equals("UI/UX Designer")).findFirst().orElseThrow();
            assertEquals(2, ui.getSlotCount());
            assertEquals(2, ui.getFilledSlots());
            assertEquals(0, ui.getAvailableSlots());
        }
    }

    @Nested
    @DisplayName("Role Conflict & Coexistence Final Requirements (Parts 1-20)")
    class RoleConflictHandlingFinalVerificationTests {

        private Team singleSlotTeam;
        private User candidate1;
        private User candidate2;

        @BeforeEach
        void setUpConflictTeam() {
            singleSlotTeam = new Team();
            singleSlotTeam.setId(30L);
            singleSlotTeam.setName("Coexistence Team");
            singleSlotTeam.setLeader(leader);
            singleSlotTeam.setMaxMembers((byte) 2);
            singleSlotTeam.setRoleSlots(List.of(
                    new TeamRoleSlot("Backend Developer", 1),
                    new TeamRoleSlot("Frontend Developer", 1)
            ));

            candidate1 = new User();
            candidate1.setId(101L);
            candidate1.setName("Rahul Kumar");
            candidate1.setEmail("rahul@college.edu");

            candidate2 = new User();
            candidate2.setId(102L);
            candidate2.setName("Priya Kumar");
            candidate2.setEmail("priya@college.edu");
        }

        @Test
        @DisplayName("1. Pending invitation + pending join request can coexist simultaneously")
        void testPendingInvitationAndJoinRequestCoexist() {
            TeamInvitation pendingInv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            pendingInv.setId(301L);

            TeamJoinRequest pendingReq = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            pendingReq.setId(302L);

            assertEquals(TeamInvitation.InvitationStatus.PENDING, pendingInv.getStatus());
            assertEquals(TeamJoinRequest.RequestStatus.PENDING, pendingReq.getStatus());
            assertEquals("Backend Developer", pendingInv.getInvitedRole());
            assertEquals("Backend Developer", pendingReq.getRequestedRole());
        }

        @Test
        @DisplayName("2. Accepting invitation fills role but does NOT auto-cancel pending join request")
        void testAcceptingInvitationDoesNotCancelJoinRequest() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            TeamJoinRequest req = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(302L);

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            // Rahul accepts invitation
            teamService.acceptInvitation(301L, "rahul@college.edu", null, null);

            assertEquals(TeamInvitation.InvitationStatus.ACCEPTED, inv.getStatus());
            // Join Request remains untouched and PENDING
            assertEquals(TeamJoinRequest.RequestStatus.PENDING, req.getStatus());
            verify(teamJoinRequestRepository, never()).save(req);
        }

        @Test
        @DisplayName("3. Accepting join request fills role but does NOT auto-cancel pending invitation")
        void testAcceptingJoinRequestDoesNotCancelInvitation() {
            TeamJoinRequest req = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(302L);

            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamJoinRequestRepository.findById(302L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 102L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            // Leader accepts Priya's join request
            teamService.acceptJoinRequest(30L, 302L, 1L, null, null);

            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());
            // Invitation remains untouched and PENDING
            assertEquals(TeamInvitation.InvitationStatus.PENDING, inv.getStatus());
            verify(teamInvitationRepository, never()).save(inv);
        }

        @Test
        @DisplayName("4. Full role throws 409 Conflict and does NOT automatically reject join request")
        void testFullRoleDoesNotAutoRejectJoinRequest() {
            TeamJoinRequest req = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(302L);

            TeamMember existingBackendMember = new TeamMember();
            existingBackendMember.setTeamId(30L);
            existingBackendMember.setUserId(101L);
            existingBackendMember.setAssignedRole("Backend Developer");

            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamJoinRequestRepository.findById(302L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 102L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of(existingBackendMember));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptJoinRequest(30L, 302L, 1L, null, null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertEquals("This role is no longer available.", ex.getReason());
            assertEquals(TeamJoinRequest.RequestStatus.PENDING, req.getStatus());
        }

        @Test
        @DisplayName("5. Full role throws 409 Conflict and does NOT automatically reject invitation")
        void testFullRoleDoesNotAutoRejectInvitation() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            TeamMember existingBackendMember = new TeamMember();
            existingBackendMember.setTeamId(30L);
            existingBackendMember.setUserId(102L);
            existingBackendMember.setAssignedRole("Backend Developer");

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of(existingBackendMember));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(301L, "rahul@college.edu", null, null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertEquals("This role is no longer available.", ex.getReason());
            assertEquals(TeamInvitation.InvitationStatus.PENDING, inv.getStatus());
        }

        @Test
        @DisplayName("6. Leader can accept pending request as another available role")
        void testLeaderCanAcceptPendingRequestAsAnotherRole() {
            TeamJoinRequest req = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(302L);

            TeamMember existingBackendMember = new TeamMember();
            existingBackendMember.setTeamId(30L);
            existingBackendMember.setUserId(101L);
            existingBackendMember.setAssignedRole("Backend Developer");

            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamJoinRequestRepository.findById(302L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 102L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of(existingBackendMember));

            // Leader reassigns Priya to "Frontend Developer"
            teamService.acceptJoinRequest(30L, 302L, 1L, "Frontend Developer", null);

            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());
            ArgumentCaptor<TeamMember> captor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(captor.capture());
            assertEquals("Frontend Developer", captor.getValue().getAssignedRole());
            assertEquals(102L, captor.getValue().getUserId());
        }

        @Test
        @DisplayName("7. Student can accept pending invitation as another available role")
        void testStudentCanAcceptPendingInvitationAsAnotherRole() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            TeamMember existingBackendMember = new TeamMember();
            existingBackendMember.setTeamId(30L);
            existingBackendMember.setUserId(102L);
            existingBackendMember.setAssignedRole("Backend Developer");

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of(existingBackendMember));

            // Rahul accepts as "Frontend Developer"
            teamService.acceptInvitation(301L, "rahul@college.edu", "Frontend Developer", null);

            assertEquals(TeamInvitation.InvitationStatus.ACCEPTED, inv.getStatus());
            ArgumentCaptor<TeamMember> captor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(captor.capture());
            assertEquals("Frontend Developer", captor.getValue().getAssignedRole());
            assertEquals(101L, captor.getValue().getUserId());
        }

        @Test
        @DisplayName("8. Alternative role must already exist in team role slots")
        void testAlternativeRoleMustAlreadyExist() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(301L, "rahul@college.edu", "Cybersecurity Specialist", null));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
            assertTrue(ex.getReason().contains("not a defined team role"));
        }

        @Test
        @DisplayName("9. Alternative role must have available slots (throws 409 if also full)")
        void testAlternativeRoleMustHaveAvailableSlots() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            TeamMember feMember = new TeamMember();
            feMember.setTeamId(30L);
            feMember.setUserId(103L);
            feMember.setAssignedRole("Frontend Developer");

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of(feMember));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(301L, "rahul@college.edu", "Frontend Developer", null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertEquals("This role is no longer available.", ex.getReason());
        }

        @Test
        @DisplayName("10. Student cannot create a new role during alternative invitation acceptance")
        void testStudentCannotCreateNewRoleDuringAlternativeInvitationAcceptance() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(301L, "rahul@college.edu", "Custom Role Created By Student", null));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
            assertTrue(ex.getReason().contains("not a defined team role"));
        }

        @Test
        @DisplayName("11 & 12. Pending requests and invitations do NOT consume slots")
        void testPendingRequestsAndInvitationsDoNotConsumeSlots() {
            // Team with 1 Backend Developer slot and 0 members
            when(teamRepository.findById(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            TeamResponse resp = teamService.getTeamById(30L);
            TeamRoleSlotDto beSlot = resp.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Backend Developer"))
                    .findFirst()
                    .orElseThrow();

            assertEquals(0, beSlot.getFilledSlots());
            assertEquals(1, beSlot.getAvailableSlots());
        }

        @Test
        @DisplayName("13. Only TeamMembers consume role slots")
        void testOnlyTeamMembersConsumeSlots() {
            TeamMember m = new TeamMember();
            m.setTeamId(30L);
            m.setUserId(101L);
            m.setAssignedRole("Backend Developer");

            when(teamRepository.findById(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of(m));

            TeamResponse resp = teamService.getTeamById(30L);
            TeamRoleSlotDto beSlot = resp.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Backend Developer"))
                    .findFirst()
                    .orElseThrow();

            assertEquals(1, beSlot.getFilledSlots());
            assertEquals(0, beSlot.getAvailableSlots());
        }

        @Test
        @DisplayName("14. Request becomes ACCEPTED after successful acceptance")
        void testRequestBecomesAcceptedAfterSuccessfulAcceptance() {
            TeamJoinRequest req = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(302L);

            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamJoinRequestRepository.findById(302L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 102L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            teamService.acceptJoinRequest(30L, 302L, 1L);

            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());
            assertNotNull(req.getUpdatedAt());
        }

        @Test
        @DisplayName("15. Invitation becomes ACCEPTED after successful acceptance")
        void testInvitationBecomesAcceptedAfterSuccessfulAcceptance() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            teamService.acceptInvitation(301L, "rahul@college.edu");

            assertEquals(TeamInvitation.InvitationStatus.ACCEPTED, inv.getStatus());
            assertNotNull(inv.getUpdatedAt());
        }

        @Test
        @DisplayName("16. Accepted records disappear from pending queries (query filters by status = PENDING)")
        void testAcceptedRecordsDisappearFromPendingQueries() {
            when(teamRepository.findById(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamJoinRequestRepository.findByTeamIdAndStatus(30L, TeamJoinRequest.RequestStatus.PENDING))
                    .thenReturn(List.of());

            List<TeamJoinRequestResponse> pending = teamService.getPendingJoinRequests(30L, 1L);
            assertTrue(pending.isEmpty());
        }

        @Test
        @DisplayName("17. Accepted records remain in database/history (never deleted)")
        void testAcceptedRecordsRemainInDatabaseHistory() {
            TeamJoinRequest req = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(302L);

            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamJoinRequestRepository.findById(302L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 102L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            teamService.acceptJoinRequest(30L, 302L, 1L);

            // Verified saved as ACCEPTED, delete is never called on request
            verify(teamJoinRequestRepository).save(req);
            verify(teamJoinRequestRepository, never()).delete(any());
            verify(teamJoinRequestRepository, never()).deleteById(any());
        }

        @Test
        @DisplayName("18. Leader replacement remains transactional")
        void testLeaderReplacementRemainsTransactional() {
            TeamJoinRequest req = new TeamJoinRequest(singleSlotTeam, candidate2, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            req.setId(302L);

            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamJoinRequestRepository.findById(302L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 102L))).thenReturn(false);
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(true);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of());

            teamService.acceptJoinRequest(30L, 302L, 1L, "Backend Developer", null, 101L);

            verify(teamMemberRepository).deleteById(new TeamMemberId(30L, 101L));
            verify(teamMemberRepository).save(any(TeamMember.class));
            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());
        }

        @Test
        @DisplayName("19. Concurrency cannot overfill a role (fresh validation throws 409 Conflict)")
        void testConcurrencyCannotOverfillRole() {
            TeamInvitation inv = new TeamInvitation(singleSlotTeam, candidate1, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            inv.setId(301L);

            // Simulate concurrent thread already added a member to the only Backend Developer slot
            TeamMember concurrentMember = new TeamMember();
            concurrentMember.setTeamId(30L);
            concurrentMember.setUserId(999L);
            concurrentMember.setAssignedRole("Backend Developer");

            when(userRepository.findByEmail("rahul@college.edu")).thenReturn(Optional.of(candidate1));
            when(teamInvitationRepository.findById(301L)).thenReturn(Optional.of(inv));
            when(teamRepository.findByIdForUpdate(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamMemberRepository.findByTeamId(30L)).thenReturn(List.of(concurrentMember));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(301L, "rahul@college.edu"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertEquals("This role is no longer available.", ex.getReason());
        }

        @Test
        @DisplayName("20. Invitation priority prevents duplicate Join Request (HTTP 409 Conflict)")
        void testInvitationPriorityPreventsDuplicateJoinRequest() {
            when(teamRepository.findById(30L)).thenReturn(Optional.of(singleSlotTeam));
            when(userRepository.findById(101L)).thenReturn(Optional.of(candidate1));
            when(teamMemberRepository.existsById(new TeamMemberId(30L, 101L))).thenReturn(false);
            when(teamInvitationRepository.existsByTeamIdAndInvitedUserIdAndStatus(30L, 101L, TeamInvitation.InvitationStatus.PENDING))
                    .thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.sendJoinRequest(30L, 101L, "Backend Developer", null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("pending invitation"));
        }

        @Test
        @DisplayName("21. Only team leader can configure role slots (403 Forbidden for non-leader)")
        void testOnlyLeaderCanConfigureRoleSlots() {
            when(teamRepository.findById(30L)).thenReturn(Optional.of(singleSlotTeam));

            UpdateTeamRequest req = new UpdateTeamRequest();
            req.setRoleSlots(List.of(
                    new TeamRoleSlotDto("Backend Developer", 1),
                    new TeamRoleSlotDto("Frontend Developer", 1)
            ));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.updateTeam(30L, req, "rahul@college.edu"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("22. Only team leader can replace/remove members (403 Forbidden for non-leader)")
        void testOnlyLeaderCanReplaceOrRemoveMembers() {
            when(teamRepository.findById(30L)).thenReturn(Optional.of(singleSlotTeam));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.removeMember(30L, 101L, 102L)); // Leader ID is 1L, caller is 102L

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Team Deadline, Extension & Sorting Tests")
    class TeamDeadlineAndSortingTests {

        private Team testTeam;

        @BeforeEach
        void init() {
            testTeam = new Team();
            testTeam.setId(30L);
            testTeam.setName("Deadline Team");
            testTeam.setLeader(leader);
            testTeam.setMaxMembers((byte) 4);
        }

        @Test
        @DisplayName("Expired team rejects join request with CONFLICT")
        void testExpiredTeamRejectsJoinRequest() {
            testTeam.setJoinDeadline(LocalDateTime.now().minusDays(1));
            when(teamRepository.findById(30L)).thenReturn(Optional.of(testTeam));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.sendJoinRequest(30L, 2L, "Backend Developer", null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("deadline has expired"));
        }

        @Test
        @DisplayName("Expired team rejects invitation with CONFLICT")
        void testExpiredTeamRejectsInvitation() {
            testTeam.setJoinDeadline(LocalDateTime.now().minusDays(1));
            when(teamRepository.findById(30L)).thenReturn(Optional.of(testTeam));
            when(userRepository.findByEmail(leader.getEmail())).thenReturn(Optional.of(leader));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(30L, 2L, leader.getEmail(), "Backend Developer", null));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("deadline has expired"));
        }

        @Test
        @DisplayName("Leader can extend deadline successfully")
        void testLeaderCanExtendDeadline() {
            testTeam.setJoinDeadline(LocalDateTime.now().minusDays(1));
            when(teamRepository.findById(30L)).thenReturn(Optional.of(testTeam));
            when(teamRepository.save(any(Team.class))).thenAnswer(i -> i.getArgument(0));

            LocalDateTime newDeadline = LocalDateTime.now().plusDays(7);
            TeamResponse res = teamService.extendDeadline(30L, newDeadline, leader.getEmail());

            assertNotNull(res);
            assertFalse(res.isExpired());
            assertEquals(newDeadline, res.getJoinDeadline());
        }

        @Test
        @DisplayName("Non-leader cannot extend deadline (403 Forbidden)")
        void testNonLeaderCannotExtendDeadline() {
            when(teamRepository.findById(30L)).thenReturn(Optional.of(testTeam));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.extendDeadline(30L, LocalDateTime.now().plusDays(7), "stranger@college.edu"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Teams are sorted: Active (more capacity first) -> Expired")
        void testTeamSortingOrder() {
            Team activeMoreCapacity = new Team();
            activeMoreCapacity.setId(101L);
            activeMoreCapacity.setName("Active More Cap");
            activeMoreCapacity.setLeader(leader);
            activeMoreCapacity.setMaxMembers((byte) 5);
            activeMoreCapacity.setJoinDeadline(LocalDateTime.now().plusDays(5));

            Team activeLessCapacity = new Team();
            activeLessCapacity.setId(102L);
            activeLessCapacity.setName("Active Less Cap");
            activeLessCapacity.setLeader(leader);
            activeLessCapacity.setMaxMembers((byte) 3);
            activeLessCapacity.setJoinDeadline(LocalDateTime.now().plusDays(5));

            Team expiredTeam = new Team();
            expiredTeam.setId(103L);
            expiredTeam.setName("Expired Team");
            expiredTeam.setLeader(leader);
            expiredTeam.setMaxMembers((byte) 10);
            expiredTeam.setJoinDeadline(LocalDateTime.now().minusDays(2));

            when(teamRepository.findAll()).thenReturn(List.of(expiredTeam, activeLessCapacity, activeMoreCapacity));
            when(teamMemberRepository.findByTeamId(any())).thenReturn(java.util.Collections.emptyList());

            List<TeamResponse> sorted = teamService.getAllTeams();

            assertEquals(3, sorted.size());
            assertEquals(101L, sorted.get(0).getId()); // Active with cap 5
            assertEquals(102L, sorted.get(1).getId()); // Active with cap 3
            assertEquals(103L, sorted.get(2).getId()); // Expired
        }
    }

    @Nested
    @DisplayName("Cancellation and Decline Tests (Specs 7-15, 19-22)")
    class CancellationAndDeclineTests {

        private TeamJoinRequest pendingRequest;
        private TeamInvitation pendingInvitation;

        @BeforeEach
        void init() {
            pendingRequest = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
            pendingRequest.setId(500L);

            pendingInvitation = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
            pendingInvitation.setId(600L);
        }

        @Test
        @DisplayName("Student successfully cancels own pending join request")
        void testStudentCancelsOwnPendingJoinRequest() {
            when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
            when(teamJoinRequestRepository.findById(500L)).thenReturn(Optional.of(pendingRequest));

            teamService.cancelJoinRequest(team.getId(), 500L, student.getEmail());

            assertEquals(TeamJoinRequest.RequestStatus.CANCELLED, pendingRequest.getStatus());
            verify(teamJoinRequestRepository).save(pendingRequest);
        }

        @Test
        @DisplayName("Student cancelling other user's join request is forbidden (403)")
        void testStudentCannotCancelOtherUserJoinRequest() {
            when(userRepository.findByEmail(otherStudent.getEmail())).thenReturn(Optional.of(otherStudent));
            when(teamJoinRequestRepository.findById(500L)).thenReturn(Optional.of(pendingRequest));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.cancelJoinRequest(team.getId(), 500L, otherStudent.getEmail()));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
            assertEquals(TeamJoinRequest.RequestStatus.PENDING, pendingRequest.getStatus());
        }

        @Test
        @DisplayName("Cannot cancel non-pending join request (400 Bad Request)")
        void testCannotCancelNonPendingJoinRequest() {
            pendingRequest.setStatus(TeamJoinRequest.RequestStatus.ACCEPTED);
            when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
            when(teamJoinRequestRepository.findById(500L)).thenReturn(Optional.of(pendingRequest));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.cancelJoinRequest(team.getId(), 500L, student.getEmail()));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Student can submit fresh join request after cancelling previous request")
        void testStudentCanSubmitFreshJoinRequestAfterCancellation() {
            pendingRequest.setStatus(TeamJoinRequest.RequestStatus.CANCELLED);
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
            when(teamJoinRequestRepository.findByTeamIdAndUserId(team.getId(), student.getId()))
                    .thenReturn(Optional.of(pendingRequest));
            when(teamJoinRequestRepository.save(any(TeamJoinRequest.class))).thenAnswer(i -> i.getArgument(0));

            teamService.sendJoinRequest(team.getId(), student.getId(), "Frontend Developer", null);

            assertEquals(TeamJoinRequest.RequestStatus.PENDING, pendingRequest.getStatus());
            assertEquals("Frontend Developer", pendingRequest.getRequestedRole());
            verify(teamJoinRequestRepository).save(pendingRequest);
        }

        @Test
        @DisplayName("Leader successfully cancels sent pending invitation")
        void testLeaderCancelsSentPendingInvitation() {
            when(userRepository.findByEmail(leader.getEmail())).thenReturn(Optional.of(leader));
            when(teamInvitationRepository.findById(600L)).thenReturn(Optional.of(pendingInvitation));

            teamService.cancelSentInvitation(team.getId(), 600L, leader.getEmail());

            assertEquals(TeamInvitation.InvitationStatus.CANCELLED, pendingInvitation.getStatus());
            verify(teamInvitationRepository).save(pendingInvitation);
        }

        @Test
        @DisplayName("Non-leader cannot cancel sent invitation (403 Forbidden)")
        void testNonLeaderCannotCancelSentInvitation() {
            when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(600L)).thenReturn(Optional.of(pendingInvitation));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.cancelSentInvitation(team.getId(), 600L, student.getEmail()));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
            assertEquals(TeamInvitation.InvitationStatus.PENDING, pendingInvitation.getStatus());
        }

        @Test
        @DisplayName("Student cannot accept cancelled invitation (400 Bad Request)")
        void testStudentCannotAcceptCancelledInvitation() {
            pendingInvitation.setStatus(TeamInvitation.InvitationStatus.CANCELLED);
            when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(600L)).thenReturn(Optional.of(pendingInvitation));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(600L, student.getEmail()));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("Student declining invitation sets status to REJECTED")
        void testStudentDecliningInvitationSetsRejected() {
            when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(600L)).thenReturn(Optional.of(pendingInvitation));

            teamService.rejectInvitation(600L, student.getEmail());

            assertEquals(TeamInvitation.InvitationStatus.REJECTED, pendingInvitation.getStatus());
            verify(teamInvitationRepository).save(pendingInvitation);
        }
    }

    @Nested
    @DisplayName("Role Openings and Deduplication Tests (Specs 1-13)")
    class RoleOpeningsAndDeduplicationTests {

        @Test
        @DisplayName("Team 2/6: Backend (0/2), Frontend (0/1), Researcher (0/1) -> Backend=2, Frontend=1, Researcher=1 (NOT 12, 10, 6, or 4)")
        void testTeamTwoOfSixExactRoleCapacities() {
            Team teamX = new Team();
            teamX.setId(901L);
            teamX.setName("Team-X");
            teamX.setLeader(leader);
            teamX.setMaxMembers((byte) 6);

            TeamRoleSlot slotA = new TeamRoleSlot("Backend Developer", 2);
            TeamRoleSlot slotB = new TeamRoleSlot("Frontend Developer", 1);
            TeamRoleSlot slotC = new TeamRoleSlot("Researcher", 1);
            teamX.setRoleSlots(List.of(slotA, slotB, slotC));

            // 2 members in team, assigned to unrelated roles
            TeamMember m1 = new TeamMember();
            m1.setTeamId(901L);
            m1.setUserId(1L);
            m1.setRole(TeamMember.Role.LEADER);
            m1.setAssignedRole("Project Manager");

            TeamMember m2 = new TeamMember();
            m2.setTeamId(901L);
            m2.setUserId(2L);
            m2.setRole(TeamMember.Role.MEMBER);
            m2.setAssignedRole("UI/UX Designer");

            when(teamMemberRepository.findByTeamId(901L)).thenReturn(List.of(m1, m2));

            TeamResponse response = teamService.toTeamResponse(teamX);

            assertEquals("OPEN", response.getStatus());
            assertEquals(2, response.getMemberCount());
            assertEquals((byte) 6, response.getMaxMembers());

            // Backend Developer: 0 filled, 2 total -> 2 available (NOT 12, NOT 4)
            TeamRoleSlotDto backend = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Backend Developer"))
                    .findFirst().orElseThrow();
            assertEquals(2, backend.getSlotCount());
            assertEquals(0, backend.getFilledSlots());
            assertEquals(2, backend.getAvailableSlots());

            // Frontend Developer: 0 filled, 1 total -> 1 available (NOT 10, NOT 4)
            TeamRoleSlotDto frontend = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Frontend Developer"))
                    .findFirst().orElseThrow();
            assertEquals(1, frontend.getSlotCount());
            assertEquals(0, frontend.getFilledSlots());
            assertEquals(1, frontend.getAvailableSlots());

            // Researcher: 0 filled, 1 total -> 1 available (NOT 6, NOT 4)
            TeamRoleSlotDto researcher = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Researcher"))
                    .findFirst().orElseThrow();
            assertEquals(1, researcher.getSlotCount());
            assertEquals(0, researcher.getFilledSlots());
            assertEquals(1, researcher.getAvailableSlots());
        }

        @Test
        @DisplayName("Team 5/6: Backend (2/2), Frontend (1/2), Researcher (1/1) -> Frontend=1 opening only")
        void testTeamFiveOfSixOnlyShowsAvailableRole() {
            Team teamY = new Team();
            teamY.setId(902L);
            teamY.setName("CodeCrafters");
            teamY.setLeader(leader);
            teamY.setMaxMembers((byte) 6);

            TeamRoleSlot slotA = new TeamRoleSlot("Backend Developer", 2);
            TeamRoleSlot slotB = new TeamRoleSlot("Frontend Developer", 2);
            TeamRoleSlot slotC = new TeamRoleSlot("Researcher", 1);
            teamY.setRoleSlots(List.of(slotA, slotB, slotC));

            TeamMember m1 = new TeamMember();
            m1.setTeamId(902L);
            m1.setUserId(1L);
            m1.setAssignedRole("Backend Developer");

            TeamMember m2 = new TeamMember();
            m2.setTeamId(902L);
            m2.setUserId(2L);
            m2.setAssignedRole("Backend Developer");

            TeamMember m3 = new TeamMember();
            m3.setTeamId(902L);
            m3.setUserId(3L);
            m3.setAssignedRole("Frontend Developer");

            TeamMember m4 = new TeamMember();
            m4.setTeamId(902L);
            m4.setUserId(4L);
            m4.setAssignedRole("Researcher");

            TeamMember m5 = new TeamMember();
            m5.setTeamId(902L);
            m5.setUserId(5L);
            m5.setAssignedRole("Project Manager");

            when(teamMemberRepository.findByTeamId(902L)).thenReturn(List.of(m1, m2, m3, m4, m5));

            TeamResponse response = teamService.toTeamResponse(teamY);

            assertEquals(5, response.getMemberCount());
            assertEquals((byte) 6, response.getMaxMembers());

            // Backend: 2 filled of 2 -> 0 available
            TeamRoleSlotDto backend = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Backend Developer"))
                    .findFirst().orElseThrow();
            assertEquals(2, backend.getSlotCount());
            assertEquals(2, backend.getFilledSlots());
            assertEquals(0, backend.getAvailableSlots());

            // Frontend: 1 filled of 2 -> 1 available
            TeamRoleSlotDto frontend = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Frontend Developer"))
                    .findFirst().orElseThrow();
            assertEquals(2, frontend.getSlotCount());
            assertEquals(1, frontend.getFilledSlots());
            assertEquals(1, frontend.getAvailableSlots());

            // Researcher: 1 filled of 1 -> 0 available
            TeamRoleSlotDto researcher = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Researcher"))
                    .findFirst().orElseThrow();
            assertEquals(1, researcher.getSlotCount());
            assertEquals(1, researcher.getFilledSlots());
            assertEquals(0, researcher.getAvailableSlots());
        }

        @Test
        @DisplayName("Cartesian product prevention: duplicate role representations are not multiplied into 12, 10, 6")
        void testCartesianProductDuplicateEntriesAreNotMultiplied() {
            Team dupTeam = new Team();
            dupTeam.setId(903L);
            dupTeam.setName("Team-X");
            dupTeam.setLeader(leader);
            dupTeam.setMaxMembers((byte) 6);

            // Simulate 6 duplicate instances of Backend (2 slots) and 6 duplicate instances of Frontend (1 slot)
            List<TeamRoleSlot> multipliedSlots = new ArrayList<>();
            for (int i = 0; i < 6; i++) {
                multipliedSlots.add(new TeamRoleSlot("Backend Developer", 2));
                multipliedSlots.add(new TeamRoleSlot("Frontend Developer", 1));
                multipliedSlots.add(new TeamRoleSlot("Researcher", 1));
            }
            dupTeam.setRoleSlots(multipliedSlots);

            when(teamMemberRepository.findByTeamId(903L)).thenReturn(List.of());

            TeamResponse response = teamService.toTeamResponse(dupTeam);

            // Backend Developer must be exactly 2 slots (NOT 2 * 6 = 12)
            TeamRoleSlotDto backend = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Backend Developer"))
                    .findFirst().orElseThrow();
            assertEquals(2, backend.getSlotCount());
            assertEquals(2, backend.getAvailableSlots());

            // Frontend Developer must be exactly 1 slot (NOT 1 * 6 = 6)
            TeamRoleSlotDto frontend = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Frontend Developer"))
                    .findFirst().orElseThrow();
            assertEquals(1, frontend.getSlotCount());
            assertEquals(1, frontend.getAvailableSlots());

            // Researcher must be exactly 1 slot (NOT 1 * 6 = 6)
            TeamRoleSlotDto researcher = response.getRoleSlots().stream()
                    .filter(s -> s.getRoleName().equals("Researcher"))
                    .findFirst().orElseThrow();
            assertEquals(1, researcher.getSlotCount());
            assertEquals(1, researcher.getAvailableSlots());
        }

        @Test
        @DisplayName("Full team (6/6) shows zero available openings across all roles")
        void testFullTeamShowsZeroAvailableOpenings() {
            Team fullTeam = new Team();
            fullTeam.setId(700L);
            fullTeam.setName("Full Squad");
            fullTeam.setLeader(leader);
            fullTeam.setMaxMembers((byte) 2);

            TeamRoleSlot slot1 = new TeamRoleSlot("Backend Developer", 1);
            TeamRoleSlot slot2 = new TeamRoleSlot("Frontend Developer", 1);
            fullTeam.setRoleSlots(List.of(slot1, slot2));

            TeamMember m1 = new TeamMember();
            m1.setTeamId(700L);
            m1.setUserId(1L);
            m1.setRole(TeamMember.Role.LEADER);
            m1.setAssignedRole("Backend Developer");

            TeamMember m2 = new TeamMember();
            m2.setTeamId(700L);
            m2.setUserId(2L);
            m2.setRole(TeamMember.Role.MEMBER);
            m2.setAssignedRole("Frontend Developer");

            when(teamMemberRepository.findByTeamId(700L)).thenReturn(List.of(m1, m2));

            TeamResponse response = teamService.toTeamResponse(fullTeam);

            assertEquals("FULL", response.getStatus());
            assertEquals(2, response.getMemberCount());
            for (TeamRoleSlotDto dto : response.getRoleSlots()) {
                assertEquals(0, dto.getAvailableSlots());
            }
        }

        @Test
        @DisplayName("Case 5: Team has capacity but no role has capacity -> 0 role openings (do not fabricate)")
        void testTeamHasCapacityButNoRoleHasCapacity() {
            Team teamZ = new Team();
            teamZ.setId(905L);
            teamZ.setName("Team-Z");
            teamZ.setLeader(leader);
            teamZ.setMaxMembers((byte) 6);

            // Role slots configure only 2 total slots
            TeamRoleSlot slot1 = new TeamRoleSlot("Backend Developer", 1);
            TeamRoleSlot slot2 = new TeamRoleSlot("Frontend Developer", 1);
            teamZ.setRoleSlots(List.of(slot1, slot2));

            TeamMember m1 = new TeamMember();
            m1.setTeamId(905L);
            m1.setUserId(1L);
            m1.setAssignedRole("Backend Developer");

            TeamMember m2 = new TeamMember();
            m2.setTeamId(905L);
            m2.setUserId(2L);
            m2.setAssignedRole("Frontend Developer");

            when(teamMemberRepository.findByTeamId(905L)).thenReturn(List.of(m1, m2));

            TeamResponse response = teamService.toTeamResponse(teamZ);

            assertEquals(2, response.getMemberCount());
            assertEquals((byte) 6, response.getMaxMembers());
            assertEquals("OPEN", response.getStatus());

            for (TeamRoleSlotDto dto : response.getRoleSlots()) {
                assertEquals(0, dto.getAvailableSlots(), "Role " + dto.getRoleName() + " must have 0 openings");
            }
        }
    }
}

