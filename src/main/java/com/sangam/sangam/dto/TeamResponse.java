package com.sangam.sangam.dto;

public class TeamResponse {

    private Long id;
    private String name;
    private String description;
    private Long leaderId;
    private String leaderName;
    private Byte maxMembers;

    public TeamResponse(
            Long id,
            String name,
            String description,
            Long leaderId,
            String leaderName,
            Byte maxMembers) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.leaderId = leaderId;
        this.leaderName = leaderName;
        this.maxMembers = maxMembers;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public Byte getMaxMembers() {
        return maxMembers;
    }
}