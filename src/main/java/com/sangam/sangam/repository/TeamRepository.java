package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.Team;

import jakarta.persistence.LockModeType;

public interface TeamRepository extends JpaRepository<Team, Long> {

    @EntityGraph(attributePaths = {"leader", "requiredSkills"})
    @Query("SELECT DISTINCT t FROM Team t")
    List<Team> findAllWithDetails();

    @EntityGraph(attributePaths = {"leader", "requiredSkills"})
    @Query("SELECT t FROM Team t WHERE t.id = :id")
    Optional<Team> findWithDetailsById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Team t WHERE t.id = :id")
    Optional<Team> findByIdForUpdate(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = {"leader", "requiredSkills"})
    Optional<Team> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"leader", "requiredSkills"})
    List<Team> findAll();

    boolean existsByLeaderId(Long leaderId);

    long countByLeaderId(Long leaderId);

    @EntityGraph(attributePaths = {"leader"})
    @Query(value = "SELECT t FROM Team t ORDER BY "
            + "CASE WHEN (t.joinDeadline IS NOT NULL AND t.joinDeadline < CURRENT_TIMESTAMP) THEN 1 ELSE 0 END ASC, "
            + "(t.maxMembers - (SELECT COUNT(m) FROM TeamMember m WHERE m.teamId = t.id)) DESC, "
            + "t.id DESC",
           countQuery = "SELECT COUNT(t) FROM Team t")
    org.springframework.data.domain.Page<Team> findAllPaged(org.springframework.data.domain.Pageable pageable);
}

