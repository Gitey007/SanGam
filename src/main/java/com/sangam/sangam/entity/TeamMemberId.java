package com.sangam.sangam.entity;

import java.io.Serializable;
import java.util.Objects;

public class TeamMemberId implements Serializable {

    private Long teamId;
    private Long userId;

    public TeamMemberId() {
    }

    public TeamMemberId(Long teamId, Long userId) {
        this.teamId = teamId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof TeamMemberId)) {
            return false;
        }

        TeamMemberId that = (TeamMemberId) o;

        return Objects.equals(teamId, that.teamId)
                && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(teamId, userId);
    }
}