package com.example.spring_demo.auth;

import com.example.spring_demo.user.User;
import com.example.spring_demo.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Locale;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.unauthenticated;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private String uniqueEmail() {
        return "test-" + UUID.randomUUID() + "@example.com";
    }

    private void registerUser(String email, String password)
            throws Exception {

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "%s",
                                    "password": "%s"
                                }
                                """.formatted(email, password)))
                .andExpect(status().isCreated());
    }

    @Test
    void registerCreatesUser() throws Exception {
        String email = uniqueEmail();
        String password = "TestPassword123!";

        registerUser(email, password);

        org.assertj.core.api.Assertions.assertThat(
                userRepository.existsByEmailIgnoreCase(email)
        ).isTrue();
    }

    @Test
    void registerRejectsInvalidRequest() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "not-an-email",
                                    "password": "123"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerRequiresCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "test@example.com",
                                    "password": "TestPassword123!"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginWithValidCredentialsAuthenticatesUser()
            throws Exception {

        String email = uniqueEmail();
        String password = "TestPassword123!";

        registerUser(email, password);

        MvcResult result = mockMvc.perform(
                        formLogin("/api/auth/login")
                                .user(email)
                                .password(password))
                .andExpect(authenticated().withUsername(email))
                .andReturn();

        MockHttpSession session = (MockHttpSession)
                result.getRequest().getSession(false);

        mockMvc.perform(get("/api/auth/me")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void loginWithInvalidPasswordFails() throws Exception {
        String email = uniqueEmail();

        registerUser(email, "TestPassword123!");

        mockMvc.perform(formLogin("/api/auth/login")
                        .user(email)
                        .password("WrongPassword123!"))
                .andExpect(unauthenticated());
    }

    @Test
    void logoutReturnsNoContentAndInvalidatesAuthentication()
            throws Exception {

        String email = uniqueEmail();
        String password = "TestPassword123!";

        registerUser(email, password);

        MvcResult result = mockMvc.perform(
                        formLogin("/api/auth/login")
                                .user(email)
                                .password(password))
                .andExpect(authenticated())
                .andReturn();

        MockHttpSession session = (MockHttpSession)
                result.getRequest().getSession(false);

        mockMvc.perform(post("/api/auth/logout")
                        .session(session)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerWithExistingEmailReturnsConflict() throws Exception {
        String email = uniqueEmail();

        registerUser(email, "TestPassword123!");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "%s",
                                    "password": "TestPassword123!"
                                }
                                """.formatted(email.toUpperCase(Locale.ROOT))))
                .andExpect(status().isConflict());
    }

    @Test
    void registerPersistsCanonicalEmail() throws Exception {
        String email = "Test-" + UUID.randomUUID() + "@Example.com";

        registerUser(email, "TestPassword123!");

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow();

        assertThat(user.getEmail())
                .isEqualTo(email.toLowerCase(Locale.ROOT));
    }
}

