package com.example.spring_demo.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String user) {
        super("User " + user + " not found");
    }
}
