package com.example.spring_demo.transaction;

import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "test@example.com")
class TransactionFilteringTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    private void saveTransaction(
            String title,
            String description,
            LocalDate date
    ) {
        Transaction transaction = new Transaction();
        transaction.setAmount(new BigDecimal("10.00"));
        transaction.setDate(date);
        transaction.setTitle(title);
        transaction.setDescription(description);
        transaction.setUser(user);
        repository.save(transaction);
    }

    @Test
    void filtersByDateRangeInclusively() throws Exception {
        saveTransaction("January 1st", "", LocalDate.of(2026, 1, 1));
        saveTransaction("January 31st", "", LocalDate.of(2026, 1, 31));
        saveTransaction("February 1st", "", LocalDate.of(2026, 2, 1));

        mockMvc.perform(get("/api/transactions")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void filtersTitleCaseInsensitively() throws Exception {
        saveTransaction("Groceries", "", LocalDate.of(2026, 1, 1));
        saveTransaction("Salary", "", LocalDate.of(2026, 1, 2));

        mockMvc.perform(get("/api/transactions")
                        .param("title", "GROC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void percentInTitleFilterIsNotTreatedAsWildcard() throws Exception {
        saveTransaction("100% bonus", "", LocalDate.of(2026, 1, 1));
        saveTransaction("1000 salary", "", LocalDate.of(2026, 1, 2));

        mockMvc.perform(get("/api/transactions")
                        .param("title", "100%"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("100% bonus"));
    }

    @Test
    void underscoreInTitleFilterIsNotTreatedAsWildcard() throws Exception {
        saveTransaction("a_b", "", LocalDate.of(2026, 1, 1));
        saveTransaction("aXb", "", LocalDate.of(2026, 1, 2));

        mockMvc.perform(get("/api/transactions")
                        .param("title", "a_b"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("a_b"));
    }
}
