package com.sangam.sangam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sangam.sangam.entity.TeamMember;
import com.sangam.sangam.entity.TeamMemberId;

public interface TeamMemberRepository
        extends JpaRepository<TeamMember, TeamMemberId> {
}