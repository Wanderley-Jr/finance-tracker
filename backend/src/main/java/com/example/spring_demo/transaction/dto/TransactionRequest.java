package com.example.spring_demo.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDate date,
        @NotBlank String title,
        String description
) {
}
