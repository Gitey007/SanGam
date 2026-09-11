package com.sangam.sangam.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sangam.sangam.entity.TeamInvitation;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {

    List<TeamInvitation> findByInvitedUserId(Long userId);

    List<TeamInvitation> findByInvitedUserIdAndStatus(Long userId, TeamInvitation.InvitationStatus status);

    List<TeamInvitation> findByTeamId(Long teamId);

    List<TeamInvitation> findByTeamIdAndStatus(Long teamId, TeamInvitation.InvitationStatus status);

    Optional<TeamInvitation> findByTeamIdAndInvitedUserId(Long teamId, Long userId);

    boolean existsByTeamIdAndInvitedUserIdAndStatus(Long teamId, Long userId, TeamInvitation.InvitationStatus status);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamInvitation ti WHERE ti.team.id = :teamId")
    void deleteByTeamId(@Param("teamId") Long teamId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamInvitation ti WHERE ti.invitedUser.id = :userId")
    void deleteByInvitedUserId(@Param("userId") Long userId);

    @Modifying(flushAutomatically = true)
    @Query("DELETE FROM TeamInvitation ti WHERE ti.invitedBy.id = :userId")
    void deleteByInvitedById(@Param("userId") Long userId);
}
