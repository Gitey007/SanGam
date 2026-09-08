package com.sangam.sangam.dto;

public class RoleActionRequest {

    private String role;
    private String requestedRole;
    private String invitedRole;
    private String selectedRole;
    private String customRole;
    private Long userId;
    private Long leaderId;
    private Long memberIdToRemove;

    public RoleActionRequest() {
    }

    public Long getMemberIdToRemove() {
        return memberIdToRemove;
    }

    public void setMemberIdToRemove(Long memberIdToRemove) {
        this.memberIdToRemove = memberIdToRemove;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getRequestedRole() {
        if (requestedRole != null && !requestedRole.isBlank()) {
            return requestedRole;
        }
        return role;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }

    public String getInvitedRole() {
        if (invitedRole != null && !invitedRole.isBlank()) {
            return invitedRole;
        }
        return role;
    }

    public void setInvitedRole(String invitedRole) {
        this.invitedRole = invitedRole;
    }

    public String getSelectedRole() {
        if (selectedRole != null && !selectedRole.isBlank()) {
            return selectedRole;
        }
        return role;
    }

    public void setSelectedRole(String selectedRole) {
        this.selectedRole = selectedRole;
    }

    public String getCustomRole() {
        return customRole;
    }

    public void setCustomRole(String customRole) {
        this.customRole = customRole;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }
}
