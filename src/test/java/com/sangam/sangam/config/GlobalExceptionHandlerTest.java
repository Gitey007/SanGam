package com.sangam.sangam.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleMailException_MailAuthenticationException() {
        MailAuthenticationException ex = new MailAuthenticationException("535-5.7.8 Username and Password not accepted");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleMailException(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(503, response.getBody().get("status"));
        assertEquals("Mail Service Error", response.getBody().get("error"));
        assertEquals("Unable to send email OTP. Please check SMTP configuration or try again later.", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    void testHandleMailException_MailSendException() {
        MailSendException ex = new MailSendException("Mail server connection failed");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleMailException(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(503, response.getBody().get("status"));
        assertEquals("Mail Service Error", response.getBody().get("error"));
        assertEquals("Unable to send email OTP. Please check SMTP configuration or try again later.", response.getBody().get("message"));
    }
}
