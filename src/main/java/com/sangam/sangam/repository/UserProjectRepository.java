package com.sangam.sangam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.UserProject;

public interface UserProjectRepository extends JpaRepository<UserProject, Long> {

    List<UserProject> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserProject> findByUserId(Long userId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM UserProject up WHERE up.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
