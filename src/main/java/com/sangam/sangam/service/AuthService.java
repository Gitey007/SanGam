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

    public LoginResponse register(RegisterRequest request) {

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

        User savedUser = userRepository.save(user);

        org.springframework.security.core.userdetails.UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getEmail())
                .password(savedUser.getPasswordHash())
                .authorities("USER")
                .build();

        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getCollege(),
                savedUser.getBranch(),
                savedUser.getYear() != null ? savedUser.getYear().intValue() : 1);
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

    public String forgotPasswordSendOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Email is required");
        }

        String normalizedEmail = email.trim().toLowerCase();

        if (!userRepository.existsByEmail(normalizedEmail)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "No account is registered with this email.");
        }

        emailOtpService.sendOtp(normalizedEmail);
        return "OTP has been sent to your registered email.";
    }

    public boolean forgotPasswordVerifyOtp(String email, String otp) {
        if (email == null || otp == null || email.isBlank() || otp.isBlank()) {
            return false;
        }

        String normalizedEmail = email.trim().toLowerCase();
        return emailOtpService.verifyOtp(normalizedEmail, otp);
    }

    public void forgotPasswordReset(com.sangam.sangam.dto.ResetPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Server-side verification check: consume the verified state (single-use)
        boolean isVerified = emailOtpService.consumeVerifiedEmail(normalizedEmail);
        if (!isVerified) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "OTP verification required or reset session expired. Please verify OTP again.");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Unable to reset password"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public void changePassword(com.sangam.sangam.dto.ChangePasswordRequest request, String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        if (request == null || request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Current password is required");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
        }

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()) {
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "New passwords do not match");
            }
        }

        User user = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "New password cannot be the same as current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}