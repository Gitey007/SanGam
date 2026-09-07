package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sangam.sangam.entity.TeamInvitation;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {

    List<TeamInvitation> findByInvitedUserId(Long userId);

    List<TeamInvitation> findByInvitedUserIdAndStatus(Long userId, TeamInvitation.InvitationStatus status);

    List<TeamInvitation> findByTeamId(Long teamId);

    List<TeamInvitation> findByTeamIdAndStatus(Long teamId, TeamInvitation.InvitationStatus status);

    Optional<TeamInvitation> findByTeamIdAndInvitedUserId(Long teamId, Long userId);

    boolean existsByTeamIdAndInvitedUserIdAndStatus(Long teamId, Long userId, TeamInvitation.InvitationStatus status);
}
