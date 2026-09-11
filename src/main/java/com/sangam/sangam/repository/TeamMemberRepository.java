package com.sangam.sangam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.TeamMemberId;

public interface TeamMemberRepository
        extends JpaRepository<TeamMember, TeamMemberId> {

    List<TeamMember> findByTeamId(Long teamId);

    List<TeamMember> findByTeamIdIn(java.util.Collection<Long> teamIds);

    long countByTeamId(Long teamId);

    void deleteByTeamIdAndUserId(Long teamId, Long userId);

    void deleteByTeamId(Long teamId);

    void deleteByUserId(Long userId);
}