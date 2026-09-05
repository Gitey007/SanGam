package com.sangam.sangam.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sangam.sangam.dto.SkillResponse;
import com.sangam.sangam.entity.Skill;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.SkillRepository;
import com.sangam.sangam.repository.UserRepository;

@Service
@Transactional(readOnly = true)
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

    public Skill getSkillById(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Skill not found")
                );
    }

    @Transactional
    public void addSkillToUser(Long userId, Long skillId) {
        User user = userRepository.findWithSkillsById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new RuntimeException("Skill not found")
                );

        user.getSkills().add(skill);

        userRepository.save(user);
    }
}