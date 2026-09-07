package com.sangam.sangam.dto;

public class AchievementDto {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String achievementDate;
    private String verificationUrl;

    public AchievementDto() {
    }

    public AchievementDto(Long id, String title, String description, String category, String achievementDate, String verificationUrl) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.achievementDate = achievementDate;
        this.verificationUrl = verificationUrl;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAchievementDate() {
        return achievementDate;
    }

    public void setAchievementDate(String achievementDate) {
        this.achievementDate = achievementDate;
    }

    public String getVerificationUrl() {
        return verificationUrl;
    }

    public void setVerificationUrl(String verificationUrl) {
        this.verificationUrl = verificationUrl;
    }
}
