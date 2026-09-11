package com.sangam.sangam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.TeamMemberId;

public interface TeamMemberRepository
        extends JpaRepository<TeamMember, TeamMemberId> {

    List<TeamMember> findByTeamId(Long teamId);

    List<TeamMember> findByTeamIdIn(java.util.Collection<Long> teamIds);

    long countByTeamId(Long teamId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamMember tm WHERE tm.teamId = :teamId AND tm.userId = :userId")
    void deleteByTeamIdAndUserId(@Param("teamId") Long teamId, @Param("userId") Long userId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamMember tm WHERE tm.teamId = :teamId")
    void deleteByTeamId(@Param("teamId") Long teamId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamMember tm WHERE tm.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}