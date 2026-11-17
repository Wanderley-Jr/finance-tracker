package com.example.spring_demo.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() {
        super("Password exceeds 72-byte limit");
    }
}
