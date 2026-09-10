package com.sangam.sangam.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final RestClient restClient;
    private final String brevoApiKey;
    private final String senderEmail;
    private final String appBaseUrl;

    @Autowired
    public EmailNotificationService(
            @Value("${BREVO_API_KEY:}") String brevoApiKey,
            @Value("${BREVO_SENDER_EMAIL:}") String senderEmail,
            @Value("${app.frontend.url:https://san-gam.vercel.app}") String appBaseUrl) {
        this(brevoApiKey, senderEmail, appBaseUrl, RestClient.builder().baseUrl("https://api.brevo.com").build());
    }

    public EmailNotificationService(
            String brevoApiKey,
            String senderEmail,
            String appBaseUrl,
            RestClient restClient) {
        this.brevoApiKey = brevoApiKey;
        this.senderEmail = senderEmail;
        this.appBaseUrl = appBaseUrl;
        this.restClient = restClient;
    }

    @Async
    public void sendJoinRequestSubmittedEmail(String studentEmail, String studentName, String teamName, String requestedRole) {
        if (studentEmail == null || studentEmail.isBlank()) return;
        String subject = "SanGam: Join Request Submitted for " + teamName;
        String content = "Hello " + (studentName != null ? studentName : "Student") + ",\n\n"
                + "Your join request to team \"" + teamName + "\" has been submitted successfully.\n"
                + (requestedRole != null && !requestedRole.isBlank() ? "Requested Role: " + requestedRole + "\n" : "")
                + "Status: PENDING\n\n"
                + "You can track your request status on SanGam: " + appBaseUrl + "/teams\n\n"
                + "Best regards,\nSanGam Team";

        sendEmailAsync(studentEmail, subject, content);
    }

    @Async
    public void sendJoinRequestReceivedEmail(String leaderEmail, String leaderName, String studentName, String studentEmail,
                                            String college, String branch, Byte year, String teamName, String requestedRole) {
        if (leaderEmail == null || leaderEmail.isBlank()) return;
        String subject = "SanGam: New Join Request for " + teamName;
        String content = "Hello " + (leaderName != null ? leaderName : "Team Leader") + ",\n\n"
                + "You have received a new join request for your team \"" + teamName + "\".\n\n"
                + "Applicant Details:\n"
                + "• Name: " + (studentName != null ? studentName : "N/A") + "\n"
                + "• Email: " + (studentEmail != null ? studentEmail : "N/A") + "\n"
                + "• College: " + (college != null ? college : "N/A") + "\n"
                + "• Branch: " + (branch != null ? branch : "N/A") + "\n"
                + "• Year: " + (year != null ? year : "N/A") + "\n"
                + (requestedRole != null && !requestedRole.isBlank() ? "• Requested Role: " + requestedRole + "\n" : "")
                + "\nReview and manage this request on SanGam: " + appBaseUrl + "/teams\n\n"
                + "Best regards,\nSanGam Team";

        sendEmailAsync(leaderEmail, subject, content);
    }

    @Async
    public void sendJoinRequestAcceptedEmail(String studentEmail, String studentName, String teamName, String acceptedRole, String teamDescription) {
        if (studentEmail == null || studentEmail.isBlank()) return;
        String subject = "SanGam: Join Request Accepted for " + teamName;
        String content = "Congratulations " + (studentName != null ? studentName : "Student") + "!\n\n"
                + "Your join request for team \"" + teamName + "\" has been ACCEPTED!\n\n"
                + "Team Details:\n"
                + "• Team Name: " + teamName + "\n"
                + (acceptedRole != null && !acceptedRole.isBlank() ? "• Accepted Role: " + acceptedRole + "\n" : "")
                + (teamDescription != null && !teamDescription.isBlank() ? "• Description: " + teamDescription + "\n" : "")
                + "\nView your new team on SanGam: " + appBaseUrl + "/teams\n\n"
                + "Best regards,\nSanGam Team";

        sendEmailAsync(studentEmail, subject, content);
    }

    private void sendEmailAsync(String toEmail, String subject, String textContent) {
        if (brevoApiKey == null || brevoApiKey.isBlank() || senderEmail == null || senderEmail.isBlank()) {
            logger.warn("Brevo API key or sender email not configured. Skipping email notification to {}", maskEmail(toEmail));
            return;
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "sender", Map.of(
                            "name", "SanGam",
                            "email", senderEmail
                    ),
                    "to", List.of(
                            Map.of(
                                    "email", toEmail.trim().toLowerCase()
                            )
                    ),
                    "subject", subject,
                    "textContent", textContent
            );

            restClient.post()
                    .uri("/v3/smtp/email")
                    .header("api-key", brevoApiKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();

            logger.info("Notification email sent successfully to {}", maskEmail(toEmail));
        } catch (Exception ex) {
            // Safety: Email failure MUST NOT break the caller or throw exceptions
            logger.error("Failed to send notification email to {}: {}", maskEmail(toEmail), ex.getMessage());
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@", 2);
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) return local.charAt(0) + "***@" + domain;
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }
}
