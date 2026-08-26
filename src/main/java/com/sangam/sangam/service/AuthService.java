package com.sangam.sangam.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sangam.sangam.dto.RegisterRequest;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setBio(request.getBio());

        user.setEmailVerified(false);

        return userRepository.save(user);
    }
}