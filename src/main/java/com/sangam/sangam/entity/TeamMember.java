package com.sangam.sangam.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "team_members")
@IdClass(TeamMemberId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    @Id
    @Column(name = "team_id")
    private Long teamId;

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MEMBER;

    @Column(name = "assigned_role", length = 100)
    private String assignedRole;

    @Column(name = "custom_role", length = 150)
    private String customRole;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    public enum Role {
        LEADER,
        MEMBER
    }
}