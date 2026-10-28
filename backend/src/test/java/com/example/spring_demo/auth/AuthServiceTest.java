package com.example.spring_demo.auth;

import com.example.spring_demo.auth.dto.RegisterRequest;
import com.example.spring_demo.exception.EmailAlreadyRegisteredException;
import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final AuthService authService =
            new AuthService(userRepository, passwordEncoder);

    @Test
    void rejectsEmailThatIsAlreadyRegistered() {
        when(userRepository.existsByEmailIgnoreCase("taken@example.com"))
                .thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("taken@example.com", "Password123!")
        )).isInstanceOf(EmailAlreadyRegisteredException.class);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void encodesPasswordBeforeSaving() {
        when(passwordEncoder.encode("Password123!")).thenReturn("bcrypt-hash");

        authService.register(
                new RegisterRequest("user@example.com", "Password123!")
        );

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(captor.capture());

        assertThat(captor.getValue().getPassword()).isEqualTo("bcrypt-hash");
    }

    @Test
    void savesCanonicalEmail() {
        authService.register(
                new RegisterRequest("  Test@Example.com  ", "Password123!")
        );

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);

        verify(userRepository).save(captor.capture());

        assertThat(captor.getValue().getEmail())
                .isEqualTo("test@example.com");
    }

    @Test
    void mapsConcurrentInsertViolationToConflict() {
        when(userRepository.existsByEmailIgnoreCase("race@example.com"))
                .thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("bcrypt-hash");
        doThrow(new DataIntegrityViolationException("duplicate key value"))
                .when(userRepository)
                .save(any(User.class));

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("race@example.com", "Password123!")
        )).isInstanceOf(EmailAlreadyRegisteredException.class);
    }
}
