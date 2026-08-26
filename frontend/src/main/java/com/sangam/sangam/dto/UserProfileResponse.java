package com.sangam.sangam.dto;

import java.util.Set;

public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String college;
    private String branch;
    private Byte year;
    private String bio;
    private Set<String> skills;

    public UserProfileResponse() {
    }

    public UserProfileResponse(
            Long id,
            String name,
            String email,
            String college,
            String branch,
            Byte year,
            String bio,
            Set<String> skills
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.college = college;
        this.branch = branch;
        this.year = year;
        this.bio = bio;
        this.skills = skills;
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

    public Byte getYear() {
        return year;
    }

    public String getBio() {
        return bio;
    }

    public Set<String> getSkills() {
        return skills;
    }
}