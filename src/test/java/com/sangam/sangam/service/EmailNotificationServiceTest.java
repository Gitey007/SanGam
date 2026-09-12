package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class EmailNotificationServiceTest {

    private static final String API_KEY = "test-brevo-api-key";
    private static final String SENDER_EMAIL = "noreply@sangam.com";
    private static final String APP_BASE_URL = "https://san-gam.vercel.app";

    private MockRestServiceServer mockServer;
    private EmailNotificationService emailNotificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://api.brevo.com");
        mockServer = MockRestServiceServer.bindTo(builder).build();
        RestClient restClient = builder.build();

        emailNotificationService = new EmailNotificationService(API_KEY, SENDER_EMAIL, APP_BASE_URL, restClient);
    }

    @Test
    @DisplayName("Send team invitation email dispatches correct payload to Brevo API")
    void testSendTeamInvitationEmail_Success() {
        String studentEmail = "student@college.edu";
        String studentName = "Alice";
        String teamName = "Team Alpha";
        String leaderName = "Bob Leader";
        String invitedRole = "Frontend Developer";

        AtomicReference<String> capturedBody = new AtomicReference<>();

        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", API_KEY))
                .andExpect(header("Accept", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(header("Content-Type", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(content().json("""
                        {
                            "sender": {
                                "name": "SanGam",
                                "email": "noreply@sangam.com"
                            },
                            "to": [
                                {
                                    "email": "student@college.edu"
                                }
                            ],
                            "subject": "You've been invited to join Team Alpha on SanGam"
                        }
                        """, false))
                .andExpect(request -> {
                    try {
                        String bodyString = ((MockClientHttpRequest) request).getBodyAsString();
                        capturedBody.set(bodyString);
                        JsonNode root = objectMapper.readTree(bodyString);
                        String textContent = root.get("textContent").asText();
                        assertTrue(textContent.contains("Alice"));
                        assertTrue(textContent.contains("Bob Leader"));
                        assertTrue(textContent.contains("Team Alpha"));
                        assertTrue(textContent.contains("Frontend Developer"));
                        assertTrue(textContent.contains(APP_BASE_URL + "/teams"));
                    } catch (Exception e) {
                        throw new AssertionError("Failed to parse request body", e);
                    }
                })
                .andRespond(withSuccess("{\"messageId\":\"<inv-12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        emailNotificationService.sendTeamInvitationEmail(studentEmail, studentName, teamName, leaderName, invitedRole);
        mockServer.verify();
    }

    @Test
    @DisplayName("Send team invitation email with null or blank email does nothing")
    void testSendTeamInvitationEmail_NullOrBlankEmail() {
        emailNotificationService.sendTeamInvitationEmail(null, "Alice", "Team Alpha", "Bob", "Role");
        emailNotificationService.sendTeamInvitationEmail("   ", "Alice", "Team Alpha", "Bob", "Role");

        // mockServer has no expectations and verify should pass
        mockServer.verify();
    }

    @Test
    @DisplayName("Send team invitation email skips when Brevo API key or sender email is not configured")
    void testSendTeamInvitationEmail_MissingConfig() {
        RestClient restClient = RestClient.builder().baseUrl("https://api.brevo.com").build();
        EmailNotificationService unconfiguredService = new EmailNotificationService("", "", APP_BASE_URL, restClient);

        assertDoesNotThrow(() -> {
            unconfiguredService.sendTeamInvitationEmail("student@college.edu", "Alice", "Team Alpha", "Bob", "Role");
        });
    }

    @Test
    @DisplayName("Send team invitation email handles server error safely without throwing")
    void testSendTeamInvitationEmail_ServerErrorHandledSafely() {
        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        assertDoesNotThrow(() -> {
            emailNotificationService.sendTeamInvitationEmail("student@college.edu", "Alice", "Team Alpha", "Bob", "Role");
        });

        mockServer.verify();
    }

    @Test
    @DisplayName("Send join request submitted email dispatches correct payload")
    void testSendJoinRequestSubmittedEmail_Success() {
        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", API_KEY))
                .andExpect(content().json("""
                        {
                            "sender": {
                                "name": "SanGam",
                                "email": "noreply@sangam.com"
                            },
                            "to": [
                                {
                                    "email": "applicant@college.edu"
                                }
                            ],
                            "subject": "SanGam: Join Request Submitted for Team Beta"
                        }
                        """, false))
                .andRespond(withSuccess("{\"messageId\":\"<sub-12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        emailNotificationService.sendJoinRequestSubmittedEmail("applicant@college.edu", "Charlie", "Team Beta", "Backend Developer");
        mockServer.verify();
    }

    @Test
    @DisplayName("Send join request received email dispatches to leader with applicant details")
    void testSendJoinRequestReceivedEmail_Success() {
        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", API_KEY))
                .andExpect(content().json("""
                        {
                            "sender": {
                                "name": "SanGam",
                                "email": "noreply@sangam.com"
                            },
                            "to": [
                                {
                                    "email": "leader@college.edu"
                                }
                            ],
                            "subject": "SanGam: New Join Request for Team Beta"
                        }
                        """, false))
                .andExpect(request -> {
                    try {
                        String bodyString = ((MockClientHttpRequest) request).getBodyAsString();
                        JsonNode root = objectMapper.readTree(bodyString);
                        String textContent = root.get("textContent").asText();
                        assertTrue(textContent.contains("Applicant Details:"));
                        assertTrue(textContent.contains("Charlie"));
                        assertFalse(textContent.contains("applicant@college.edu"));
                        assertTrue(textContent.contains("Engineering College"));
                        assertTrue(textContent.contains("CSE"));
                        assertTrue(textContent.contains("Backend Developer"));
                    } catch (Exception e) {
                        throw new AssertionError("Failed to parse request body", e);
                    }
                })
                .andRespond(withSuccess("{\"messageId\":\"<rec-12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        emailNotificationService.sendJoinRequestReceivedEmail(
                "leader@college.edu", "Bob Leader", "Charlie", "applicant@college.edu",
                "Engineering College", "CSE", (byte) 3, "Team Beta", "Backend Developer");
        mockServer.verify();
    }

    @Test
    @DisplayName("Send join request accepted email dispatches acceptance notification")
    void testSendJoinRequestAcceptedEmail_Success() {
        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", API_KEY))
                .andExpect(content().json("""
                        {
                            "sender": {
                                "name": "SanGam",
                                "email": "noreply@sangam.com"
                            },
                            "to": [
                                {
                                    "email": "applicant@college.edu"
                                }
                            ],
                            "subject": "SanGam: Join Request Accepted for Team Beta"
                        }
                        """, false))
                .andRespond(withSuccess("{\"messageId\":\"<acc-12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        emailNotificationService.sendJoinRequestAcceptedEmail(
                "applicant@college.edu", "Charlie", "Team Beta", "Backend Developer", "A great project");
        mockServer.verify();
    }
}
