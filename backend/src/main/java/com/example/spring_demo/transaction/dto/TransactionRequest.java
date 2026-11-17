package com.example.spring_demo.transaction.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull @Digits(integer = 13, fraction = 2) BigDecimal amount,
        @NotNull LocalDate date,
        @NotBlank @Length(min=3, max=30) String title,
        @Length(max=300) String description
) {
}
