package com.sangam.sangam.dto;

import java.time.LocalDateTime;

public class TeamJoinRequestResponse {

    private Long id;
    private Long teamId;
    private String teamName;
    private Long userId;
    private String userName;
    private String userEmail;
    private String college;
    private String branch;
    private Byte year;
    private String status;
    private LocalDateTime createdAt;

    public TeamJoinRequestResponse() {
    }

    public TeamJoinRequestResponse(
            Long id,
            Long teamId,
            String teamName,
            Long userId,
            String userName,
            String userEmail,
            String college,
            String branch,
            Byte year,
            String status,
            LocalDateTime createdAt) {
        this.id = id;
        this.teamId = teamId;
        this.teamName = teamName;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.college = college;
        this.branch = branch;
        this.year = year;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
