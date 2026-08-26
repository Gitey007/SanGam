package com.sangam.sangam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sangam.sangam.entity.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {
}
