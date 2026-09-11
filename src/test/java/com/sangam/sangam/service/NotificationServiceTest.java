package com.sangam.sangam.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.sangam.sangam.dto.NotificationResponse;
import com.sangam.sangam.entity.Notification;
import com.sangam.sangam.entity.User;
import com.sangam.sangam.repository.NotificationRepository;
import com.sangam.sangam.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    private NotificationService notificationService;

    private User user;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, userRepository);

        user = new User();
        user.setId(100L);
        user.setName("Test Student");
        user.setEmail("student@college.edu");
    }

    @Test
    void createNotification_SavesNotificationSuccessfully() {
        notificationService.createNotification(
                user,
                "Invitation Revoked",
                "This team has reached capacity.",
                "INVITATION_REVOKED",
                10L,
                "CodeCrafters");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertNotNull(saved);
        assertEquals(user, saved.getUser());
        assertEquals("Invitation Revoked", saved.getTitle());
        assertEquals("This team has reached capacity.", saved.getMessage());
        assertEquals("INVITATION_REVOKED", saved.getType());
        assertEquals(10L, saved.getTeamId());
        assertEquals("CodeCrafters", saved.getTeamName());
    }

    @Test
    void createNotification_IgnoresNullArguments() {
        notificationService.createNotification(null, "Title", "Message", "TYPE", 1L, "Team");
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void getUserNotifications_ReturnsMappedNotifications() {
        when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(user));

        Notification n = new Notification(user, "Title 1", "Msg 1", "TYPE", 10L, "Team A");
        n.setId(1L);
        n.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(n));

        List<NotificationResponse> responses = notificationService.getUserNotifications("student@college.edu");
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(1L, responses.get(0).getId());
        assertEquals("Title 1", responses.get(0).getTitle());
        assertEquals("Msg 1", responses.get(0).getMessage());
        assertEquals(10L, responses.get(0).getTeamId());
    }

    @Test
    void getUserNotifications_ThrowsUnauthorizedWhenEmailEmpty() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> notificationService.getUserNotifications(""));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void deleteNotification_DeletesForAuthenticatedUser() {
        when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(user));

        notificationService.deleteNotification(5L, "student@college.edu");

        verify(notificationRepository).deleteByIdAndUserId(5L, 100L);
    }

    @Test
    void clearAllNotifications_DeletesAllForAuthenticatedUser() {
        when(userRepository.findByEmail("student@college.edu")).thenReturn(Optional.of(user));

        notificationService.clearAllNotifications("student@college.edu");

        verify(notificationRepository).deleteByUserId(100L);
    }
}
