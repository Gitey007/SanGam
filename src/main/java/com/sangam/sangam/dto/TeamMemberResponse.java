package com.sangam.sangam.dto;

public class TeamMemberResponse {

    private Long userId;
    private String name;
    private String email;
    private String college;
    private String branch;
    private Byte year;
    private String role;

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

}