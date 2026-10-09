package com.example.spring_demo.transaction;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.hamcrest.Matchers.comparesEqualTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TransactionIntegrationTest {
	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private TransactionRepository repository;

	@Autowired
	private ObjectMapper mapper;

	private String objectAsJson(Object object) {
		try {
			return mapper.writeValueAsString(object);
		} catch (JacksonException e) {
			return "";
		}
	}

	@BeforeEach
	public void cleanRepository() {
		repository.deleteAll();
	}

	@Test
	public void shouldCreateTransactionOnPost() throws Exception {
		Transaction transaction = new Transaction(BigDecimal.valueOf(100, 2), LocalDate.now(), "Groceries");

		mockMvc.perform(post("/api/transactions")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectAsJson(transaction)))
				.andExpect(status().isCreated());

		List<Transaction> transactions = repository.findAll();

		assertNotNull(transactions.get(0).getId());

		assertThat(transactions.get(0))
			.usingRecursiveComparison()
			.ignoringFields("id")
			.isEqualTo(transaction);
	}

	@Test
	public void shouldNotUseIdSpecifiedByUser() throws Exception {
		mockMvc.perform(
						post("/api/transactions")
								.contentType(MediaType.APPLICATION_JSON)
								.content("""
                            {
                                "id": 100000000000,
                                "amount": 10.00,
                                "date": "2026-10-06",
                                "title": "this is a description"
                            }
                        """))
				.andExpect(status().isCreated());

		assertThat(repository.findAll().get(0).getId()).isNotEqualTo(100000000000L);
	}

	@Test
	public void shouldFindAllOnGet() throws Exception {
		int sum = 0;
		List<Transaction> transactions = new ArrayList<>();
		for (int i = 0; i < 10; i++) {
			Transaction transaction = new Transaction();
			transactions.add(transaction);
			transaction.setAmount(BigDecimal.valueOf(sum += 10, 2));
			transaction.setDate(LocalDate.now());
			transaction.setTitle("Transaction");
			transaction.setDescription("Groceries");
			repository.save(transaction);
		}

		mockMvc.perform(get("/api/transactions"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(10))
				.andExpect(content().json(objectAsJson(transactions)));
	}

	@Test
	public void shouldReturnEmptyListOnGetIfEmpty() throws Exception {
		mockMvc.perform(get("/api/transactions"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	public void shouldFindById() throws Exception {
		Transaction transaction = new Transaction(new BigDecimal(10), LocalDate.parse("2013-04-12"), "Groceries");
		repository.save(transaction);

		mockMvc.perform(get("/api/transactions/1"))
				.andExpect(status().isOk())
				.andExpect(content().json(objectAsJson(transaction)));
	}

	@Test
	public void shouldUpdateTransaction() throws Exception {
		Transaction transaction = new Transaction(BigDecimal.valueOf(500, 2), LocalDate.parse("2018-02-28"), "Groceries");
		transaction = repository.save(transaction);
		long id = transaction.getId();

		mockMvc.perform(put("/api/transactions/" + id)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
							{
								"amount": 10.00,
								"date": "2026-10-05",
								"title": "Groceries"
							}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.amount").value("10.0"));
	}

	@Test
	public void shouldDeleteTransaction() throws Exception {
		Transaction transaction = new Transaction(BigDecimal.valueOf(500, 2), LocalDate.parse("2018-02-28"), "Groceries");
		transaction = repository.save(transaction);
		long id = transaction.getId();

		mockMvc.perform(delete("/api/transactions/" + id))
				.andExpect(status().isNoContent());

		assertThat(repository.findAll().size()).isEqualTo(0);
	}

	@Test
	void updateTransactionShouldPersistAllChanges() throws Exception {
		// Arrange: save an existing transaction
		Transaction existing = new Transaction();
		existing.setAmount(new BigDecimal("25.00"));
		existing.setDate(LocalDate.of(2026, 10, 1));
		existing.setTitle("Old title");
		existing.setDescription("Old description");

		existing = repository.saveAndFlush(existing);

		Long id = existing.getId();

		// Build the updated transaction
		Transaction updated = new Transaction();
		updated.setAmount(new BigDecimal("99.50"));
		updated.setDate(LocalDate.of(2026, 10, 9));
		updated.setTitle("New title");
		updated.setDescription("New description");

		mockMvc.perform(put("/api/transactions/{id}", id)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(updated)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("New title"))
				.andExpect(jsonPath("$.amount").value(99.50))
				.andExpect(jsonPath("$.description").value("New description"));

		// Assert: verify the database actually changed
		Transaction saved = repository.findById(id).orElseThrow();

		assertEquals("New title", saved.getTitle());
		assertEquals(new BigDecimal("99.50"), saved.getAmount());
		assertEquals(LocalDate.of(2026, 10, 9), saved.getDate());
		assertEquals("New description", saved.getDescription());
	}
}
