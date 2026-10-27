package com.sangam.sangam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AchievementDto {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String achievementDate;
    private String verificationUrl;
}
