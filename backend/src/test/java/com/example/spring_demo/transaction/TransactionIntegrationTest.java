package com.example.spring_demo.transaction;

import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "test@example.com")
class TransactionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper mapper;

    private User user;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        userRepository.deleteAll();

        user = userRepository.save(
                new User(
                        "test@example.com",
                        passwordEncoder.encode("password")
                )
        );
    }

    private String objectAsJson(Object object) throws Exception {
        return mapper.writeValueAsString(object);
    }

    private Transaction createTransaction(
            BigDecimal amount,
            LocalDate date,
            String title,
            String description
    ) {
        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setDate(date);
        transaction.setTitle(title);
        transaction.setDescription(description);
        transaction.setUser(user);
        return transaction;
    }

    @Test
    void shouldCreateTransactionOnPost() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 1.00,
                                    "date": "2026-10-06",
                                    "title": "Groceries",
                                    "description": ""
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.amount").value(1.00))
                .andExpect(jsonPath("$.title").value("Groceries"));

        List<Transaction> transactions = repository.findAll();

        assertThat(transactions).hasSize(1);
        assertNotNull(transactions.get(0).getId());
        assertEquals(user.getId(), transactions.get(0).getUser().getId());
        assertEquals(new BigDecimal("1.00"), transactions.get(0).getAmount());
        assertEquals(LocalDate.of(2026, 10, 6), transactions.get(0).getDate());
    }

    @Test
    void shouldNotUseIdSpecifiedByUser() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "id": 100000000000,
                                    "amount": 10.00,
                                    "date": "2026-10-06",
                                    "title": "Groceries",
                                    "description": ""
                                }
                                """))
                .andExpect(status().isCreated());

        Transaction saved = repository.findAll().get(0);

        assertNotNull(saved.getId());
        assertThat(saved.getId()).isNotEqualTo(100000000000L);
    }

    @Test
    void shouldFindAllOnGet() throws Exception {
        List<Transaction> transactions = new ArrayList<>();

        for (int i = 1; i <= 10; i++) {
            transactions.add(createTransaction(
                    BigDecimal.valueOf(i * 10L, 2),
                    LocalDate.now(),
                    "Transaction",
                    "Groceries"
            ));
        }

        repository.saveAll(transactions);

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.totalElements").value(10));
    }

    @Test
    void shouldReturnEmptyPageOnGetIfEmpty() throws Exception {
        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void shouldFindById() throws Exception {
        Transaction transaction = repository.save(createTransaction(
                new BigDecimal("10.00"),
                LocalDate.parse("2013-04-12"),
                "Groceries",
                ""
        ));

        mockMvc.perform(get("/api/transactions/{id}", transaction.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(transaction.getId()))
                .andExpect(jsonPath("$.amount").value(10.00))
                .andExpect(jsonPath("$.title").value("Groceries"))
                .andExpect(jsonPath("$.date").value("2013-04-12"));
    }

    @Test
    void shouldUpdateTransaction() throws Exception {
        Transaction transaction = repository.save(createTransaction(
                new BigDecimal("5.00"),
                LocalDate.parse("2018-02-28"),
                "Groceries",
                ""
        ));

        mockMvc.perform(put("/api/transactions/{id}", transaction.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 10.00,
                                    "date": "2026-10-05",
                                    "title": "Groceries",
                                    "description": ""
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(10.00))
                .andExpect(jsonPath("$.date").value("2026-10-05"))
                .andExpect(jsonPath("$.title").value("Groceries"));

        Transaction saved = repository.findById(transaction.getId())
                .orElseThrow();

        assertEquals(new BigDecimal("10.00"), saved.getAmount());
        assertEquals(LocalDate.of(2026, 10, 5), saved.getDate());
        assertEquals("Groceries", saved.getTitle());
        assertEquals(user.getId(), saved.getUser().getId());
    }

    @Test
    void shouldDeleteTransaction() throws Exception {
        Transaction transaction = repository.save(createTransaction(
                new BigDecimal("5.00"),
                LocalDate.parse("2018-02-28"),
                "Groceries",
                ""
        ));

        mockMvc.perform(delete("/api/transactions/{id}", transaction.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());

        assertThat(repository.findAll()).isEmpty();
    }

    @Test
    void updateTransactionShouldPersistAllChanges() throws Exception {
        Transaction existing = repository.saveAndFlush(createTransaction(
                new BigDecimal("25.00"),
                LocalDate.of(2026, 10, 1),
                "Old title",
                "Old description"
        ));

        Long id = existing.getId();

        mockMvc.perform(put("/api/transactions/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 99.50,
                                    "date": "2026-10-09",
                                    "title": "New title",
                                    "description": "New description"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New title"))
                .andExpect(jsonPath("$.amount").value(99.50))
                .andExpect(jsonPath("$.description").value("New description"));

        Transaction saved = repository.findById(id).orElseThrow();

        assertEquals("New title", saved.getTitle());
        assertEquals(new BigDecimal("99.50"), saved.getAmount());
        assertEquals(LocalDate.of(2026, 10, 9), saved.getDate());
        assertEquals("New description", saved.getDescription());
        assertEquals(user.getId(), saved.getUser().getId());
    }

    @Test
    void shouldNotReturnAnotherUsersTransaction() throws Exception {
        User anotherUser = userRepository.save(
                new User(
                        "another@example.com",
                        passwordEncoder.encode("password")
                )
        );

        Transaction otherTransaction = new Transaction();
        otherTransaction.setAmount(new BigDecimal("15.00"));
        otherTransaction.setDate(LocalDate.of(2026, 10, 10));
        otherTransaction.setTitle("Private transaction");
        otherTransaction.setDescription("");
        otherTransaction.setUser(anotherUser);

        otherTransaction = repository.saveAndFlush(otherTransaction);

        mockMvc.perform(get(
                        "/api/transactions/{id}",
                        otherTransaction.getId()
                ))
                .andExpect(status().isNotFound());
    }

    // --- Error mapping: unhandled domain exceptions ---

    @Test
    void shouldReturnNotFoundWhenUpdatingMissingTransaction() throws Exception {
        mockMvc.perform(put("/api/transactions/{id}", 999_999L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 10.00,
                                    "date": "2026-10-06",
                                    "title": "Groceries",
                                    "description": ""
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingAnotherUsersTransaction() throws Exception {
        User anotherUser = userRepository.save(
                new User(
                        "another@example.com",
                        passwordEncoder.encode("password")
                )
        );

        Transaction otherTransaction = new Transaction();
        otherTransaction.setAmount(new BigDecimal("15.00"));
        otherTransaction.setDate(LocalDate.of(2026, 10, 10));
        otherTransaction.setTitle("Private transaction");
        otherTransaction.setDescription("");
        otherTransaction.setUser(anotherUser);

        Long id = repository.saveAndFlush(otherTransaction).getId();

        mockMvc.perform(put("/api/transactions/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 1.00,
                                    "date": "2026-10-11",
                                    "title": "Hijacked",
                                    "description": ""
                                }
                                """))
                .andExpect(status().isNotFound());

        Transaction unchanged = repository.findById(id).orElseThrow();
        assertEquals("Private transaction", unchanged.getTitle());
        assertEquals(new BigDecimal("15.00"), unchanged.getAmount());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingTransaction() throws Exception {
        mockMvc.perform(delete("/api/transactions/{id}", 999_999L)
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingAnotherUsersTransaction() throws Exception {
        User anotherUser = userRepository.save(
                new User(
                        "another@example.com",
                        passwordEncoder.encode("password")
                )
        );

        Transaction otherTransaction = new Transaction();
        otherTransaction.setAmount(new BigDecimal("15.00"));
        otherTransaction.setDate(LocalDate.of(2026, 10, 10));
        otherTransaction.setTitle("Private transaction");
        otherTransaction.setDescription("");
        otherTransaction.setUser(anotherUser);

        Long id = repository.saveAndFlush(otherTransaction).getId();

        mockMvc.perform(delete("/api/transactions/{id}", id)
                        .with(csrf()))
                .andExpect(status().isNotFound());

        assertThat(repository.findById(id)).isPresent();
    }

    // --- Amount scale: RoundingMode.UNNECESSARY throws ArithmeticException ---

    @Test
    void shouldRejectAmountWithMoreThanTwoDecimalsOnCreate() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 10.999,
                                    "date": "2026-10-06",
                                    "title": "Groceries",
                                    "description": ""
                                }
                                """))
                .andExpect(status().isBadRequest());

        assertThat(repository.findAll()).isEmpty();
    }

    @Test
    void shouldRejectAmountWithMoreThanTwoDecimalsOnUpdate() throws Exception {
        Transaction transaction = repository.saveAndFlush(createTransaction(
                new BigDecimal("10.00"),
                LocalDate.of(2026, 10, 6),
                "Groceries",
                ""
        ));

        mockMvc.perform(put("/api/transactions/{id}", transaction.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 10.999,
                                    "date": "2026-10-06",
                                    "title": "Groceries",
                                    "description": ""
                                }
                                """))
                .andExpect(status().isBadRequest());

        Transaction unchanged = repository.findById(transaction.getId()).orElseThrow();
        assertEquals(new BigDecimal("10.00"), unchanged.getAmount());
    }

    // --- Nullable description ---

    @Test
    void shouldCreateTransactionWhenDescriptionIsOmitted() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 10.00,
                                    "date": "2026-10-06",
                                    "title": "Groceries"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value(""));

        assertEquals("", repository.findAll().get(0).getDescription());
    }

    @Test
    void shouldCreateTransactionWhenDescriptionIsNull() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "amount": 10.00,
                                    "date": "2026-10-06",
                                    "title": "Groceries",
                                    "description": null
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value(""));

        assertEquals("", repository.findAll().get(0).getDescription());
    }

    // --- Sorting by a property that does not exist ---

    @Test
    void shouldRejectSortByUnknownProperty() throws Exception {
        mockMvc.perform(get("/api/transactions")
                        .param("sort", "doesNotExist,asc"))
                .andExpect(status().isBadRequest());
    }
}