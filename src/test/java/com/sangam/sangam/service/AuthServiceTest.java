package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sangam.sangam.dto.LoginRequest;
import com.sangam.sangam.dto.LoginResponse;
import com.sangam.sangam.dto.RegisterRequest;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.UserRepository;
import com.sangam.sangam.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private EmailOtpService emailOtpService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService, emailOtpService);
    }

    private RegisterRequest createSampleRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test Student");
        request.setEmail("student@college.edu");
        request.setPassword("password123");
        request.setCollege("Engineering College");
        request.setBranch("Computer Science");
        request.setYear((byte) 2);
        request.setBio("Passionate builder");
        return request;
    }

    // Scenario 1: Registration without OTP -> FAIL
    @Test
    void testRegister_WithoutOtp_Fails() {
        RegisterRequest request = createSampleRegisterRequest();
        request.setOtp(null);

        when(userRepository.existsByEmail("student@college.edu")).thenReturn(false);
        when(emailOtpService.consumeVerifiedEmail("student@college.edu")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("Email verification required"));
        verify(userRepository, never()).save(any(User.class));
    }

    // Scenario 2: Registration with wrong OTP -> FAIL
    @Test
    void testRegister_WithWrongOtp_Fails() {
        RegisterRequest request = createSampleRegisterRequest();
        request.setOtp("000000");

        when(userRepository.existsByEmail("student@college.edu")).thenReturn(false);
        when(emailOtpService.consumeVerifiedEmail("student@college.edu")).thenReturn(false);
        when(emailOtpService.verifyOtp("student@college.edu", "000000")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("Email verification required"));
        verify(userRepository, never()).save(any(User.class));
    }

    // Scenario 3: Registration with expired OTP -> FAIL
    @Test
    void testRegister_WithExpiredOtp_Fails() {
        RegisterRequest request = createSampleRegisterRequest();
        request.setOtp("123456");

        when(userRepository.existsByEmail("student@college.edu")).thenReturn(false);
        when(emailOtpService.consumeVerifiedEmail("student@college.edu")).thenReturn(false);
        // verifyOtp returns false for expired OTP
        when(emailOtpService.verifyOtp("student@college.edu", "123456")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("Email verification required"));
        verify(userRepository, never()).save(any(User.class));
    }

    // Scenario 4: Registration with empty OTP and no pre-verification -> FAIL
    @Test
    void testRegister_WithEmptyOtp_Fails() {
        RegisterRequest request = createSampleRegisterRequest();
        request.setOtp("   ");

        when(userRepository.existsByEmail("student@college.edu")).thenReturn(false);
        when(emailOtpService.consumeVerifiedEmail("student@college.edu")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getMessage().contains("Email verification required"));
        verify(userRepository, never()).save(any(User.class));
    }

    // Scenario 5: Registration with correct OTP (pre-verified or in request) -> SUCCESS
    @Test
    void testRegister_WithPreVerifiedOtp_Success() {
        RegisterRequest request = createSampleRegisterRequest();

        when(userRepository.existsByEmail("student@college.edu")).thenReturn(false);
        when(emailOtpService.consumeVerifiedEmail("student@college.edu")).thenReturn(true);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPasswordHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registeredUser = authService.register(request);

        assertNotNull(registeredUser);
        assertEquals("Test Student", registeredUser.getName());
        assertEquals("student@college.edu", registeredUser.getEmail());
        assertEquals("encodedPasswordHash", registeredUser.getPasswordHash());
        assertTrue(registeredUser.getEmailVerified());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertTrue(userCaptor.getValue().getEmailVerified());
    }

    @Test
    void testRegister_WithInlineOtp_Success() {
        RegisterRequest request = createSampleRegisterRequest();
        request.setOtp("654321");

        when(userRepository.existsByEmail("student@college.edu")).thenReturn(false);
        when(emailOtpService.consumeVerifiedEmail("student@college.edu")).thenReturn(false, true);
        when(emailOtpService.verifyOtp("student@college.edu", "654321")).thenReturn(true);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPasswordHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registeredUser = authService.register(request);

        assertNotNull(registeredUser);
        assertEquals("student@college.edu", registeredUser.getEmail());
        assertTrue(registeredUser.getEmailVerified());
        verify(userRepository).save(any(User.class));
    }

    // Scenario 6: Verification state cannot be reused
    @Test
    void testRegister_CannotReuseVerificationState() {
        RegisterRequest request = createSampleRegisterRequest();

        when(userRepository.existsByEmail("student@college.edu")).thenReturn(false);
        // First call consumes verified state; subsequent call returns false
        when(emailOtpService.consumeVerifiedEmail("student@college.edu")).thenReturn(true, false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // First registration succeeds
        User user1 = authService.register(request);
        assertNotNull(user1);

        // Second registration attempt fails because verified state was consumed
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });
        assertTrue(ex.getMessage().contains("Email verification required"));
    }

    // Scenario 7: Existing Email OTP LOGIN continues to work
    @Test
    void testLoginWithEmail_ExistingUser_Success() {
        String email = "existing@college.edu";
        User user = new User();
        user.setId(10L);
        user.setName("Existing User");
        user.setEmail(email);
        user.setPasswordHash("hashedPassword");
        user.setCollege("Tech College");
        user.setBranch("IT");
        user.setYear((byte) 3);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any())).thenReturn("mock-jwt-token");

        LoginResponse response = authService.loginWithEmail(email);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals(10L, response.getId());
        assertEquals("Existing User", response.getName());
        assertEquals(email, response.getEmail());
    }

    @Test
    void testLoginWithEmailIfExists_ExistingUser_ReturnsOptionalResponse() {
        String email = "existing@college.edu";
        User user = new User();
        user.setId(10L);
        user.setName("Existing User");
        user.setEmail(email);
        user.setPasswordHash("hashedPassword");
        user.setYear((byte) 3);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any())).thenReturn("mock-jwt-token");

        Optional<LoginResponse> response = authService.loginWithEmailIfExists(email);

        assertTrue(response.isPresent());
        assertEquals("mock-jwt-token", response.get().getToken());
    }

    @Test
    void testLoginWithEmailIfExists_NonExistingUser_ReturnsEmpty() {
        String email = "newuser@college.edu";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        Optional<LoginResponse> response = authService.loginWithEmailIfExists(email);

        assertFalse(response.isPresent());
    }

    // Scenario 8: Password login continues to work
    @Test
    void testPasswordLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@college.edu");
        request.setPassword("correctPassword");

        User user = new User();
        user.setId(5L);
        user.setName("John Doe");
        user.setEmail("user@college.edu");
        user.setPasswordHash("encodedHash");
        user.setCollege("University");
        user.setBranch("CS");
        user.setYear((byte) 4);

        when(userRepository.findByEmail("user@college.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctPassword", "encodedHash")).thenReturn(true);
        when(jwtService.generateToken(any())).thenReturn("jwt-password-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-password-token", response.getToken());
        assertEquals("John Doe", response.getName());
    }

    @Test
    void testPasswordLogin_WrongPassword_Fails() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@college.edu");
        request.setPassword("wrongPassword");

        User user = new User();
        user.setEmail("user@college.edu");
        user.setPasswordHash("encodedHash");

        when(userRepository.findByEmail("user@college.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedHash")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.login(request);
        });

        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void testRegister_ExistingEmail_Fails() {
        RegisterRequest request = createSampleRegisterRequest();
        when(userRepository.existsByEmail("student@college.edu")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });

        assertEquals("Email already registered", ex.getMessage());
        verify(emailOtpService, never()).consumeVerifiedEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}
