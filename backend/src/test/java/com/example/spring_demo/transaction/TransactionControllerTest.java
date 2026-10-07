package com.example.spring_demo.transaction;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    @MockitoBean
    private TransactionService service;

    private Transaction createTransaction() {
        return new Transaction(
                new BigDecimal("250"),
                LocalDate.of(2026, 10, 6),
                "Groceries"
        );
    }

    private String objectAsJson(Object object) {
        try {
            return mapper.writeValueAsString(object);
        } catch (JacksonException e) {
            return "{}";
        }
    }

    @Test
    public void shouldCreateTransaction() throws Exception {
        Transaction transaction = createTransaction();
        when(service.create(any(Transaction.class))).thenReturn(transaction);

        mockMvc.perform(
                post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "amount": 10.00,
                                "date": "2026-10-06",
                                "description": "this is a description"
                            }
                        """))
                .andExpect(status().isCreated())
                .andExpect(content().json(objectAsJson(transaction)));

        verify(service).create(any(Transaction.class));
    }

    @Test
    public void shouldNotCreateTransactionWithInvalidArguments() throws Exception {
        mockMvc.perform(
                post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "amount": 10.00,
                                "date": "6767-13-36"
                            }
                        """))
                .andExpect(status().isBadRequest());

        verify(service, never()).create(any(Transaction.class));
    }

    @Test
    public void shouldFindTransactionById() throws Exception {
        Transaction transaction = createTransaction();
        when(service.findById(1L)).thenReturn(Optional.of(transaction));

        mockMvc.perform(get("/api/transactions/1"))
            .andExpect(status().isOk())
            .andExpect(content().json(objectAsJson(transaction)));

        verify(service).findById(1L);
    }

    @Test
    public void shouldFindAllTransactions() throws Exception {
        // Create 10 transactions
        double sum = 0;
        List<Transaction> transactions = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Transaction transaction = createTransaction();
            transaction.setAmount(BigDecimal.valueOf(sum += 10));
            transactions.add(transaction);
        }

        when(service.findAll()).thenReturn(transactions);

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(content().json(objectAsJson(transactions)));

        verify(service).findAll();
    }

    @Test
    public void shouldUpdateTransaction() throws Exception {
        Transaction transaction = createTransaction();
        when(service.update(eq(1L), any(Transaction.class))).thenReturn(transaction);

        mockMvc.perform(put("/api/transactions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                   {
                        "amount": 10.0,
                        "date": "2026-10-09",
                        "description": "Groceries"
                   }
                """))
                .andExpect(status().isOk())
                .andExpect(content().json(objectAsJson(transaction)));

        verify(service).update(eq(1L), any(Transaction.class));
    }

    @Test
    public void shouldNotUpdateTransactionWithInvalidArguments() throws Exception {
        mockMvc.perform(put("/api/transactions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                   {
                        "amount": 10.0,
                        "date": "2026-67-09",
                        "description": "Groceries"
                   }
                """))
                .andExpect(status().isBadRequest());

        verify(service, never()).update(eq(1L), any(Transaction.class));
    }

    @Test
    public void shouldReturnNotFoundWhenTransactionDoesNotExist() throws Exception {
        when(service.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/transactions/1"))
                .andExpect(status().isNotFound());

        verify(service).findById(1L);
    }
}