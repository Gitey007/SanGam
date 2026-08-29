package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u JOIN u.skills s WHERE s.id = :skillId")
    List<User> findUsersBySkillId(@Param("skillId") Long skillId);

    List<User> findByCollege(String college);

    List<User> findByCollegeNot(String college);

    List<User> findByCollegeAndYear(String college, Integer year);

    @Query("""
            SELECT DISTINCT u
            FROM User u
            JOIN u.skills s
            WHERE LOWER(s.name) = LOWER(:skill)
            """)
    List<User> findBySkillName(@Param("skill") String skill);
}