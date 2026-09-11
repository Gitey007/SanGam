package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.sangam.sangam.dto.AchievementDto;
import com.sangam.sangam.dto.ProjectDto;
import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.SkillRepository;
import com.sangam.sangam.repository.TeamInvitationRepository;
import com.sangam.sangam.repository.TeamJoinRequestRepository;
import com.sangam.sangam.repository.TeamMemberRepository;
import com.sangam.sangam.repository.TeamRepository;
import com.sangam.sangam.repository.UserAchievementRepository;
import com.sangam.sangam.repository.UserProjectRepository;
import com.sangam.sangam.repository.UserRepository;

@SpringBootTest
class UserProfileIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserProjectRepository userProjectRepository;

    @Autowired
    private TeamRepository teamRepository;

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
        userAchievementRepository.deleteAll();
        userProjectRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();
    }

    @Test
    @DisplayName("Persist and update user profile with long bio (>500 chars), social URLs, preferences, achievements, and projects")
    void testProfileUpdateAndPersistence_WithLongBioAndAllFields() {
        // 1. Create and save base user
        User user = new User();
        user.setName("Priya Sharma");
        user.setEmail("priya.sharma@college.edu");
        user.setPasswordHash("hashed_password_123");
        user.setCollege("IIT Bombay");
        user.setBranch("Computer Science");
        user.setYear((byte) 3);
        user.setBio("Initial short bio");
        User savedUser = userRepository.save(user);
        assertNotNull(savedUser.getId());

        // 2. Add skills
        userService.addSkillToUser(savedUser.getId(), "Java", "priya.sharma@college.edu");
        userService.addSkillToUser(savedUser.getId(), "Spring Boot", "priya.sharma@college.edu");
        userService.addSkillToUser(savedUser.getId(), "React", "priya.sharma@college.edu");

        // 3. Add achievement
        AchievementDto achDto = new AchievementDto(
                null,
                "Smart India Hackathon 2025 Winner",
                "Built an AI-powered smart agriculture advisory system using satellite imagery and IoT sensor streams.",
                "Hackathon",
                "December 2025",
                "https://sih.gov.in/certificate/12345"
        );
        AchievementDto createdAch = userService.addAchievement(savedUser.getId(), achDto, "priya.sharma@college.edu");
        assertNotNull(createdAch.getId());

        // 4. Add project
        ProjectDto projDto = new ProjectDto(
                null,
                "SanGam Platform",
                "Peer discovery and hackathon team builder platform for college students across universities.",
                "Java 21, Spring Boot 3, React, Tailwind CSS, MySQL",
                "https://github.com/Gitey007/SanGam",
                "https://sangam.dev"
        );
        ProjectDto createdProj = userService.addProject(savedUser.getId(), projDto, "priya.sharma@college.edu");
        assertNotNull(createdProj.getId());

        // 5. Update profile with lengthy bio (>500 characters) and all URLs + Looking For preferences
        String extensiveBio = "Hello! I am Priya, a pre-final year undergraduate passionate about full-stack engineering and distributed systems. "
                + "I love architecting scalable backend APIs with Spring Boot and building intuitive user interfaces with modern React. "
                + "Over the past 2 years, I have won 3 national-level hackathons including SIH 2025 and built production-ready applications serving thousands of students. "
                + "Currently exploring Kubernetes, microservice patterns, and system design. "
                + "Always eager to collaborate on high-impact open-source projects, hackathons, and research ideas!";

        assertTrue(extensiveBio.length() > 500, "Bio should be longer than 500 characters to verify TEXT column support");

        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setName("Priya Sharma");
        updateRequest.setCollege("IIT Bombay");
        updateRequest.setBranch("Computer Science & Engineering");
        updateRequest.setYear((byte) 4);
        updateRequest.setBio(extensiveBio);
        updateRequest.setGithubUrl("https://github.com/priyasharma");
        updateRequest.setLinkedinUrl("https://linkedin.com/in/priyasharma");
        updateRequest.setPortfolioUrl("https://priyasharma.me");
        updateRequest.setLeetcodeUrl("https://leetcode.com/u/priyasharma");
        updateRequest.setOtherUrl("https://twitter.com/priyasharma");
        updateRequest.setLookingFor(Set.of("Hackathon Teammates", "Project Collaboration", "Open Source"));

        UserProfileResponse updatedProfile = userService.updateUserProfile(savedUser.getId(), updateRequest, "priya.sharma@college.edu");

        // 6. Verify updated profile response
        assertNotNull(updatedProfile);
        assertEquals("Priya Sharma", updatedProfile.getName());
        assertEquals("IIT Bombay", updatedProfile.getCollege());
        assertEquals("Computer Science & Engineering", updatedProfile.getBranch());
        assertEquals(Byte.valueOf((byte) 4), updatedProfile.getYear());
        assertEquals(extensiveBio, updatedProfile.getBio());
        assertEquals("https://github.com/priyasharma", updatedProfile.getGithubUrl());
        assertEquals("https://linkedin.com/in/priyasharma", updatedProfile.getLinkedinUrl());
        assertEquals("https://priyasharma.me", updatedProfile.getPortfolioUrl());
        assertEquals("https://leetcode.com/u/priyasharma", updatedProfile.getLeetcodeUrl());
        assertEquals("https://twitter.com/priyasharma", updatedProfile.getOtherUrl());
        assertEquals(3, updatedProfile.getLookingFor().size());
        assertTrue(updatedProfile.getLookingFor().contains("Hackathon Teammates"));
        assertTrue(updatedProfile.getLookingFor().contains("Project Collaboration"));
        assertTrue(updatedProfile.getLookingFor().contains("Open Source"));

        // 7. Verify full profile reload from database
        UserProfileResponse reloaded = userService.getUserProfile(savedUser.getId());
        assertNotNull(reloaded);
        assertEquals(extensiveBio, reloaded.getBio());
        assertEquals(3, reloaded.getSkills().size());
        assertTrue(reloaded.getSkills().contains("Spring Boot"));
        assertEquals(1, reloaded.getAchievements().size());
        assertEquals("Smart India Hackathon 2025 Winner", reloaded.getAchievements().get(0).getTitle());
        assertEquals(1, reloaded.getProjects().size());
        assertEquals("SanGam Platform", reloaded.getProjects().get(0).getTitle());
    }

    @Test
    @DisplayName("Multiple skills + multiple lookingFor preferences load cleanly without Cartesian duplication or data inflation")
    void testUserMultipleSkillsAndLookingForPreferencesDoNotDuplicateOrCartesianExplode() {
        // 1. Create a user with multiple lookingFor preferences
        User user = new User();
        user.setName("Dev Cartesian");
        user.setEmail("cartesian.dev@college.edu");
        user.setPasswordHash("hashed_pass");
        user.setCollege("IIT Delhi");
        user.setBranch("EE");
        user.setYear((byte) 2);
        user.setLookingFor(Set.of("Hackathon Teammates", "Open Source", "Research Collaborators", "Startup Co-founders"));
        User savedUser = userRepository.save(user);

        // 2. Add 5 distinct skills
        userService.addSkillToUser(savedUser.getId(), "Java", "cartesian.dev@college.edu");
        userService.addSkillToUser(savedUser.getId(), "Spring Boot", "cartesian.dev@college.edu");
        userService.addSkillToUser(savedUser.getId(), "PostgreSQL", "cartesian.dev@college.edu");
        userService.addSkillToUser(savedUser.getId(), "Docker", "cartesian.dev@college.edu");
        userService.addSkillToUser(savedUser.getId(), "Kubernetes", "cartesian.dev@college.edu");

        // 3. Verify single profile fetch (findWithSkillsById)
        UserProfileResponse profile = userService.getUserProfile(savedUser.getId());
        assertNotNull(profile);
        assertEquals(5, profile.getSkills().size(), "Skills count must be exactly 5 without Cartesian multiplication");
        assertEquals(4, profile.getLookingFor().size(), "LookingFor count must be exactly 4 without Cartesian multiplication");
        assertTrue(profile.getSkills().containsAll(Set.of("Java", "Spring Boot", "PostgreSQL", "Docker", "Kubernetes")));
        assertTrue(profile.getLookingFor().containsAll(Set.of("Hackathon Teammates", "Open Source", "Research Collaborators", "Startup Co-founders")));

        // 4. Verify bulk users list fetch (findAllWithSkills)
        var allUsers = userService.getAllUsers();
        UserProfileResponse listedUser = allUsers.stream()
                .filter(u -> u.getId().equals(savedUser.getId()))
                .findFirst().orElseThrow();
        assertEquals(5, listedUser.getSkills().size(), "Listed user skills count must be exactly 5");
        assertEquals(4, listedUser.getLookingFor().size(), "Listed user lookingFor count must be exactly 4");
    }
}
