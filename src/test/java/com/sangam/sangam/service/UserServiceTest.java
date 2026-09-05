package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository);
    }

    private User createUser(Long id, String name, String email, String college, String branch, Byte year, String... skillNames) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        user.setCollege(college);
        user.setBranch(branch);
        user.setYear(year);
        user.setBio("Sample bio for " + name);

        Set<Skill> skills = new HashSet<>();
        for (String skillName : skillNames) {
            Skill skill = new Skill();
            skill.setName(skillName);
            skills.add(skill);
        }
        user.setSkills(skills);
        return user;
    }

    // 1. Discover users with skills -> SUCCESS
    @Test
    void testGetUsers_All_Success() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2, "Java");
        User user1 = createUser(2L, "Alice", "alice@college.edu", "IIT Delhi", "CS", (byte) 2, "Java", "Spring Boot");
        User user2 = createUser(3L, "Bob", "bob@other.edu", "BITS Pilani", "ECE", (byte) 3, "Python");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findAllWithSkills()).thenReturn(List.of(user1, user2));

        List<UserProfileResponse> responses = userService.getUsers("ALL", null, null, "me@college.edu");

        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("Alice", responses.get(0).getName());
        assertEquals(Set.of("Java", "Spring Boot"), responses.get(0).getSkills());
        assertEquals("Bob", responses.get(1).getName());
        assertEquals(Set.of("Python"), responses.get(1).getSkills());
    }

    // 2. Discover user with multiple skills -> all expected skills returned
    @Test
    void testGetUsers_MultipleSkillsReturned() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User user = createUser(2L, "Dev Guru", "guru@college.edu", "IIT Delhi", "CS", (byte) 4, "Java", "Spring Boot", "Docker", "Kubernetes", "React");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findAllWithSkills()).thenReturn(List.of(user));

        List<UserProfileResponse> responses = userService.getUsers("ALL", null, null, "me@college.edu");

        assertEquals(1, responses.size());
        Set<String> skills = responses.get(0).getSkills();
        assertEquals(5, skills.size());
        assertTrue(skills.containsAll(Set.of("Java", "Spring Boot", "Docker", "Kubernetes", "React")));
    }

    // 3. Discover with college filter (MY_COLLEGE) -> works
    @Test
    void testGetUsers_MyCollege_WithoutYear_Works() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User peer = createUser(2L, "Campus Peer", "peer@college.edu", "IIT Delhi", "ME", (byte) 1, "CAD");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByCollege("IIT Delhi")).thenReturn(List.of(peer));

        List<UserProfileResponse> responses = userService.getUsers("MY_COLLEGE", null, null, "me@college.edu");

        assertEquals(1, responses.size());
        assertEquals("Campus Peer", responses.get(0).getName());
        assertEquals("IIT Delhi", responses.get(0).getCollege());
    }

    @Test
    void testGetUsers_MyCollege_WithYear_Works() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User classmate = createUser(2L, "Batchmate", "batch@college.edu", "IIT Delhi", "CS", (byte) 2, "Java");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByCollegeAndYear("IIT Delhi", (byte) 2)).thenReturn(List.of(classmate));

        List<UserProfileResponse> responses = userService.getUsers("MY_COLLEGE", 2, null, "me@college.edu");

        assertEquals(1, responses.size());
        assertEquals("Batchmate", responses.get(0).getName());
        assertEquals(Byte.valueOf((byte) 2), responses.get(0).getYear());
    }

    // 4. Discover with excludeCollege filter (INTER_COLLEGE) -> works
    @Test
    void testGetUsers_InterCollege_WithoutYear_Works() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User externalUser = createUser(3L, "External Student", "ext@other.edu", "NIT Trichy", "EE", (byte) 3, "MATLAB");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByCollegeNot("IIT Delhi")).thenReturn(List.of(externalUser));

        List<UserProfileResponse> responses = userService.getUsers("INTER_COLLEGE", null, null, "me@college.edu");

        assertEquals(1, responses.size());
        assertEquals("NIT Trichy", responses.get(0).getCollege());
    }

    @Test
    void testGetUsers_InterCollege_WithYear_Works() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User externalUser = createUser(3L, "External Senior", "ext@other.edu", "NIT Trichy", "EE", (byte) 4, "C++");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByCollegeNotAndYear("IIT Delhi", (byte) 4)).thenReturn(List.of(externalUser));

        List<UserProfileResponse> responses = userService.getUsers("INTER_COLLEGE", 4, null, "me@college.edu");

        assertEquals(1, responses.size());
        assertEquals("External Senior", responses.get(0).getName());
    }

    // 5. Discover with year filter -> works
    @Test
    void testGetUsers_All_WithYear_Works() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User freshman = createUser(4L, "Freshman", "fresh@college.edu", "IIT Bombay", "CS", (byte) 1, "Python");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findByYear((byte) 1)).thenReturn(List.of(freshman));

        List<UserProfileResponse> responses = userService.getUsers("ALL", 1, null, "me@college.edu");

        assertEquals(1, responses.size());
        assertEquals("Freshman", responses.get(0).getName());
        assertEquals(Byte.valueOf((byte) 1), responses.get(0).getYear());
    }

    // 6. Discover with skill filter -> works and returns full skill set
    @Test
    void testGetUsers_WithSkillFilter_ReturnsAllSkillsOfMatchedUser() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User userWithJava = createUser(2L, "Java Dev", "java@college.edu", "IIT Delhi", "CS", (byte) 3, "Java", "Spring Boot", "React", "PostgreSQL");
        User userWithoutJava = createUser(3L, "Python Dev", "python@college.edu", "IIT Delhi", "CS", (byte) 3, "Python", "Django");

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findAllWithSkills()).thenReturn(List.of(userWithJava, userWithoutJava));

        List<UserProfileResponse> responses = userService.getUsers("ALL", null, "Java", "me@college.edu");

        assertEquals(1, responses.size());
        UserProfileResponse matched = responses.get(0);
        assertEquals("Java Dev", matched.getName());
        // Must contain all 4 skills belonging to the user, not just "Java"
        assertEquals(4, matched.getSkills().size());
        assertTrue(matched.getSkills().containsAll(Set.of("Java", "Spring Boot", "React", "PostgreSQL")));
    }

    // 7. User with no skills -> works smoothly without exception
    @Test
    void testGetUsers_UserWithNoSkills_Works() {
        User currentUser = createUser(1L, "Current User", "me@college.edu", "IIT Delhi", "CS", (byte) 2);
        User newUser = createUser(5L, "New Student", "new@college.edu", "IIT Delhi", "CS", (byte) 1);
        newUser.setSkills(null); // or empty

        when(userRepository.findByEmail("me@college.edu")).thenReturn(Optional.of(currentUser));
        when(userRepository.findAllWithSkills()).thenReturn(List.of(newUser));

        List<UserProfileResponse> responses = userService.getUsers("ALL", null, null, "me@college.edu");

        assertEquals(1, responses.size());
        assertNotNull(responses.get(0).getSkills());
        assertTrue(responses.get(0).getSkills().isEmpty());
    }

    // 8. getUserProfile and updateUserProfile
    @Test
    void testGetUserProfile_Success() {
        User user = createUser(10L, "Profile User", "user@college.edu", "IIT Madras", "AI", (byte) 3, "TensorFlow", "Python");
        when(userRepository.findWithSkillsById(10L)).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getUserProfile(10L);

        assertNotNull(response);
        assertEquals("Profile User", response.getName());
        assertEquals(Set.of("TensorFlow", "Python"), response.getSkills());
    }

    @Test
    void testUpdateUserProfile_Success() {
        User user = createUser(10L, "Old Name", "user@college.edu", "IIT Madras", "AI", (byte) 3, "Python");
        when(userRepository.findWithSkillsById(10L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("New Name");
        request.setCollege("IIT Bombay");
        request.setBranch("Data Science");
        request.setYear((byte) 4);
        request.setBio("Updated bio");

        UserProfileResponse response = userService.updateUserProfile(10L, request);

        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals("IIT Bombay", response.getCollege());
        assertEquals("Data Science", response.getBranch());
        assertEquals(Byte.valueOf((byte) 4), response.getYear());
        verify(userRepository).save(user);
    }

    // 9. getUsersBySkill
    @Test
    void testGetUsersBySkill_Success() {
        User user = createUser(20L, "Skill Specialist", "spec@college.edu", "BITS", "CS", (byte) 3, "Rust", "Go");
        when(userRepository.findUsersBySkillId(1L)).thenReturn(List.of(user));

        List<UserProfileResponse> responses = userService.getUsersBySkill(1L);

        assertEquals(1, responses.size());
        assertEquals("Skill Specialist", responses.get(0).getName());
        assertEquals(Set.of("Rust", "Go"), responses.get(0).getSkills());
    }
}
