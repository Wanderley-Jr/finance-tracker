package com.example.spring_demo.transaction;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
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

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
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
                "Groceries",
                ""
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
                                "title": "this is a description"
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
    void shouldReturnPageOfTransactions() throws Exception {
        List<Transaction> transactions = List.of(
                createTransaction(),
                createTransaction()
        );

        Page<Transaction> page = new PageImpl<>(
                transactions,
                PageRequest.of(0, 20),
                transactions.size()
        );

        when(service.getTransactions(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(20));

        verify(service).getTransactions(any(Specification.class), any(Pageable.class));
    }

    @Test
    void shouldPassPaginationAndSortingToService() throws Exception {
        when(service.getTransactions(any(Specification.class), any(Pageable.class)))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/api/transactions")
                        .param("page", "1")
                        .param("size", "5")
                        .param("sort", "amount,asc"))
                .andExpect(status().isOk());

        ArgumentCaptor<Pageable> pageableCaptor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(service).getTransactions(
                any(Specification.class),
                pageableCaptor.capture()
        );

        Pageable pageable = pageableCaptor.getValue();

        assertEquals(1, pageable.getPageNumber());
        assertEquals(5, pageable.getPageSize());
        assertEquals(Sort.Direction.ASC, pageable.getSort().getOrderFor("amount").getDirection());
    }

    @Test
    void shouldAcceptFilterParameters() throws Exception {
        when(service.getTransactions(any(Specification.class), any(Pageable.class)))
                .thenReturn(Page.empty());

        mockMvc.perform(get("/api/transactions")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-01-31")
                        .param("titleQuery", "rent")
                        .param("descriptionQuery", "apartment"))
                .andExpect(status().isOk());

        verify(service).getTransactions(any(Specification.class), any(Pageable.class));
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
                        "title": "Groceries"
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
                        "title": "Groceries"
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

    @Test
    public void supportsDateInIsoFormat() throws Exception {
        Transaction transaction = createTransaction();
        when(service.create(any(Transaction.class))).thenReturn(transaction);

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "amount": 400.00,
                        "date": "2026-03-21T00:00:00.000Z",
                        "title": "Groceries"
                    }
                """))
                .andExpect(status().isCreated());
    }
}