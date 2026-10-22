package com.example.spring_demo.auth;

import com.example.spring_demo.auth.dtos.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    public void register(@Valid RegisterRequest request) {

    }
}
