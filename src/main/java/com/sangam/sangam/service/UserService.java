package com.sangam.sangam.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}