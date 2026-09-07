package com.sangam.sangam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sangam.sangam.entity.UserProject;

public interface UserProjectRepository extends JpaRepository<UserProject, Long> {

    List<UserProject> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserProject> findByUserId(Long userId);
}
