package com.sangam.sangam.dto;

import java.util.List;
import java.util.Set;

public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String college;
    private String branch;
    private Byte year;
    private String bio;
    private Set<String> skills;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String leetcodeUrl;
    private String otherUrl;
    private Set<String> lookingFor;
    private List<AchievementDto> achievements;
    private List<ProjectDto> projects;

    public UserProfileResponse() {
    }

    public UserProfileResponse(
            Long id,
            String name,
            String email,
            String college,
            String branch,
            Byte year,
            String bio,
            Set<String> skills
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.year = year;
        this.bio = bio;
        this.skills = skills;
    }

    public UserProfileResponse(
            Long id,
            String name,
            String email,
            String college,
            String branch,
            Byte year,
            String bio,
            Set<String> skills,
            String githubUrl,
            String linkedinUrl,
            String portfolioUrl,
            String leetcodeUrl,
            String otherUrl,
            Set<String> lookingFor,
            List<AchievementDto> achievements,
            List<ProjectDto> projects
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.year = year;
        this.bio = bio;
        this.skills = skills;
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.portfolioUrl = portfolioUrl;
        this.leetcodeUrl = leetcodeUrl;
        this.otherUrl = otherUrl;
        this.lookingFor = lookingFor;
        this.achievements = achievements;
        this.projects = projects;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Byte getYear() {
        return year;
    }

    public void setYear(Byte year) {
        this.year = year;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public void setSkills(Set<String> skills) {
        this.skills = skills;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getLeetcodeUrl() {
        return leetcodeUrl;
    }

    public void setLeetcodeUrl(String leetcodeUrl) {
        this.leetcodeUrl = leetcodeUrl;
    }

    public String getOtherUrl() {
        return otherUrl;
    }

    public void setOtherUrl(String otherUrl) {
        this.otherUrl = otherUrl;
    }

    public Set<String> getLookingFor() {
        return lookingFor;
    }

    public void setLookingFor(Set<String> lookingFor) {
        this.lookingFor = lookingFor;
    }

    public List<AchievementDto> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<AchievementDto> achievements) {
        this.achievements = achievements;
    }

    public List<ProjectDto> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectDto> projects) {
        this.projects = projects;
    }
}