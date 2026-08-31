package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class EmailOtpServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailOtpService emailOtpService;

    @BeforeEach
    void setUp() {
        emailOtpService = new EmailOtpService(mailSender);
    }

    @Test
    void testSendOtp_Success() {
        String email = "test@example.com";
        emailOtpService.sendOtp(email);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage sentMessage = captor.getValue();
        assertTrue(sentMessage.getTo() != null && sentMessage.getTo()[0].equals("test@example.com"));
        assertTrue(sentMessage.getSubject().contains("SanGam Email Verification OTP"));
        assertTrue(sentMessage.getText().contains("Your SanGam OTP is: "));
    }

    @Test
    void testSendOtp_MailExceptionPropagated() {
        doThrow(new MailAuthenticationException("Authentication failed"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        assertThrows(MailAuthenticationException.class, () -> {
            emailOtpService.sendOtp("test@example.com");
        });
    }

    @Test
    void testVerifyOtp_Flow() {
        String email = "user@example.com";
        emailOtpService.sendOtp(email);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        String text = captor.getValue().getText();
        String prefix = "Your SanGam OTP is: ";
        int startIndex = text.indexOf(prefix) + prefix.length();
        String otp = text.substring(startIndex, startIndex + 6);

        // Invalid OTP attempt
        assertFalse(emailOtpService.verifyOtp(email, "000000"));

        // Valid OTP attempt
        assertTrue(emailOtpService.verifyOtp(email, otp));

        // Reusing OTP should fail
        assertFalse(emailOtpService.verifyOtp(email, otp));
    }
}
