package com.example.spring_demo.auth;

import com.example.spring_demo.auth.dto.RegisterRequest;
import com.example.spring_demo.auth.dto.UserResponse;
import com.example.spring_demo.exception.EmailAlreadyRegisteredException;
import com.example.spring_demo.exception.InvalidPasswordException;
import com.example.spring_demo.exception.UserNotFoundException;
import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import jakarta.transaction.Transactional;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        return new UserResponse(user.getId(), user.getEmail());
    }

    @Transactional
    public void register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyRegisteredException();
        }

        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new InvalidPasswordException();
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.password())
        );

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            if (isEmailUniqueConstraintViolation(ex)) {
                throw new EmailAlreadyRegisteredException();
            }
            throw ex;
        }
    }

    private boolean isEmailUniqueConstraintViolation(DataIntegrityViolationException ex) {
        Throwable cause = ex.getCause();
        while (cause != null) {
            if (cause instanceof ConstraintViolationException cve) {
                return "uk_users_email".equals(cve.getConstraintName());
            }

            cause = cause.getCause();
        }
        return false;
    }
}
