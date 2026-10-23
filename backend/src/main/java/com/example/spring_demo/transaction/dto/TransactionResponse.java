package com.example.spring_demo.transaction.dto;

import com.example.spring_demo.transaction.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        LocalDate date,
        String title,
        String description
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getDate(),
                transaction.getTitle(),
                transaction.getDescription()
        );
    }
}
