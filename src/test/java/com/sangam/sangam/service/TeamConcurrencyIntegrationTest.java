package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.TeamResponse;
import com.sangam.sangam.dto.TeamRoleSlotDto;
import com.sangam.sangam.entity.Team;
import com.sangam.sangam.entity.TeamInvitation;
import com.sangam.sangam.entity.TeamJoinRequest;
import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.TeamRoleSlot;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.SkillRepository;
import com.sangam.sangam.repository.TeamInvitationRepository;
import com.sangam.sangam.repository.TeamJoinRequestRepository;
import com.sangam.sangam.repository.TeamMemberRepository;
import com.sangam.sangam.repository.TeamRepository;
import com.sangam.sangam.repository.UserRepository;

@SpringBootTest
class TeamConcurrencyIntegrationTest {

    @Autowired
    private TeamService teamService;

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

    @Autowired
    private com.sangam.sangam.repository.NotificationRepository notificationRepository;

    @BeforeEach
    void cleanDatabase() {
        notificationRepository.deleteAll();
        teamInvitationRepository.deleteAll();
        teamJoinRequestRepository.deleteAll();
        teamMemberRepository.deleteAll();
        teamRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();
    }

    private User createUser(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash("hashed_pass");
        user.setCollege("IIT Bombay");
        user.setBranch("CSE");
        user.setYear((byte) 3);
        user.setLookingFor(Set.of("Hackathons"));
        return userRepository.save(user);
    }

    @Test
    @DisplayName("5. ROLE RACE: Two concurrent acceptance attempts for 1 Backend Developer slot -> exactly 1 succeeds, 1 gets 409 Conflict, filled = 1/1")
    void testConcurrentRoleSlotRace() throws Exception {
        // Setup: Team with 1 Backend Developer slot and 1 Frontend Developer slot
        User leader = createUser("Leader Alice", "alice@college.edu");
        User rahul = createUser("Rahul Sharma", "rahul@college.edu");
        User priya = createUser("Priya Patel", "priya@college.edu");

        Team team = new Team();
        team.setName("Concurrency Masters");
        team.setDescription("Testing pessimistic lock");
        team.setLeader(leader);
        team.setMaxMembers((byte) 5);
        team = teamRepository.save(team);

        // Define 1 Backend Developer slot (slotCount = 1)
        TeamRoleSlot slot = new TeamRoleSlot("Backend Developer", 1);
        team.getRoleSlots().add(slot);
        team = teamRepository.save(team);

        // Leader is added as a member with "Team Lead" role (doesn't consume Backend Developer slot)
        TeamMember leaderMember = new TeamMember();
        leaderMember.setTeamId(team.getId());
        leaderMember.setUserId(leader.getId());
        leaderMember.setAssignedRole("Team Lead");
        teamMemberRepository.save(leaderMember);

        // Invitation 1: Rahul invited as Backend Developer (PENDING)
        TeamInvitation invRahul = new TeamInvitation(team, rahul, leader, TeamInvitation.InvitationStatus.PENDING, "Backend Developer", null);
        invRahul = teamInvitationRepository.save(invRahul);

        // Join Request 2: Priya requested Backend Developer (PENDING)
        TeamJoinRequest reqPriya = new TeamJoinRequest(team, priya, TeamJoinRequest.RequestStatus.PENDING, "Backend Developer", null);
        reqPriya = teamJoinRequestRepository.save(reqPriya);

        final Long teamId = team.getId();
        final Long rahulInvId = invRahul.getId();
        final Long priyaReqId = reqPriya.getId();
        final Long leaderId = leader.getId();

        // Prepare concurrency with CountDownLatch
        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<Throwable> errors = new ArrayList<>();

        // Task 1: Rahul accepts invitation
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.acceptInvitation(rahulInvId, "rahul@college.edu", null, null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Task 2: Leader accepts Priya's join request
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.acceptJoinRequest(teamId, priyaReqId, leaderId, null, null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Trigger both threads simultaneously
        startLatch.countDown();
        boolean finished = doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "Concurrent operations timed out");
        assertTrue(errors.isEmpty(), "Unexpected errors: " + errors);

        // Verification: Exactly 1 must succeed and 1 must fail with 409 Conflict
        assertEquals(1, successCount.get(), "Expected exactly 1 acceptance to succeed");
        assertEquals(1, conflictCount.get(), "Expected exactly 1 acceptance to fail with HTTP 409 Conflict");

        // Verify database state: Backend Developer must be 1 / 1 (NEVER 2 / 1)
        TeamResponse updatedTeam = teamService.getTeamById(teamId);
        TeamRoleSlotDto beSlot = updatedTeam.getRoleSlots().stream()
                .filter(s -> "Backend Developer".equals(s.getRoleName()))
                .findFirst()
                .orElseThrow();

        assertEquals(1, beSlot.getFilledSlots(), "Backend Developer filled slots must be exactly 1");
        assertEquals(0, beSlot.getAvailableSlots(), "Backend Developer available slots must be 0");
        assertEquals(1, beSlot.getSlotCount(), "Backend Developer total slotCount must be 1");

        // Total team members = leader (1) + accepted member (1) = 2
        assertEquals(2, updatedTeam.getMemberCount());
    }

    @Test
    @DisplayName("6. TEAM CAPACITY RACE: maxMembers = 5, 4 existing members, 2 simultaneous acceptance attempts -> exactly 1 succeeds, team never has 6 members")
    void testConcurrentTeamCapacityRace() throws Exception {
        // Setup: Team with maxMembers = 5 and 4 existing members
        User leader = createUser("Cap Leader", "capleader@college.edu");
        User mem2 = createUser("Member 2", "mem2@college.edu");
        User mem3 = createUser("Member 3", "mem3@college.edu");
        User mem4 = createUser("Member 4", "mem4@college.edu");

        User candidateA = createUser("Candidate A", "candA@college.edu");
        User candidateB = createUser("Candidate B", "candB@college.edu");

        Team team = new Team();
        team.setName("Capacity Race Team");
        team.setDescription("Testing max capacity lock");
        team.setLeader(leader);
        team.setMaxMembers((byte) 5);
        team = teamRepository.save(team);

        // 2 slots for Frontend, 2 slots for UI/UX Designer (so role slots are not the bottleneck)
        team.getRoleSlots().add(new TeamRoleSlot("Frontend Developer", 2));
        team.getRoleSlots().add(new TeamRoleSlot("UI/UX Designer", 2));
        team = teamRepository.save(team);

        // 4 existing members: Leader + 3 members
        TeamMember m1 = new TeamMember();
        m1.setTeamId(team.getId());
        m1.setUserId(leader.getId());
        m1.setAssignedRole("Lead");
        teamMemberRepository.save(m1);

        TeamMember m2 = new TeamMember();
        m2.setTeamId(team.getId());
        m2.setUserId(mem2.getId());
        m2.setAssignedRole("Frontend Developer");
        teamMemberRepository.save(m2);

        TeamMember m3 = new TeamMember();
        m3.setTeamId(team.getId());
        m3.setUserId(mem3.getId());
        m3.setAssignedRole("UI/UX Designer");
        teamMemberRepository.save(m3);

        TeamMember m4 = new TeamMember();
        m4.setTeamId(team.getId());
        m4.setUserId(mem4.getId());
        m4.setAssignedRole("General");
        teamMemberRepository.save(m4);

        // 2 pending invitations for different roles with capacity
        TeamInvitation invA = new TeamInvitation(team, candidateA, leader, TeamInvitation.InvitationStatus.PENDING, "Frontend Developer", null);
        invA = teamInvitationRepository.save(invA);

        TeamInvitation invB = new TeamInvitation(team, candidateB, leader, TeamInvitation.InvitationStatus.PENDING, "UI/UX Designer", null);
        invB = teamInvitationRepository.save(invB);

        final Long invAId = invA.getId();
        final Long invBId = invB.getId();
        final Long teamId = team.getId();

        // 2 concurrent threads attempting to accept simultaneously
        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<Throwable> errors = new ArrayList<>();

        // Thread 1: Candidate A accepts
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.acceptInvitation(invAId, "candA@college.edu", null, null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2: Candidate B accepts
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.acceptInvitation(invBId, "candB@college.edu", null, null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Trigger both threads simultaneously
        startLatch.countDown();
        boolean finished = doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "Concurrent operations timed out");
        assertTrue(errors.isEmpty(), "Unexpected errors: " + errors);

        // Verification: Exactly 1 must succeed and 1 must fail with 409 Conflict ("Team is full")
        assertEquals(1, successCount.get(), "Expected exactly 1 acceptance to succeed for the final spot");
        assertEquals(1, conflictCount.get(), "Expected exactly 1 acceptance to fail with HTTP 409 Conflict");

        // Verify final member count is exactly 5 (NEVER 6)
        List<TeamMember> finalMembers = teamMemberRepository.findByTeamId(teamId);
        assertEquals(5, finalMembers.size(), "Team member count must be exactly 5, never 6");
    }

    @Test
    @DisplayName("7. DUPLICATE JOIN REQUEST RACE: Concurrent sendJoinRequest calls for same (team, user) -> exactly 1 succeeds, 1 receives 409 Conflict, DB has exactly 1 row")
    void testConcurrentDuplicateJoinRequestRace() throws Exception {
        // Setup: Team and applicant user
        User leader = createUser("Join Leader", "joinleader@college.edu");
        User applicant = createUser("Applicant Student", "applicant@college.edu");

        Team team = new Team();
        team.setName("Join Request Race Team");
        team.setDescription("Testing concurrent duplicate join request prevention");
        team.setLeader(leader);
        team.setMaxMembers((byte) 4);
        team = teamRepository.save(team);

        final Long teamId = team.getId();
        final Long applicantId = applicant.getId();

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<Throwable> errors = new ArrayList<>();

        // Thread 1: Send join request
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.sendJoinRequest(teamId, applicantId, "Developer", null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2: Send simultaneous duplicate join request
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.sendJoinRequest(teamId, applicantId, "Developer", null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Release threads simultaneously
        startLatch.countDown();
        boolean finished = doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "Concurrent operations timed out");
        assertTrue(errors.isEmpty(), "Unexpected errors: " + errors);

        // Verification: Exactly 1 must succeed and 1 must receive HTTP 409 Conflict
        assertEquals(1, successCount.get(), "Expected exactly 1 join request submission to succeed");
        assertEquals(1, conflictCount.get(), "Expected exactly 1 duplicate request to fail with HTTP 409 Conflict");

        // Verify database: Exactly 1 row in team_join_requests for this user and team
        List<TeamJoinRequest> requests = teamJoinRequestRepository.findByUserId(applicantId);
        assertEquals(1, requests.size(), "Database must contain exactly 1 join request row for this user and team");
        assertEquals(teamId, requests.get(0).getTeam().getId());
        assertEquals(TeamJoinRequest.RequestStatus.PENDING, requests.get(0).getStatus());
    }

    @Test
    @DisplayName("8. DUPLICATE INVITATION RACE: Concurrent inviteStudent calls for same (team, invitedUser) -> exactly 1 succeeds, 1 receives 409 Conflict, DB has exactly 1 row")
    void testConcurrentDuplicateInvitationRace() throws Exception {
        // Setup: Team and target student
        User leader = createUser("Invite Leader", "inviteleader@college.edu");
        User invitee = createUser("Invited Student", "invitee@college.edu");

        Team team = new Team();
        team.setName("Invitation Race Team");
        team.setDescription("Testing concurrent duplicate invitation prevention");
        team.setLeader(leader);
        team.setMaxMembers((byte) 4);
        team = teamRepository.save(team);

        final Long teamId = team.getId();
        final Long inviteeId = invitee.getId();
        final String leaderEmail = leader.getEmail();

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<Throwable> errors = new ArrayList<>();

        // Thread 1: Send invitation
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.inviteStudent(teamId, inviteeId, leaderEmail, "Designer", null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2: Send simultaneous duplicate invitation
        executor.submit(() -> {
            try {
                startLatch.await();
                teamService.inviteStudent(teamId, inviteeId, leaderEmail, "Designer", null);
                successCount.incrementAndGet();
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                } else {
                    synchronized (errors) { errors.add(e); }
                }
            } catch (Throwable t) {
                synchronized (errors) { errors.add(t); }
            } finally {
                doneLatch.countDown();
            }
        });

        // Release threads simultaneously
        startLatch.countDown();
        boolean finished = doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "Concurrent operations timed out");
        assertTrue(errors.isEmpty(), "Unexpected errors: " + errors);

        // Verification: Exactly 1 must succeed and 1 must receive HTTP 409 Conflict
        assertEquals(1, successCount.get(), "Expected exactly 1 invitation dispatch to succeed");
        assertEquals(1, conflictCount.get(), "Expected exactly 1 duplicate invitation to fail with HTTP 409 Conflict");

        // Verify database: Exactly 1 row in team_invitations for this user and team
        List<TeamInvitation> invitations = teamInvitationRepository.findByInvitedUserId(inviteeId);
        assertEquals(1, invitations.size(), "Database must contain exactly 1 invitation row for this user and team");
        assertEquals(teamId, invitations.get(0).getTeam().getId());
        assertEquals(TeamInvitation.InvitationStatus.PENDING, invitations.get(0).getStatus());
    }
}
