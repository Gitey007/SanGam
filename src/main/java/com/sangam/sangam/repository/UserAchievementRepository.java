package com.sangam.sangam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sangam.sangam.entity.UserAchievement;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    List<UserAchievement> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserAchievement> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
