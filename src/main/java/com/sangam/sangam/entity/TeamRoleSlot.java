package com.sangam.sangam.entity;

import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class TeamRoleSlot {

    @Column(name = "role_name", length = 100, nullable = false)
    private String roleName;

    @Column(name = "slot_count", nullable = false)
    private Integer slotCount = 1;

    public TeamRoleSlot() {
    }

    public TeamRoleSlot(String roleName, Integer slotCount) {
        this.roleName = roleName != null ? roleName.trim() : null;
        this.slotCount = (slotCount != null && slotCount > 0) ? slotCount : 1;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName != null ? roleName.trim() : null;
    }

    public Integer getSlotCount() {
        return slotCount;
    }

    public void setSlotCount(Integer slotCount) {
        this.slotCount = (slotCount != null && slotCount > 0) ? slotCount : 1;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TeamRoleSlot that = (TeamRoleSlot) o;
        return roleName != null && roleName.equalsIgnoreCase(that.roleName);
    }

    @Override
    public int hashCode() {
        return roleName != null ? roleName.toLowerCase().hashCode() : 0;
    }
}
