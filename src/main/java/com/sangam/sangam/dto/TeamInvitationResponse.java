package com.sangam.sangam.dto;

import java.time.LocalDateTime;

public class TeamInvitationResponse {

    private Long invitationId;
    private Long teamId;
    private String teamName;
    private String teamDescription;
    private Long invitedById;
    private String invitedByName;
    private Long invitedUserId;
    private String invitedUserName;
    private String status;
    private String invitedRole;
    private String customRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Byte maxMembers;

    public TeamInvitationResponse() {
    }

    public TeamInvitationResponse(
            Long invitationId,
            Long teamId,
            String teamName,
            String teamDescription,
            Long invitedById,
            String invitedByName,
            Long invitedUserId,
            String invitedUserName,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Byte maxMembers) {

        this.invitationId = invitationId;
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamDescription = teamDescription;
        this.invitedById = invitedById;
        this.invitedByName = invitedByName;
        this.invitedUserId = invitedUserId;
        this.invitedUserName = invitedUserName;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.maxMembers = maxMembers;
    }

    public TeamInvitationResponse(
            Long invitationId,
            Long teamId,
            String teamName,
            String teamDescription,
            Long invitedById,
            String invitedByName,
            Long invitedUserId,
            String invitedUserName,
            String status,
            String invitedRole,
            String customRole,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Byte maxMembers) {

        this.invitationId = invitationId;
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamDescription = teamDescription;
        this.invitedById = invitedById;
        this.invitedByName = invitedByName;
        this.invitedUserId = invitedUserId;
        this.invitedUserName = invitedUserName;
        this.status = status;
        this.invitedRole = invitedRole;
        this.customRole = customRole;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.maxMembers = maxMembers;
    }

    public Long getInvitationId() {
        return invitationId;
    }

    public void setInvitationId(Long invitationId) {
        this.invitationId = invitationId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getTeamDescription() {
        return teamDescription;
    }

    public void setTeamDescription(String teamDescription) {
        this.teamDescription = teamDescription;
    }

    public Long getInvitedById() {
        return invitedById;
    }

    public void setInvitedById(Long invitedById) {
        this.invitedById = invitedById;
    }

    public String getInvitedByName() {
        return invitedByName;
    }

    public void setInvitedByName(String invitedByName) {
        this.invitedByName = invitedByName;
    }

    public Long getInvitedUserId() {
        return invitedUserId;
    }

    public void setInvitedUserId(Long invitedUserId) {
        this.invitedUserId = invitedUserId;
    }

    public String getInvitedUserName() {
        return invitedUserName;
    }

    public void setInvitedUserName(String invitedUserName) {
        this.invitedUserName = invitedUserName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInvitedRole() {
        return invitedRole;
    }

    public void setInvitedRole(String invitedRole) {
        this.invitedRole = invitedRole;
    }

    public String getCustomRole() {
        return customRole;
    }

    public void setCustomRole(String customRole) {
        this.customRole = customRole;
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

    public Byte getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Byte maxMembers) {
        this.maxMembers = maxMembers;
    }
}
