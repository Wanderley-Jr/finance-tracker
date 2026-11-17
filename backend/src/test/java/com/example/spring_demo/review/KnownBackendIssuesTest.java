package com.example.spring_demo.review;

import com.example.spring_demo.transaction.TransactionRepository;
import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Reproductions of issues found in the second and third review passes. All of
 * them were written against the real HTTP behaviour of {@code src/main} before
 * the corresponding production fix and are kept as regression tests.
 *
 * <p>These are intentionally separate from the original bug reproductions in
 * {@code AuthControllerTest}/{@code TransactionIntegrationTest}: those pin the
 * first-pass bugs, while these cover the payload limits, the UTF-8 password
 * bound and the locale-sensitive searches found later.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
class KnownBackendIssuesTest {

    private static final String VALID_TITLE = "Groceries";
    private static final String VALID_DATE = "2026-10-06";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Locale originalLocale = Locale.getDefault();

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(new User(
                "test@example.com",
                passwordEncoder.encode("password")
        ));
    }

    @AfterEach
    void restoreLocale() {
        Locale.setDefault(originalLocale);
    }

    private String transactionJson(String title, String description) {
        return """
                {
                    "amount": 10.00,
                    "date": "%s",
                    "title": "%s",
                    "description": "%s"
                }
                """.formatted(VALID_DATE, title, description);
    }

    // --- Payload limits that used to fit the DTO but not the column ---

    private static final int TITLE_MAX_LENGTH = 30;
    private static final int DESCRIPTION_MAX_LENGTH = 300;

    @Nested
    @WithMockUser(username = "test@example.com")
    @DisplayName("transaction payload limits")
    class TransactionPayloadLimits {

        @Test
        @DisplayName("a title longer than 30 chars is rejected with 400")
        void titleLongerThanTheLimitIsRejectedAsBadRequest() throws Exception {
            // Product limit: title <= 30 chars (matches the form's maxLength).
            // Before the fix TransactionRequest.title only had @NotBlank, so a
            // 31-char title reached the database and was stored.
            mockMvc.perform(post("/api/transactions")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(transactionJson(
                                    "x".repeat(TITLE_MAX_LENGTH + 1),
                                    ""
                            )))
                    .andExpect(status().isBadRequest());

            org.assertj.core.api.Assertions.assertThat(transactionRepository.findAll()).isEmpty();
        }

        @Test
        @DisplayName("a 30-char title is accepted")
        void titleAtTheLimitIsAccepted() throws Exception {
            String title = "x".repeat(TITLE_MAX_LENGTH);

            mockMvc.perform(post("/api/transactions")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(transactionJson(title, "")))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.title").value(title));
        }

        @Test
        @DisplayName("a description longer than 300 chars is rejected with 400")
        void descriptionLongerThanTheLimitIsRejectedAsBadRequest() throws Exception {
            // Product limit: description <= 300 chars (matches the form's
            // maxLength). Before the fix there was no @Size on the DTO and the
            // column was varchar(255), so even 300 chars was a 500; a 301-char
            // one must be a validation error, not a 500.
            mockMvc.perform(post("/api/transactions")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(transactionJson(
                                    VALID_TITLE,
                                    "x".repeat(DESCRIPTION_MAX_LENGTH + 1)
                            )))
                    .andExpect(status().isBadRequest());

            org.assertj.core.api.Assertions.assertThat(transactionRepository.findAll()).isEmpty();
        }

        @Test
        @DisplayName("a 300-char description is accepted")
        void descriptionAtTheLimitIsAccepted() throws Exception {
            // A 300-char description must fit; the column used to default to
            // varchar(255), so this was a 500 until it was widened (length = 300).
            String description = "x".repeat(DESCRIPTION_MAX_LENGTH);

            mockMvc.perform(post("/api/transactions")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(transactionJson(VALID_TITLE, description)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.description").value(description));
        }
    }

    // --- Validation units: characters vs UTF-8 bytes ---

    @Nested
    @DisplayName("password validation")
    class PasswordValidation {

        @Test
        @DisplayName("a 24-emoji password (96 bytes) is rejected with 400, not a 500 from BCrypt")
        void multibytePasswordLongerThan72BytesIsRejectedAsBadRequest() throws Exception {
            // RegisterRequest.password is @Size(max = 72) characters, but BCrypt
            // limits input to 72 bytes. 24 emoji = 48 UTF-16 chars < 72, yet
            // 96 UTF-8 bytes, so before the UTF-8 guard the encoder threw
            // IllegalArgumentException and the request ended as a 500.
            String password = "\uD83D\uDE00".repeat(24);

            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                        "email": "emoji@example.com",
                                        "password": "%s"
                                    }
                                    """.formatted(password)))
                    .andExpect(status().isBadRequest());

            org.assertj.core.api.Assertions.assertThat(
                    userRepository.existsByEmailIgnoreCase("emoji@example.com")
            ).isFalse();
        }

        @Test
        @DisplayName("the rejected password is never echoed back in the error response")
        void rejectedPasswordIsNotLeakedInTheResponse() throws Exception {
            // InvalidPasswordException used to build its message with the raw
            // password ("Password exceeds 72-byte limit: <password>"), and
            // GlobalExceptionHandler copies that message into ProblemDetail.detail.
            // The plaintext secret therefore came back to the caller and was also
            // written to any log that recorded exception messages.
            String password = "\uD83D\uDE00".repeat(24);

            mockMvc.perform(post("/api/auth/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                        "email": "emoji@example.com",
                                        "password": "%s"
                                    }
                                    """.formatted(password)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.detail", not(containsString(password))));
        }
    }

    // --- Unhandled exception: there used to be no advice for UserNotFoundException ---

    @Test
    @WithMockUser(username = "ghost@example.com")
    @DisplayName("/api/auth/me with an unknown principal returns 404, not a 500")
    void unknownPrincipalReturnsNotFound() throws Exception {
        // GlobalExceptionHandler used to map InvalidSortField,
        // EmailAlreadyRegistered and TransactionNotFound, but not
        // UserNotFoundException, which AuthService.getCurrentUser throws for a
        // stale principal.
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isNotFound());
    }

    // --- Locale-sensitive lowercasing in the search filters ---

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("title search with an uppercase I is locale independent")
    void titleSearchIsNotLocaleSensitive() throws Exception {
        saveTransaction("INVOICE", "");
        Locale.setDefault(Locale.forLanguageTag("tr-TR"));

        // TransactionSpecs used String#toLowerCase() with the default locale.
        // In Turkish, "INVOICE" became "ınvoıce", which no longer matched the
        // database's lowercase("INVOICE") = "invoice".
        mockMvc.perform(get("/api/transactions").param("title", "INVOICE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    @DisplayName("description search with an uppercase I is locale independent")
    void descriptionSearchIsNotLocaleSensitive() throws Exception {
        saveTransaction(VALID_TITLE, "INVOICE");
        Locale.setDefault(Locale.forLanguageTag("tr-TR"));

        mockMvc.perform(get("/api/transactions").param("description", "INVOICE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    private void saveTransaction(String title, String description) {
        User user = userRepository.findByEmailIgnoreCase("test@example.com").orElseThrow();

        com.example.spring_demo.transaction.Transaction transaction =
                new com.example.spring_demo.transaction.Transaction();
        transaction.setAmount(new BigDecimal("10.00"));
        transaction.setDate(LocalDate.parse(VALID_DATE));
        transaction.setTitle(title);
        transaction.setDescription(description);
        transaction.setUser(user);

        transactionRepository.save(transaction);
    }
}
