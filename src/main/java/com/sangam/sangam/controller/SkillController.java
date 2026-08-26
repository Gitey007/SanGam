package com.sangam.sangam.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sangam.sangam.dto.SkillResponse;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.service.SkillService;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;
    
    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(skillService.getSkillById(id));
    }

    @PostMapping("/users/{userId}/skills/{skillId}")
    public ResponseEntity<String> addSkillToUser(
            @PathVariable Long userId,
            @PathVariable Long skillId
    ) {

        skillService.addSkillToUser(userId, skillId);

        return ResponseEntity.ok("Skill added successfully");
    }
}