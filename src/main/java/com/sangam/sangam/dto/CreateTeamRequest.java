package com.sangam.sangam.dto;

import java.util.List;
import java.util.Set;

public class CreateTeamRequest {

    private String name;
    private String description;
    private Long leaderId;
    private Byte maxMembers;
    private String projectName;
    private String projectDescription;
    private String teamVision;
    private String projectType;
    private String hackathonName;
    private String hackathonUrl;
    private String hackathonDeadline;
    private String githubRepositoryUrl;
    private String documentationUrl;
    private String leaderRole;
    private String leaderCustomRole;
    private Set<String> requiredSkills;
    private Set<String> requiredRoles;
    private List<TeamRoleSlotDto> roleSlots;

    public CreateTeamRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }

    public Byte getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Byte maxMembers) {
        this.maxMembers = maxMembers;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectDescription() {
        return projectDescription;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }

    public String getTeamVision() {
        return teamVision;
    }

    public void setTeamVision(String teamVision) {
        this.teamVision = teamVision;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public String getHackathonName() {
        return hackathonName;
    }

    public void setHackathonName(String hackathonName) {
        this.hackathonName = hackathonName;
    }

    public String getHackathonUrl() {
        return hackathonUrl;
    }

    public void setHackathonUrl(String hackathonUrl) {
        this.hackathonUrl = hackathonUrl;
    }

    public String getHackathonDeadline() {
        return hackathonDeadline;
    }

    public void setHackathonDeadline(String hackathonDeadline) {
        this.hackathonDeadline = hackathonDeadline;
    }

    public String getGithubRepositoryUrl() {
        return githubRepositoryUrl;
    }

    public void setGithubRepositoryUrl(String githubRepositoryUrl) {
        this.githubRepositoryUrl = githubRepositoryUrl;
    }

    public String getDocumentationUrl() {
        return documentationUrl;
    }

    public void setDocumentationUrl(String documentationUrl) {
        this.documentationUrl = documentationUrl;
    }

    public String getLeaderRole() {
        return leaderRole;
    }

    public void setLeaderRole(String leaderRole) {
        this.leaderRole = leaderRole;
    }

    public String getLeaderCustomRole() {
        return leaderCustomRole;
    }

    public void setLeaderCustomRole(String leaderCustomRole) {
        this.leaderCustomRole = leaderCustomRole;
    }

    public Set<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(Set<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public Set<String> getRequiredRoles() {
        return requiredRoles;
    }

    public void setRequiredRoles(Set<String> requiredRoles) {
        this.requiredRoles = requiredRoles;
    }

    public List<TeamRoleSlotDto> getRoleSlots() {
        return roleSlots;
    }

    public void setRoleSlots(List<TeamRoleSlotDto> roleSlots) {
        this.roleSlots = roleSlots;
    }
}