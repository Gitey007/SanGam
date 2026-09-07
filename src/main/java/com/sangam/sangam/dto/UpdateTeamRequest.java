package com.sangam.sangam.dto;

import java.util.Set;

public class UpdateTeamRequest {

    private String name;
    private String description;
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

    public UpdateTeamRequest() {
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
}
