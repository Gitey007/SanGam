package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class EmailOtpServiceTest {

    private static final String API_KEY = "test-brevo-api-key";
    private static final String SENDER_EMAIL = "noreply@sangam.com";

    private MockRestServiceServer mockServer;
    private EmailOtpService emailOtpService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://api.brevo.com");
        mockServer = MockRestServiceServer.bindTo(builder).build();
        RestClient restClient = builder.build();

        emailOtpService = new EmailOtpService(API_KEY, SENDER_EMAIL, restClient);
    }

    @Test
    void testSendOtp_Success() {
        String email = "test@example.com";

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
                                    "email": "test@example.com"
                                }
                            ],
                            "subject": "SanGam Email Verification OTP"
                        }
                        """, false))
                .andRespond(withSuccess("{\"messageId\":\"<12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        emailOtpService.sendOtp(email);
        mockServer.verify();
    }

    @Test
    void testSendOtp_Failure_RemovesOtpAndThrowsException() {
        String email = "test@example.com";

        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            emailOtpService.sendOtp(email);
        });

        assertEquals("Unable to send OTP email", exception.getMessage());
        // Verify OTP was removed from store (no verification should succeed)
        assertFalse(emailOtpService.verifyOtp(email, "123456"));
        mockServer.verify();
    }

    @Test
    void testVerifyOtp_Flow() {
        String email = "user@example.com";
        AtomicReference<String> capturedOtp = new AtomicReference<>();

        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(request -> {
                    try {
                        String bodyString = ((MockClientHttpRequest) request).getBodyAsString();
                        JsonNode root = objectMapper.readTree(bodyString);
                        String textContent = root.get("textContent").asText();
                        String prefix = "Your SanGam OTP is: ";
                        int startIndex = textContent.indexOf(prefix) + prefix.length();
                        capturedOtp.set(textContent.substring(startIndex, startIndex + 6));
                    } catch (Exception e) {
                        throw new AssertionError("Failed to parse request body", e);
                    }
                })
                .andRespond(withSuccess("{\"messageId\":\"<12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        emailOtpService.sendOtp(email);
        mockServer.verify();

        String otp = capturedOtp.get();
        assertTrue(otp != null && otp.length() == 6, "OTP should be 6 digits");

        // Invalid OTP attempt
        assertFalse(emailOtpService.verifyOtp(email, "000000"));

        // Valid OTP attempt
        assertTrue(emailOtpService.verifyOtp(email, otp));

        // Reusing OTP should fail
        assertFalse(emailOtpService.verifyOtp(email, otp));
    }

    @Test
    void testVerifyOtp_MaxAttemptsExceeded() {
        String email = "attempt-test@example.com";

        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"messageId\":\"<12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        emailOtpService.sendOtp(email);

        for (int i = 0; i < 5; i++) {
            assertFalse(emailOtpService.verifyOtp(email, "00000" + i));
        }

        // 6th attempt should fail as max attempts (5) was exceeded
        assertFalse(emailOtpService.verifyOtp(email, "999999"));
    }

    @Test
    void testVerifyOtp_InvalidInputsAndNonExistent() {
        assertFalse(emailOtpService.verifyOtp(null, "123456"));
        assertFalse(emailOtpService.verifyOtp("test@example.com", null));
        assertFalse(emailOtpService.verifyOtp("unknown@example.com", "123456"));
    }

    @Test
    void testConsumeVerifiedEmail_Flow() {
        String email = "verified-flow@example.com";
        AtomicReference<String> capturedOtp = new AtomicReference<>();

        mockServer.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(request -> {
                    try {
                        String bodyString = ((MockClientHttpRequest) request).getBodyAsString();
                        JsonNode root = objectMapper.readTree(bodyString);
                        String textContent = root.get("textContent").asText();
                        String prefix = "Your SanGam OTP is: ";
                        int startIndex = textContent.indexOf(prefix) + prefix.length();
                        capturedOtp.set(textContent.substring(startIndex, startIndex + 6));
                    } catch (Exception e) {
                        throw new AssertionError("Failed to parse request body", e);
                    }
                })
                .andRespond(withSuccess("{\"messageId\":\"<12345@brevo.com>\"}", MediaType.APPLICATION_JSON));

        // Before OTP verification
        assertFalse(emailOtpService.isEmailVerified(email));
        assertFalse(emailOtpService.consumeVerifiedEmail(email));

        emailOtpService.sendOtp(email);
        mockServer.verify();

        String otp = capturedOtp.get();
        assertTrue(emailOtpService.verifyOtp(email, otp));

        // After successful OTP verification
        assertTrue(emailOtpService.isEmailVerified(email));

        // First consumption should succeed
        assertTrue(emailOtpService.consumeVerifiedEmail(email));

        // Second consumption should fail (consumed)
        assertFalse(emailOtpService.isEmailVerified(email));
        assertFalse(emailOtpService.consumeVerifiedEmail(email));
    }
}
