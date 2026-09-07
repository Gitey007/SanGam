package com.sangam.sangam.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "project_name", length = 150)
    private String projectName;

    @Column(name = "project_description", columnDefinition = "TEXT")
    private String projectDescription;

    @Column(name = "team_vision", columnDefinition = "TEXT")
    private String teamVision;

    @Column(name = "project_type", length = 50)
    private String projectType; // Hackathon, College Project, Open Source, Startup, Research, Competition, Personal Project, Other

    @Column(name = "hackathon_name", length = 150)
    private String hackathonName;

    @Column(name = "hackathon_url", length = 255)
    private String hackathonUrl;

    @Column(name = "hackathon_deadline", length = 50)
    private String hackathonDeadline;

    @ManyToOne
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    @Column(name = "max_members", nullable = false)
    private Byte maxMembers = 4;

    @jakarta.persistence.ManyToMany
    @jakarta.persistence.JoinTable(
            name = "team_required_skills",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private java.util.Set<Skill> requiredSkills = new java.util.HashSet<>();

    @jakarta.persistence.ElementCollection
    @jakarta.persistence.CollectionTable(name = "team_required_roles", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "role_name", length = 50)
    private java.util.Set<String> requiredRoles = new java.util.HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getLeader() {
        return leader;
    }

    public void setLeader(User leader) {
        this.leader = leader;
    }

    public Byte getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Byte maxMembers) {
        this.maxMembers = maxMembers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
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

    public java.util.Set<Skill> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(java.util.Set<Skill> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public java.util.Set<String> getRequiredRoles() {
        return requiredRoles;
    }

    public void setRequiredRoles(java.util.Set<String> requiredRoles) {
        this.requiredRoles = requiredRoles;
    }
}