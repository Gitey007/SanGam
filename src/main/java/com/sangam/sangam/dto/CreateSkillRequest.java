package com.sangam.sangam.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateSkillRequest {

    @NotBlank(message = "Skill name is required")
    private String name;

    public CreateSkillRequest() {
    }

    public CreateSkillRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
