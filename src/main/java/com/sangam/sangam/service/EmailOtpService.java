package com.sangam.sangam.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class EmailOtpService {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailOtpService.class);

    private static final long OTP_EXPIRATION_SECONDS = 300;
    private static final int MAX_ATTEMPTS = 5;

    private final RestClient restClient;

    @Value("${BREVO_API_KEY}")
    private String brevoApiKey;

    @Value("${BREVO_SENDER_EMAIL}")
    private String senderEmail;

    private final Map<String, OtpData> otpStore =
            new ConcurrentHashMap<>();

    private final SecureRandom random = new SecureRandom();

    public EmailOtpService() {
        this.restClient = RestClient.create("https://api.brevo.com");
    }

    public void sendOtp(String email) {

        String normalizedEmail =
                email.trim().toLowerCase();

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

        logger.info(
                "Starting email OTP dispatch to: {}",
                maskEmail(normalizedEmail)
        );

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of(
                        "name", "SanGam",
                        "email", senderEmail
                ),
                "to", List.of(
                        Map.of(
                                "email", normalizedEmail
                        )
                ),
                "subject", "SanGam Email Verification OTP",
                "textContent",
                "Your SanGam OTP is: " + otp
                        + "\n\n"
                        + "This OTP is valid for 5 minutes."
                        + "\n\n"
                        + "Do not share this OTP with anyone."
        );

        try {

            String response = restClient.post()
                    .uri("/v3/smtp/email")
                    .header("api-key", brevoApiKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            logger.info(
                    "Email OTP successfully sent to: {} | Brevo Response: {}",
                    maskEmail(normalizedEmail),
                    response
            );

        } catch (Exception ex) {

            // Remove OTP because email was not successfully sent
            otpStore.remove(normalizedEmail);

            logger.error(
                    "Failed to send OTP email to {}. Exception: [{}] {}",
                    maskEmail(normalizedEmail),
                    ex.getClass().getName(),
                    ex.getMessage()
            );

            throw new RuntimeException(
                    "Unable to send OTP email",
                    ex
            );
        }
    }

    public boolean verifyOtp(
            String email,
            String otp) {

        String normalizedEmail =
                email.trim().toLowerCase();

        String masked =
                maskEmail(normalizedEmail);

        logger.info(
                "OTP verification requested for: {}",
                masked
        );

        OtpData data =
                otpStore.get(normalizedEmail);

        if (data == null) {
            logger.warn(
                    "OTP verification failed for {}: No OTP found or expired from cache",
                    masked
            );
            return false;
        }

        if (Instant.now().isAfter(data.expiration())) {

            otpStore.remove(normalizedEmail);

            logger.warn(
                    "OTP verification failed for {}: OTP expired",
                    masked
            );

            return false;
        }

        if (data.attempts() >= MAX_ATTEMPTS) {

            otpStore.remove(normalizedEmail);

            logger.warn(
                    "OTP verification failed for {}: Max attempts ({}) exceeded",
                    masked,
                    MAX_ATTEMPTS
            );

            return false;
        }

        data.incrementAttempts();

        if (!data.otp().equals(otp)) {

            logger.warn(
                    "OTP verification failed for {}: Incorrect OTP provided (attempt {}/{})",
                    masked,
                    data.attempts(),
                    MAX_ATTEMPTS
            );

            return false;
        }

        otpStore.remove(normalizedEmail);

        logger.info(
                "OTP verification successful for: {}",
                masked
        );

        return true;
    }

    private String maskEmail(String email) {

        if (email == null || !email.contains("@")) {
            return "***";
        }

        String[] parts =
                email.split("@", 2);

        String local = parts[0];
        String domain = parts[1];

        if (local.length() <= 2) {
            return local.charAt(0)
                    + "***@"
                    + domain;
        }

        return local.charAt(0)
                + "***"
                + local.charAt(local.length() - 1)
                + "@"
                + domain;
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