package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.TeamJoinRequest;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {

    List<TeamJoinRequest> findByTeamIdAndStatus(Long teamId, TeamJoinRequest.RequestStatus status);

    List<TeamJoinRequest> findByUserIdAndStatus(Long userId, TeamJoinRequest.RequestStatus status);

    List<TeamJoinRequest> findByUserId(Long userId);

    Optional<TeamJoinRequest> findByTeamIdAndUserId(Long teamId, Long userId);

    boolean existsByTeamIdAndUserIdAndStatus(Long teamId, Long userId, TeamJoinRequest.RequestStatus status);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamJoinRequest tjr WHERE tjr.team.id = :teamId")
    void deleteByTeamId(@Param("teamId") Long teamId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamJoinRequest tjr WHERE tjr.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
