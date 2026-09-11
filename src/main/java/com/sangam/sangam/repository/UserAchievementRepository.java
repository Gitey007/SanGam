package com.sangam.sangam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.UserAchievement;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    List<UserAchievement> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserAchievement> findByUserId(Long userId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM UserAchievement ua WHERE ua.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
