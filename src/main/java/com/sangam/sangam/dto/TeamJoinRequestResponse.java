package com.sangam.sangam.dto;

import java.time.LocalDateTime;

public class TeamJoinRequestResponse {

    private Long requestId;
    private Long teamId;
    private String teamName;
    private Long userId;
    private String userName;
    private String status;
    private String requestedRole;
    private String customRole;
    private Boolean fromInvitation;
    private LocalDateTime createdAt;

    public TeamJoinRequestResponse() {
    }

    public TeamJoinRequestResponse(
            Long requestId,
            Long userId,
            String userName,
            String status,
            LocalDateTime createdAt) {

        this.requestId = requestId;
        this.userId = userId;
        this.userName = userName;
        this.status = status;
        this.createdAt = createdAt;
    }

    public TeamJoinRequestResponse(
            Long requestId,
            Long userId,
            String userName,
            String status,
            String requestedRole,
            String customRole,
            LocalDateTime createdAt) {

        this.requestId = requestId;
        this.userId = userId;
        this.userName = userName;
        this.status = status;
        this.requestedRole = requestedRole;
        this.customRole = customRole;
        this.createdAt = createdAt;
    }

    public TeamJoinRequestResponse(
            Long requestId,
            Long teamId,
            String teamName,
            Long userId,
            String userName,
            String status,
            String requestedRole,
            String customRole,
            LocalDateTime createdAt) {

        this.requestId = requestId;
        this.teamId = teamId;
        this.teamName = teamName;
        this.userId = userId;
        this.userName = userName;
        this.status = status;
        this.requestedRole = requestedRole;
        this.customRole = customRole;
        this.createdAt = createdAt;
    }

    public TeamJoinRequestResponse(
            Long requestId,
            Long teamId,
            String teamName,
            Long userId,
            String userName,
            String status,
            String requestedRole,
            String customRole,
            Boolean fromInvitation,
            LocalDateTime createdAt) {

        this.requestId = requestId;
        this.teamId = teamId;
        this.teamName = teamName;
        this.userId = userId;
        this.userName = userName;
        this.status = status;
        this.requestedRole = requestedRole;
        this.customRole = customRole;
        this.fromInvitation = fromInvitation;
        this.createdAt = createdAt;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }

    public String getCustomRole() {
        return customRole;
    }

    public void setCustomRole(String customRole) {
        this.customRole = customRole;
    }

    public Boolean getFromInvitation() {
        return fromInvitation;
    }

    public Boolean isFromInvitation() {
        return fromInvitation != null && fromInvitation;
    }

    public void setFromInvitation(Boolean fromInvitation) {
        this.fromInvitation = fromInvitation;
    }

    public Long getId() {
        return requestId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
