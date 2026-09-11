package com.sangam.sangam.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.AchievementDto;
import com.sangam.sangam.dto.ProjectDto;
import com.sangam.sangam.dto.UpdateProfileRequest;
import com.sangam.sangam.dto.UserProfileResponse;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.entity.UserAchievement;
import com.sangam.sangam.entity.UserProject;
import com.sangam.sangam.repository.SkillRepository;
import com.sangam.sangam.repository.TeamInvitationRepository;
import com.sangam.sangam.repository.TeamJoinRequestRepository;
import com.sangam.sangam.repository.TeamMemberRepository;
import com.sangam.sangam.repository.TeamRepository;
import com.sangam.sangam.repository.UserAchievementRepository;
import com.sangam.sangam.repository.UserProjectRepository;
import com.sangam.sangam.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserProjectRepository userProjectRepository;
    private final EmailOtpService emailOtpService;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final com.sangam.sangam.repository.NotificationRepository notificationRepository;

    @Autowired
    public UserService(
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserAchievementRepository userAchievementRepository,
            UserProjectRepository userProjectRepository,
            @Autowired(required = false) EmailOtpService emailOtpService,
            @Autowired(required = false) TeamRepository teamRepository,
            @Autowired(required = false) TeamMemberRepository teamMemberRepository,
            @Autowired(required = false) TeamJoinRequestRepository teamJoinRequestRepository,
            @Autowired(required = false) TeamInvitationRepository teamInvitationRepository,
            @Autowired(required = false) com.sangam.sangam.repository.NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.userProjectRepository = userProjectRepository;
        this.emailOtpService = emailOtpService;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamJoinRequestRepository = teamJoinRequestRepository;
        this.teamInvitationRepository = teamInvitationRepository;
        this.notificationRepository = notificationRepository;
    }

    public UserService(
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserAchievementRepository userAchievementRepository,
            UserProjectRepository userProjectRepository,
            EmailOtpService emailOtpService,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            TeamJoinRequestRepository teamJoinRequestRepository,
            TeamInvitationRepository teamInvitationRepository) {
        this(userRepository, skillRepository, userAchievementRepository, userProjectRepository, emailOtpService, teamRepository, teamMemberRepository, teamJoinRequestRepository, teamInvitationRepository, null);
    }

    public UserService(
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserAchievementRepository userAchievementRepository,
            UserProjectRepository userProjectRepository) {
        this(userRepository, skillRepository, userAchievementRepository, userProjectRepository, null, null, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAllWithSkills()
                .stream()
                .map(this::mapToUserProfileResponseSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getUsers(
            String scope,
            Integer year,
            String skill,
            String email) {

        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        User currentUser = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String currentCollege = currentUser.getCollege();
        Byte byteYear = year != null ? year.byteValue() : null;

        List<User> users;

        if ("MY_COLLEGE".equalsIgnoreCase(scope)) {
            if (byteYear != null) {
                users = userRepository.findByCollegeAndYear(currentCollege, byteYear);
            } else {
                users = userRepository.findByCollege(currentCollege);
            }
        } else if ("INTER_COLLEGE".equalsIgnoreCase(scope)) {
            if (byteYear != null) {
                users = userRepository.findByCollegeNotAndYear(currentCollege, byteYear);
            } else {
                users = userRepository.findByCollegeNot(currentCollege);
            }
        } else {
            if (byteYear != null) {
                users = userRepository.findByYear(byteYear);
            } else {
                users = userRepository.findAllWithSkills();
            }
        }

        if (skill != null && !skill.isBlank()) {
            String trimmedSkill = skill.trim();
            users = users.stream()
                    .filter(user -> user.getSkills() != null && user.getSkills().stream()
                            .anyMatch(s -> s.getName() != null && s.getName().equalsIgnoreCase(trimmedSkill)))
                    .toList();
        }

        return users.stream()
                .map(this::mapToUserProfileResponseSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findWithSkillsById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return mapToUserProfileResponseFull(user);
    }

    @Transactional
    public UserProfileResponse updateUserProfile(
            Long userId,
            UpdateProfileRequest request,
            String authenticatedEmail) {

        User user = userRepository.findWithSkillsById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateUserOwnership(user, authenticatedEmail);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getCollege() != null && !request.getCollege().isBlank()) {
            user.setCollege(request.getCollege().trim());
        }
        if (request.getBranch() != null && !request.getBranch().isBlank()) {
            user.setBranch(request.getBranch().trim());
        }
        if (request.getYear() != null) {
            user.setYear(request.getYear());
        }
        user.setBio(request.getBio());

        user.setGithubUrl(request.getGithubUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());
        user.setPortfolioUrl(request.getPortfolioUrl());
        user.setLeetcodeUrl(request.getLeetcodeUrl());
        user.setOtherUrl(request.getOtherUrl());

        if (request.getLookingFor() != null) {
            user.setLookingFor(new HashSet<>(request.getLookingFor()));
        }

        userRepository.save(user);

        return mapToUserProfileResponseFull(user);
    }

    // Overload for backward compatibility with existing tests
    @Transactional
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        return updateUserProfile(userId, request, null);
    }

    @Transactional
    public UserProfileResponse addSkillToUser(Long userId, String skillName, String authenticatedEmail) {
        if (skillName == null || skillName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skill name cannot be empty");
        }

        User user = userRepository.findWithSkillsById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateUserOwnership(user, authenticatedEmail);

        String trimmed = skillName.trim();
        Skill skill = skillRepository.findByNameIgnoreCase(trimmed)
                .orElseGet(() -> {
                    Skill newSkill = new Skill();
                    newSkill.setName(trimmed);
                    return skillRepository.save(newSkill);
                });

        user.getSkills().add(skill);
        userRepository.save(user);

        return mapToUserProfileResponseFull(user);
    }

    @Transactional
    public UserProfileResponse removeSkillFromUser(Long userId, String skillName, String authenticatedEmail) {
        if (skillName == null || skillName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skill name cannot be empty");
        }

        User user = userRepository.findWithSkillsById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateUserOwnership(user, authenticatedEmail);

        String trimmed = skillName.trim();
        user.getSkills().removeIf(s -> s.getName() != null && s.getName().equalsIgnoreCase(trimmed));
        userRepository.save(user);

        return mapToUserProfileResponseFull(user);
    }

    @Transactional
    public AchievementDto addAchievement(Long userId, AchievementDto dto, String authenticatedEmail) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Achievement title is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateUserOwnership(user, authenticatedEmail);

        UserAchievement achievement = new UserAchievement(
                user,
                dto.getTitle().trim(),
                dto.getDescription(),
                dto.getCategory(),
                dto.getAchievementDate(),
                dto.getVerificationUrl()
        );

        UserAchievement saved = userAchievementRepository.save(achievement);
        return mapToAchievementDto(saved);
    }

    @Transactional
    public AchievementDto updateAchievement(Long userId, Long achievementId, AchievementDto dto, String authenticatedEmail) {
        UserAchievement achievement = userAchievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Achievement not found"));

        if (!achievement.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Achievement does not belong to user");
        }

        validateUserOwnership(achievement.getUser(), authenticatedEmail);

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            achievement.setTitle(dto.getTitle().trim());
        }
        achievement.setDescription(dto.getDescription());
        achievement.setCategory(dto.getCategory());
        achievement.setAchievementDate(dto.getAchievementDate());
        achievement.setVerificationUrl(dto.getVerificationUrl());

        UserAchievement saved = userAchievementRepository.save(achievement);
        return mapToAchievementDto(saved);
    }

    @Transactional
    public void deleteAchievement(Long userId, Long achievementId, String authenticatedEmail) {
        UserAchievement achievement = userAchievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Achievement not found"));

        if (!achievement.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Achievement does not belong to user");
        }

        validateUserOwnership(achievement.getUser(), authenticatedEmail);

        userAchievementRepository.delete(achievement);
    }

    @Transactional
    public ProjectDto addProject(Long userId, ProjectDto dto, String authenticatedEmail) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project title is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateUserOwnership(user, authenticatedEmail);

        UserProject project = new UserProject(
                user,
                dto.getTitle().trim(),
                dto.getDescription(),
                dto.getTechStack(),
                dto.getGithubUrl(),
                dto.getLiveDemoUrl()
        );

        UserProject saved = userProjectRepository.save(project);
        return mapToProjectDto(saved);
    }

    @Transactional
    public ProjectDto updateProject(Long userId, Long projectId, ProjectDto dto, String authenticatedEmail) {
        UserProject project = userProjectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!project.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Project does not belong to user");
        }

        validateUserOwnership(project.getUser(), authenticatedEmail);

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            project.setTitle(dto.getTitle().trim());
        }
        project.setDescription(dto.getDescription());
        project.setTechStack(dto.getTechStack());
        project.setGithubUrl(dto.getGithubUrl());
        project.setLiveDemoUrl(dto.getLiveDemoUrl());

        UserProject saved = userProjectRepository.save(project);
        return mapToProjectDto(saved);
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId, String authenticatedEmail) {
        UserProject project = userProjectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!project.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Project does not belong to user");
        }

        validateUserOwnership(project.getUser(), authenticatedEmail);

        userProjectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getUsersBySkill(Long skillId) {
        return userRepository.findUsersBySkillId(skillId)
                .stream()
                .map(this::mapToUserProfileResponseSummary)
                .toList();
    }

    private void validateUserOwnership(User user, String authenticatedEmail) {
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            if (!user.getEmail().equalsIgnoreCase(authenticatedEmail.trim())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot modify another student's profile");
            }
        }
    }

    private UserProfileResponse mapToUserProfileResponseSummary(User user) {
        Set<String> skillNames = user.getSkills() != null
                ? user.getSkills().stream()
                        .map(Skill::getName)
                        .filter(name -> name != null && !name.isBlank())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getBranch(),
                user.getYear(),
                user.getBio(),
                skillNames,
                user.getGithubUrl(),
                user.getLinkedinUrl(),
                user.getPortfolioUrl(),
                user.getLeetcodeUrl(),
                user.getOtherUrl(),
                user.getLookingFor() != null ? new HashSet<>(user.getLookingFor()) : Collections.emptySet(),
                Collections.emptyList(),
                Collections.emptyList()
        );
    }

    private UserProfileResponse mapToUserProfileResponseFull(User user) {
        Set<String> skillNames = user.getSkills() != null
                ? user.getSkills().stream()
                        .map(Skill::getName)
                        .filter(name -> name != null && !name.isBlank())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        List<AchievementDto> achievements = userAchievementRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToAchievementDto)
                .toList();

        List<ProjectDto> projects = userProjectRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToProjectDto)
                .toList();

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getBranch(),
                user.getYear(),
                user.getBio(),
                skillNames,
                user.getGithubUrl(),
                user.getLinkedinUrl(),
                user.getPortfolioUrl(),
                user.getLeetcodeUrl(),
                user.getOtherUrl(),
                user.getLookingFor() != null ? new HashSet<>(user.getLookingFor()) : Collections.emptySet(),
                achievements,
                projects
        );
    }

    private AchievementDto mapToAchievementDto(UserAchievement achievement) {
        return new AchievementDto(
                achievement.getId(),
                achievement.getTitle(),
                achievement.getDescription(),
                achievement.getCategory(),
                achievement.getAchievementDate(),
                achievement.getVerificationUrl()
        );
    }

    private ProjectDto mapToProjectDto(UserProject project) {
        return new ProjectDto(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getTechStack(),
                project.getGithubUrl(),
                project.getLiveDemoUrl()
        );
    }

    @Transactional
    public void sendDeleteAccountOtp(String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        User user = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (emailOtpService != null) {
            emailOtpService.sendAccountDeletionOtp(user.getEmail());
        }
    }

    @Transactional
    public void deleteAccount(String otp, String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        if (otp == null || otp.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is required");
        }

        User user = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (emailOtpService != null && !emailOtpService.verifyOtp(user.getEmail(), otp.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        Long userId = user.getId();

        // Foreign Key Safety Check: If user is leader of any team (active or expired), reject deletion with clear business message
        if (teamRepository != null && teamRepository.existsByLeaderId(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot delete account while you are the leader of a team. Please delete the team or transfer leadership first.");
        }

        // Clean up all user relations safely
        if (teamMemberRepository != null) {
            teamMemberRepository.deleteByUserId(userId);
        }
        if (teamJoinRequestRepository != null) {
            teamJoinRequestRepository.deleteByUserId(userId);
        }
        if (teamInvitationRepository != null) {
            teamInvitationRepository.deleteByInvitedUserId(userId);
            teamInvitationRepository.deleteByInvitedById(userId);
        }
        if (userAchievementRepository != null) {
            userAchievementRepository.deleteByUserId(userId);
        }
        if (userProjectRepository != null) {
            userProjectRepository.deleteByUserId(userId);
        }
        if (notificationRepository != null) {
            notificationRepository.deleteByUserId(userId);
        }

        user.getSkills().clear();
        userRepository.save(user);
        userRepository.delete(user);

        if (emailOtpService != null) {
            emailOtpService.clearVerifiedEmail(user.getEmail());
        }
    }
}