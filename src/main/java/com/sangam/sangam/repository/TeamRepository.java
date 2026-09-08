package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    @EntityGraph(attributePaths = {"leader", "requiredSkills", "roleSlots"})
    @Query("SELECT DISTINCT t FROM Team t")
    List<Team> findAllWithDetails();

    @EntityGraph(attributePaths = {"leader", "requiredSkills", "roleSlots"})
    @Query("SELECT t FROM Team t WHERE t.id = :id")
    Optional<Team> findWithDetailsById(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = {"leader", "requiredSkills", "roleSlots"})
    Optional<Team> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"leader", "requiredSkills", "roleSlots"})
    List<Team> findAll();
}

