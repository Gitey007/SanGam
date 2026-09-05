package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findWithSkillsByEmail(@Param("email") String email);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findWithSkillsById(@Param("id") Long id);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT u FROM User u")
    List<User> findAllWithSkills();

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT DISTINCT u FROM User u WHERE u.college = :college")
    List<User> findByCollege(@Param("college") String college);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT DISTINCT u FROM User u WHERE u.college <> :college")
    List<User> findByCollegeNot(@Param("college") String college);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT DISTINCT u FROM User u WHERE u.college = :college AND u.year = :year")
    List<User> findByCollegeAndYear(@Param("college") String college, @Param("year") Byte year);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT DISTINCT u FROM User u WHERE u.college <> :college AND u.year = :year")
    List<User> findByCollegeNotAndYear(@Param("college") String college, @Param("year") Byte year);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT DISTINCT u FROM User u WHERE u.year = :year")
    List<User> findByYear(@Param("year") Byte year);

    @EntityGraph(attributePaths = "skills")
    @Query("SELECT DISTINCT u FROM User u JOIN u.skills s WHERE s.id = :skillId")
    List<User> findUsersBySkillId(@Param("skillId") Long skillId);

    @EntityGraph(attributePaths = "skills")
    @Query("""
            SELECT DISTINCT u
            FROM User u
            JOIN u.skills s
            WHERE LOWER(s.name) = LOWER(:skill)
            """)
    List<User> findBySkillName(@Param("skill") String skill);
}