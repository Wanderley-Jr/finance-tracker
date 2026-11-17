package com.example.spring_demo.auth;

import com.example.spring_demo.auth.dto.RegisterRequest;
import com.example.spring_demo.auth.dto.UserResponse;
import com.example.spring_demo.exception.EmailAlreadyRegisteredException;
import com.example.spring_demo.exception.UserNotFoundException;
import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        Throwable cause = ex;

        System.out.println(cause);

        while (cause != null) {
            System.out.println("Exception: " + cause.getClass().getName());

            if (cause instanceof ConstraintViolationException cve) {
                System.out.println("Constraint name: " + cve.getConstraintName());

                return "uk_users_email".equals(cve.getConstraintName());
            }

            cause = cause.getCause();
        }

        return false;
    }
}
