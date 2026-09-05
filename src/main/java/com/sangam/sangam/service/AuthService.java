package com.sangam.sangam.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sangam.sangam.dto.LoginRequest;
import com.sangam.sangam.dto.LoginResponse;
import com.sangam.sangam.dto.RegisterRequest;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;
import com.sangam.sangam.security.JwtService;

@Service
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailOtpService emailOtpService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailOtpService emailOtpService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailOtpService = emailOtpService;
    }

    public User register(RegisterRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email already registered");
        }

        boolean isVerified = emailOtpService.consumeVerifiedEmail(normalizedEmail);
        if (!isVerified && request.getOtp() != null && !request.getOtp().isBlank()) {
            isVerified = emailOtpService.verifyOtp(normalizedEmail, request.getOtp().trim());
            if (isVerified) {
                emailOtpService.consumeVerifiedEmail(normalizedEmail);
            }
        }

        if (!isVerified) {
            throw new RuntimeException("Email verification required. Please verify your email with OTP first.");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(normalizedEmail);

        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setBio(request.getBio());
        user.setEmailVerified(true);

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        String normalizedEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        org.springframework.security.core.userdetails.UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getBranch(),
                user.getYear() != null ? user.getYear().intValue() : 1);
    }

    public LoginResponse loginWithEmail(String email) {

        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        org.springframework.security.core.userdetails.UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCollege(),
                user.getBranch(),
                user.getYear() != null ? user.getYear().intValue() : 1);
    }

    public Optional<LoginResponse> loginWithEmailIfExists(String email) {

        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .map(user -> {
                    org.springframework.security.core.userdetails.UserDetails userDetails = org.springframework.security.core.userdetails.User
                            .withUsername(user.getEmail())
                            .password(user.getPasswordHash())
                            .authorities("USER")
                            .build();

                    String token = jwtService.generateToken(userDetails);

                    return new LoginResponse(
                            token,
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getCollege(),
                            user.getBranch(),
                            user.getYear() != null ? user.getYear().intValue() : 1);
                });
    }

}