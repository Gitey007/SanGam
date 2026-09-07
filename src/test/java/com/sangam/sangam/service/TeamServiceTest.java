package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
                teamInvitationRepository);

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
    }

    @Nested
    @DisplayName("Send Invitation Tests")
    class SendInvitationTests {

        @Test
        @DisplayName("1. Team leader can send invitation successfully")
        void testLeaderCanSendInvitation() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);
            when(teamInvitationRepository.findByTeamIdAndInvitedUserId(10L, 2L)).thenReturn(Optional.empty());

            when(teamInvitationRepository.save(any(TeamInvitation.class))).thenAnswer(invocation -> {
                TeamInvitation inv = invocation.getArgument(0);
                inv.setId(100L);
                return inv;
            });

            TeamInvitationResponse response = teamService.inviteStudent(10L, 2L, "leader@college.edu");

            assertNotNull(response);
            assertEquals(100L, response.getInvitationId());
            assertEquals(10L, response.getTeamId());
            assertEquals("Team Alpha", response.getTeamName());
            assertEquals(2L, response.getInvitedUserId());
            assertEquals("Student User", response.getInvitedUserName());
            assertEquals(1L, response.getInvitedById());
            assertEquals("Leader User", response.getInvitedByName());
            assertEquals("PENDING", response.getStatus());

            ArgumentCaptor<TeamInvitation> captor = ArgumentCaptor.forClass(TeamInvitation.class);
            verify(teamInvitationRepository).save(captor.capture());
            assertEquals(TeamInvitation.InvitationStatus.PENDING, captor.getValue().getStatus());
            assertEquals(leader, captor.getValue().getInvitedBy());
            assertEquals(student, captor.getValue().getInvitedUser());
            assertEquals(team, captor.getValue().getTeam());
        }

        @Test
        @DisplayName("2. Normal student cannot send invitation (403 Forbidden)")
        void testNormalStudentCannotSendInvitation() {
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(10L, 3L, "student@college.edu"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
            verify(teamInvitationRepository, never()).save(any());
        }

        @Test
        @DisplayName("3. Non-team-leader receives 403 Forbidden")
        void testNonTeamLeaderReceives403() {
            when(userRepository.findByEmail("other@college.edu")).thenReturn(Optional.of(otherStudent));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(10L, 2L, "other@college.edu"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("4. Cannot invite nonexistent student (404 Not Found)")
        void testCannotInviteNonexistentStudent() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(10L, 999L, "leader@college.edu"));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("5. Cannot invite to nonexistent team (404 Not Found)")
        void testCannotInviteNonexistentTeam() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(999L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(999L, 2L, "leader@college.edu"));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("6. Cannot invite existing team member (409 Conflict)")
        void testCannotInviteExistingMember() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(10L, 2L, "leader@college.edu"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("7. Cannot invite team leader to own team (400 Bad Request)")
        void testCannotInviteTeamLeader() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(1L)).thenReturn(Optional.of(leader));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(10L, 1L, "leader@college.edu"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        }

        @Test
        @DisplayName("8. Duplicate PENDING invitation rejected (409 Conflict)")
        void testDuplicatePendingInvitationRejected() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);

            TeamInvitation existingInv = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING);
            when(teamInvitationRepository.findByTeamIdAndInvitedUserId(10L, 2L)).thenReturn(Optional.of(existingInv));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(10L, 2L, "leader@college.edu"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("Re-inviting a previously REJECTED invitation updates status back to PENDING")
        void testReinvitingPreviouslyRejectedInvitation() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);

            TeamInvitation existingInv = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.REJECTED);
            existingInv.setId(105L);
            when(teamInvitationRepository.findByTeamIdAndInvitedUserId(10L, 2L)).thenReturn(Optional.of(existingInv));
            when(teamInvitationRepository.save(any(TeamInvitation.class))).thenAnswer(i -> i.getArgument(0));

            TeamInvitationResponse response = teamService.inviteStudent(10L, 2L, "leader@college.edu");

            assertNotNull(response);
            assertEquals("PENDING", response.getStatus());
            assertEquals(TeamInvitation.InvitationStatus.PENDING, existingInv.getStatus());
        }

        @Test
        @DisplayName("Team capacity respected: Cannot invite when team is full (409 Conflict)")
        void testCannotInviteWhenTeamIsFull() {
            team.setMaxMembers((byte) 2);
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(2L);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.inviteStudent(10L, 2L, "leader@college.edu"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Accept and Reject Invitation Tests")
    class AcceptAndRejectInvitationTests {

        private TeamInvitation pendingInvitation;

        @BeforeEach
        void initInvitation() {
            pendingInvitation = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING);
            pendingInvitation.setId(50L);
        }

        @Test
        @DisplayName("10, 13, 14. Student can accept own invitation -> creates membership and status becomes ACCEPTED")
        void testStudentCanAcceptOwnInvitation() {
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(50L)).thenReturn(Optional.of(pendingInvitation));
            when(teamRepository.existsById(10L)).thenReturn(true);
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);

            teamService.acceptInvitation(50L, "student@college.edu");

            assertEquals(TeamInvitation.InvitationStatus.ACCEPTED, pendingInvitation.getStatus());
            verify(teamInvitationRepository).save(pendingInvitation);

            ArgumentCaptor<TeamMember> memberCaptor = ArgumentCaptor.forClass(TeamMember.class);
            verify(teamMemberRepository).save(memberCaptor.capture());
            TeamMember savedMember = memberCaptor.getValue();
            assertEquals(10L, savedMember.getTeamId());
            assertEquals(2L, savedMember.getUserId());
            assertEquals(TeamMember.Role.MEMBER, savedMember.getRole());
            assertNotNull(savedMember.getJoinedAt());
        }

        @Test
        @DisplayName("11. Student cannot accept another student's invitation (403 Forbidden)")
        void testStudentCannotAcceptAnotherStudentsInvitation() {
            when(userRepository.findByEmail("other@college.edu")).thenReturn(Optional.of(otherStudent));
            when(teamInvitationRepository.findById(50L)).thenReturn(Optional.of(pendingInvitation));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(50L, "other@college.edu"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
            verify(teamMemberRepository, never()).save(any());
        }

        @Test
        @DisplayName("12, 15. Student can reject own invitation -> status becomes REJECTED, no membership created")
        void testStudentCanRejectOwnInvitation() {
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(50L)).thenReturn(Optional.of(pendingInvitation));

            teamService.rejectInvitation(50L, "student@college.edu");

            assertEquals(TeamInvitation.InvitationStatus.REJECTED, pendingInvitation.getStatus());
            verify(teamInvitationRepository).save(pendingInvitation);
            verify(teamMemberRepository, never()).save(any());
        }

        @Test
        @DisplayName("16. Already ACCEPTED invitation cannot be accepted or rejected again (400 Bad Request)")
        void testAlreadyAcceptedInvitationCannotBeProcessedAgain() {
            pendingInvitation.setStatus(TeamInvitation.InvitationStatus.ACCEPTED);
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(50L)).thenReturn(Optional.of(pendingInvitation));

            ResponseStatusException exAccept = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(50L, "student@college.edu"));
            assertEquals(HttpStatus.BAD_REQUEST, exAccept.getStatusCode());

            ResponseStatusException exReject = assertThrows(ResponseStatusException.class, () ->
                    teamService.rejectInvitation(50L, "student@college.edu"));
            assertEquals(HttpStatus.BAD_REQUEST, exReject.getStatusCode());
        }

        @Test
        @DisplayName("17. Team capacity respected at acceptance time: Cannot accept if team became full (409 Conflict)")
        void testCannotAcceptIfTeamFull() {
            team.setMaxMembers((byte) 2);
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            when(teamInvitationRepository.findById(50L)).thenReturn(Optional.of(pendingInvitation));
            when(teamRepository.existsById(10L)).thenReturn(true);
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(2L);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptInvitation(50L, "student@college.edu"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            verify(teamMemberRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Retrieve Invitations Tests")
    class RetrieveInvitationsTests {

        @Test
        @DisplayName("9. Student can retrieve own invitations")
        void testStudentCanRetrieveOwnInvitations() {
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            TeamInvitation inv1 = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING);
            inv1.setId(1L);
            when(teamInvitationRepository.findByInvitedUserId(2L)).thenReturn(List.of(inv1));

            List<TeamInvitationResponse> responses = teamService.getMyInvitations("student@college.edu", null);

            assertEquals(1, responses.size());
            assertEquals(1L, responses.get(0).getInvitationId());
            assertEquals("Team Alpha", responses.get(0).getTeamName());
            assertEquals("Leader User", responses.get(0).getInvitedByName());
        }

        @Test
        @DisplayName("Student can retrieve own invitations filtered by status")
        void testStudentCanRetrieveOwnInvitationsFiltered() {
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            TeamInvitation inv1 = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING);
            inv1.setId(1L);
            when(teamInvitationRepository.findByInvitedUserIdAndStatus(2L, TeamInvitation.InvitationStatus.PENDING))
                    .thenReturn(List.of(inv1));

            List<TeamInvitationResponse> responses = teamService.getMyInvitations("student@college.edu", TeamInvitation.InvitationStatus.PENDING);

            assertEquals(1, responses.size());
            assertEquals("PENDING", responses.get(0).getStatus());
        }

        @Test
        @DisplayName("Leader can retrieve team invitations; non-leader gets 403 Forbidden")
        void testLeaderCanRetrieveTeamInvitations() {
            when(userRepository.findByEmail("leader@college.edu")).thenReturn(Optional.of(leader));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            TeamInvitation inv1 = new TeamInvitation(team, student, leader, TeamInvitation.InvitationStatus.PENDING);
            inv1.setId(1L);
            when(teamInvitationRepository.findByTeamId(10L)).thenReturn(List.of(inv1));

            List<TeamInvitationResponse> responses = teamService.getTeamInvitations(10L, "leader@college.edu");
            assertEquals(1, responses.size());

            // Non-leader test
            when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(student));
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.getTeamInvitations(10L, "student@college.edu"));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("18. Existing Student → Team Join Request Flow Tests")
    class ExistingJoinRequestTests {

        @Test
        @DisplayName("Student can send join request to team")
        void testSendJoinRequest() {
            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(userRepository.findById(2L)).thenReturn(Optional.of(student));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);
            when(teamJoinRequestRepository.findByTeamIdAndUserId(10L, 2L)).thenReturn(Optional.empty());
            when(teamJoinRequestRepository.save(any(TeamJoinRequest.class))).thenAnswer(i -> {
                TeamJoinRequest r = i.getArgument(0);
                r.setId(88L);
                return r;
            });

            TeamJoinRequestResponse resp = teamService.sendJoinRequest(10L, 2L);

            assertNotNull(resp);
            assertEquals(88L, resp.getRequestId());
            assertEquals(2L, resp.getUserId());
            assertEquals("Student User", resp.getUserName());
            assertEquals("PENDING", resp.getStatus());
        }

        @Test
        @DisplayName("Leader can accept join request -> adds member and marks ACCEPTED")
        void testAcceptJoinRequest() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING);
            req.setId(77L);

            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(teamJoinRequestRepository.findById(77L)).thenReturn(Optional.of(req));
            when(teamMemberRepository.existsById(new TeamMemberId(10L, 2L))).thenReturn(false);
            when(teamMemberRepository.countByTeamId(10L)).thenReturn(1L);

            teamService.acceptJoinRequest(10L, 77L, 1L);

            assertEquals(TeamJoinRequest.RequestStatus.ACCEPTED, req.getStatus());
            verify(teamMemberRepository).save(any(TeamMember.class));
            verify(teamJoinRequestRepository).save(req);
        }

        @Test
        @DisplayName("Leader can reject join request -> marks REJECTED")
        void testRejectJoinRequest() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING);
            req.setId(77L);

            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(teamJoinRequestRepository.findById(77L)).thenReturn(Optional.of(req));

            teamService.rejectJoinRequest(10L, 77L, 1L);

            assertEquals(TeamJoinRequest.RequestStatus.REJECTED, req.getStatus());
            verify(teamJoinRequestRepository).save(req);
            verify(teamMemberRepository, never()).save(any(TeamMember.class));
        }

        @Test
        @DisplayName("Non-leader cannot accept join request (403 Forbidden)")
        void testNonLeaderCannotAcceptJoinRequest() {
            TeamJoinRequest req = new TeamJoinRequest(team, student, TeamJoinRequest.RequestStatus.PENDING);
            req.setId(77L);

            when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
            when(teamJoinRequestRepository.findById(77L)).thenReturn(Optional.of(req));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                    teamService.acceptJoinRequest(10L, 77L, 3L));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }
    }
}
