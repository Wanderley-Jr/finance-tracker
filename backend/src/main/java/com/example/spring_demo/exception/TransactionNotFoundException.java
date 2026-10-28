package com.example.spring_demo.exception;

public class TransactionNotFoundException extends RuntimeException {
    public TransactionNotFoundException(Long id) {
        super("Transaction with id " + id + " not found");
    }
}
