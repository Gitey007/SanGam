package com.sangam.sangam.dto;

import java.time.LocalDateTime;

public class TeamJoinRequestResponse {

    private Long requestId;
    private Long userId;
    private String userName;
    private String status;
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

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
