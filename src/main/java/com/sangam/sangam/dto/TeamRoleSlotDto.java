package com.sangam.sangam.dto;

public class TeamRoleSlotDto {

    private String roleName;
    private Integer slotCount;
    private Integer filledSlots;
    private Integer availableSlots;

    public TeamRoleSlotDto() {
    }

    public TeamRoleSlotDto(String roleName, Integer slotCount) {
        this.roleName = roleName;
        this.slotCount = slotCount;
    }

    public TeamRoleSlotDto(String roleName, Integer slotCount, Integer filledSlots, Integer availableSlots) {
        this.roleName = roleName;
        this.slotCount = slotCount;
        this.filledSlots = filledSlots;
        this.availableSlots = availableSlots;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public Integer getSlotCount() {
        return slotCount;
    }

    public void setSlotCount(Integer slotCount) {
        this.slotCount = slotCount;
    }

    public Integer getFilledSlots() {
        return filledSlots;
    }

    public void setFilledSlots(Integer filledSlots) {
        this.filledSlots = filledSlots;
    }

    public Integer getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(Integer availableSlots) {
        this.availableSlots = availableSlots;
    }
}
