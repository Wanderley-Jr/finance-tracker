package com.example.spring_demo.exception;

public class InvalidSortFieldException extends RuntimeException {
    public InvalidSortFieldException(String field) { super("Invalid sort field: " + field); }
}
