package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sangam.sangam.entity.TeamJoinRequest;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {

    List<TeamJoinRequest> findByTeamIdAndStatus(Long teamId, TeamJoinRequest.RequestStatus status);

    Optional<TeamJoinRequest> findByTeamIdAndUserId(Long teamId, Long userId);

    boolean existsByTeamIdAndUserIdAndStatus(Long teamId, Long userId, TeamJoinRequest.RequestStatus status);
}
