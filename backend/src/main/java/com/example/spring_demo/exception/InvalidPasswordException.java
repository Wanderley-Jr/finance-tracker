package com.example.spring_demo.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException(String password) {
        super("Password exceeds 72-byte limit: " + password);
    }
}
