package com.sangam.sangam.dto;

public class TeamMemberResponse {

    private Long userId;
    private String name;
    private String email;
    private String college;
    private String branch;
    private Byte year;
    private String role;
    private String assignedRole;
    private String customRole;

    public TeamMemberResponse(
            Long userId,
            String name,
            String email,
            String college,
            String branch,
            Byte year,
            String role) {

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.year = year;
        this.role = role;
    }

    public TeamMemberResponse(
            Long userId,
            String name,
            String email,
            String college,
            String branch,
            Byte year,
            String role,
            String assignedRole,
            String customRole) {

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.year = year;
        this.role = role;
        this.assignedRole = assignedRole;
        this.customRole = customRole;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getCollege() {
        return college;
    }

    public String getBranch() {
        return branch;
    }

    public Byte getYear() {
        return year;
    }

    public String getRole() {
        return role;
    }

    public String getAssignedRole() {
        return assignedRole;
    }

    public String getCustomRole() {
        return customRole;
    }

}