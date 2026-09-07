package com.sangam.sangam.dto;

import java.util.Set;

public class TeamResponse {

    private Long id;
    private String name;
    private String description;
    private Long leaderId;
    private String leaderName;
    private Byte maxMembers;
    private String projectName;
    private String projectDescription;
    private String teamVision;
    private String projectType;
    private String hackathonName;
    private String hackathonUrl;
    private String hackathonDeadline;
    private Set<String> requiredSkills;
    private Set<String> requiredRoles;
    private Integer memberCount;
    private String status; // "OPEN", "ALMOST_FULL", "FULL"

    public TeamResponse() {
    }

    public TeamResponse(
            Long id,
            String name,
            String description,
            Long leaderId,
            String leaderName,
            Byte maxMembers) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.leaderId = leaderId;
        this.leaderName = leaderName;
        this.maxMembers = maxMembers;
    }

    public TeamResponse(
            Long id,
            String name,
            String description,
            Long leaderId,
            String leaderName,
            Byte maxMembers,
            String projectName,
            String projectDescription,
            String teamVision,
            String projectType,
            String hackathonName,
            String hackathonUrl,
            String hackathonDeadline,
            Set<String> requiredSkills,
            Set<String> requiredRoles,
            Integer memberCount,
            String status) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.leaderId = leaderId;
        this.leaderName = leaderName;
        this.maxMembers = maxMembers;
        this.projectName = projectName;
        this.projectDescription = projectDescription;
        this.teamVision = teamVision;
        this.projectType = projectType;
        this.hackathonName = hackathonName;
        this.hackathonUrl = hackathonUrl;
        this.hackathonDeadline = hackathonDeadline;
        this.requiredSkills = requiredSkills;
        this.requiredRoles = requiredRoles;
        this.memberCount = memberCount;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public Byte getMaxMembers() {
        return maxMembers;
    }

    public String getProjectName() {
        return projectName;
    }

    public String getProjectDescription() {
        return projectDescription;
    }

    public String getTeamVision() {
        return teamVision;
    }

    public String getProjectType() {
        return projectType;
    }

    public String getHackathonName() {
        return hackathonName;
    }

    public String getHackathonUrl() {
        return hackathonUrl;
    }

    public String getHackathonDeadline() {
        return hackathonDeadline;
    }

    public Set<String> getRequiredSkills() {
        return requiredSkills;
    }

    public Set<String> getRequiredRoles() {
        return requiredRoles;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

    public void setMaxMembers(Byte maxMembers) {
        this.maxMembers = maxMembers;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }

    public void setTeamVision(String teamVision) {
        this.teamVision = teamVision;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public void setHackathonName(String hackathonName) {
        this.hackathonName = hackathonName;
    }

    public void setHackathonUrl(String hackathonUrl) {
        this.hackathonUrl = hackathonUrl;
    }

    public void setHackathonDeadline(String hackathonDeadline) {
        this.hackathonDeadline = hackathonDeadline;
    }

    public void setRequiredSkills(Set<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public void setRequiredRoles(Set<String> requiredRoles) {
        this.requiredRoles = requiredRoles;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}