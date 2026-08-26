package com.sangam.sangam.dto;

public class LoginResponse {

    private Long id;
    private String name;
    private String email;
    private String college;
    private String branch;
    private int year;

    public LoginResponse() {
    }

    public LoginResponse(
            Long id,
            String name,
            String email,
            String college,
            String branch,
            int year
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.year = year;
    }

    public Long getId() {
        return id;
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

    public int getYear() {
        return year;
    }
}