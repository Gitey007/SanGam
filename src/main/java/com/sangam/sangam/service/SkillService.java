package com.sangam.sangam.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.SkillResponse;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.SkillRepository;
import com.sangam.sangam.repository.UserRepository;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public SkillService(
            SkillRepository skillRepository,
            UserRepository userRepository
    ) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    public List<SkillResponse> getAllSkills() {

        return skillRepository.findAll()
                .stream()
                .map(skill -> new SkillResponse(
                        skill.getId(),
                        skill.getName()
                ))
                .toList();
    }

    public SkillResponse getSkillById(Long id) {

        Skill skill = skillRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found")
                );

        return new SkillResponse(skill.getId(), skill.getName());
    }

    public SkillResponse createSkill(String name) {

        if (name == null || name.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skill name cannot be empty");
        }

        String trimmedName = name.trim();

        if (skillRepository.findByNameIgnoreCase(trimmedName).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Skill already exists");
        }

        Skill skill = new Skill();
        skill.setName(trimmedName);

        Skill saved = skillRepository.save(skill);

        return new SkillResponse(saved.getId(), saved.getName());
    }

    public void addSkillToUser(Long userId, Long skillId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
                );

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found")
                );

        if (user.getSkills().contains(skill)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has this skill");
        }

        user.getSkills().add(skill);

        userRepository.save(user);
    }

    public void removeSkillFromUser(Long userId, Long skillId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
                );

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found")
                );

        if (!user.getSkills().contains(skill)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User does not have this skill");
        }

        user.getSkills().remove(skill);

        userRepository.save(user);
    }
}