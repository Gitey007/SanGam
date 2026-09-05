package com.sangam.sangam.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sangam.sangam.dto.LoginRequest;
import com.sangam.sangam.dto.LoginResponse;
import com.sangam.sangam.dto.RegisterRequest;
import com.sangam.sangam.dto.SendOtpRequest;
import com.sangam.sangam.dto.VerifyOtpRequest;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.service.AuthService;
import com.sangam.sangam.service.EmailOtpService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmailOtpService emailOtpService;
    private final AuthService authService;

    public AuthController(
            AuthService authService,
            EmailOtpService emailOtpService) {

        this.authService = authService;
        this.emailOtpService = emailOtpService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/email/send-otp")
    public ResponseEntity<String> sendEmailOtp(
            @Valid @RequestBody SendOtpRequest request) {

        emailOtpService.sendOtp(request.getEmail());

        return ResponseEntity.ok(
                "OTP sent successfully");
    }

    @PostMapping("/email/verify-otp")
    public ResponseEntity<?> verifyEmailOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        boolean valid = emailOtpService.verifyOtp(
                request.getEmail(),
                request.getOtp());

        if (!valid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        Optional<LoginResponse> loginResponse = authService.loginWithEmailIfExists(
                request.getEmail());

        if (loginResponse.isPresent()) {
            return ResponseEntity.ok(loginResponse.get());
        }

        return ResponseEntity.ok(Map.of(
                "message", "Email verified successfully",
                "email", request.getEmail().trim().toLowerCase(),
                "verified", true));
    }
}