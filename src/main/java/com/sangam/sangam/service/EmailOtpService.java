package com.sangam.sangam.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailOtpService {

    private static final long OTP_EXPIRATION_SECONDS = 300;
    private static final int MAX_ATTEMPTS = 5;

    private final JavaMailSender mailSender;

    private final Map<String, OtpData> otpStore =
            new ConcurrentHashMap<>();

    private final SecureRandom random = new SecureRandom();

    public EmailOtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String email) {

        String normalizedEmail = email.trim().toLowerCase();

        String otp = String.format(
                "%06d",
                random.nextInt(1_000_000)
        );

        otpStore.put(
                normalizedEmail,
                new OtpData(
                        otp,
                        Instant.now().plusSeconds(
                                OTP_EXPIRATION_SECONDS
                        )
                )
        );

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(normalizedEmail);
        message.setSubject("SanGam Email Verification OTP");

        message.setText(
                "Your SanGam OTP is: " + otp +
                "\n\n" +
                "This OTP is valid for 5 minutes." +
                "\n\n" +
                "Do not share this OTP with anyone."
        );

        mailSender.send(message);
    }

    public boolean verifyOtp(
            String email,
            String otp) {

        String normalizedEmail =
                email.trim().toLowerCase();

        OtpData data =
                otpStore.get(normalizedEmail);

        if (data == null) {
            return false;
        }

        if (Instant.now().isAfter(data.expiration())) {
            otpStore.remove(normalizedEmail);
            return false;
        }

        if (data.attempts() >= MAX_ATTEMPTS) {
            otpStore.remove(normalizedEmail);
            return false;
        }

        data.incrementAttempts();

        if (!data.otp().equals(otp)) {
            return false;
        }

        otpStore.remove(normalizedEmail);

        return true;
    }

    private static class OtpData {

        private final String otp;
        private final Instant expiration;
        private int attempts;

        public OtpData(
                String otp,
                Instant expiration) {

            this.otp = otp;
            this.expiration = expiration;
            this.attempts = 0;
        }

        public String otp() {
            return otp;
        }

        public Instant expiration() {
            return expiration;
        }

        public int attempts() {
            return attempts;
        }

        public void incrementAttempts() {
            attempts++;
        }
    }
}