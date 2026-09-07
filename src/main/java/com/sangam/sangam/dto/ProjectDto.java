package com.sangam.sangam.dto;

public class ProjectDto {

    private Long id;
    private String title;
    private String description;
    private String techStack;
    private String githubUrl;
    private String liveDemoUrl;

    public ProjectDto() {
    }

    public ProjectDto(Long id, String title, String description, String techStack, String githubUrl, String liveDemoUrl) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.techStack = techStack;
        this.githubUrl = githubUrl;
        this.liveDemoUrl = liveDemoUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getName() {
        return title;
    }

    public void setName(String name) {
        if (this.title == null || this.title.isBlank()) {
            this.title = name;
        }
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTechStack() {
        return techStack;
    }

    public void setTechStack(String techStack) {
        this.techStack = techStack;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLiveDemoUrl() {
        return liveDemoUrl;
    }

    public void setLiveDemoUrl(String liveDemoUrl) {
        this.liveDemoUrl = liveDemoUrl;
    }

    public String getLiveUrl() {
        return liveDemoUrl;
    }

    public void setLiveUrl(String liveUrl) {
        if (this.liveDemoUrl == null || this.liveDemoUrl.isBlank()) {
            this.liveDemoUrl = liveUrl;
        }
    }
}
