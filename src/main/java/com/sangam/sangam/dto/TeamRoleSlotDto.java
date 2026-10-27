package com.sangam.sangam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamRoleSlotDto {

    private String roleName;
    private Integer slotCount;
    private Integer filledSlots;
    private Integer availableSlots;

    public TeamRoleSlotDto(String roleName, Integer slotCount) {
        this.roleName = roleName;
        this.slotCount = slotCount;
    }
}
