# Backend review — spring-demo

Status as of 2026-11-17: **56 tests, all green**. The suite covers auth, CSRF,
transaction CRUD/ownership, payload validation, filtering, sorting and error mapping.

## Run

```powershell
# Gradle needs a JDK >= 17; the project targets Java 17.
$env:JAVA_HOME="C:\Users\wanderleyatj\.jdks\temurin-25.0.3"
cd backend
.\gradlew test
# 56 tests, 0 failed
```

Prerequisite: PostgreSQL reachable at `localhost:5432` with a `finance_tracker_test`
database (see `src/test/resources/application.properties`). Docker is not installed on
this machine, so the suite does not use Testcontainers.

## Test layout

| Class | Focus |
|---|---|
| `auth.AuthControllerTest` | HTTP registration/login/logout, CSRF, current user |
| `auth.AuthServiceTest` | email normalization, duplicate handling, password rules |
| `review.KnownBackendIssuesTest` | second/third-pass regressions: payload limits, password bytes/leak, 404, locale |
| `transaction.TransactionControllerTest` | controller wiring and status codes (mocked service) |
| `transaction.TransactionFilteringTest` | title/description/search filters, LIKE escaping, locale |
| `transaction.TransactionIntegrationTest` | CRUD, ownership, payload limits, sort, paging |

## API notes

`GET /api/transactions` accepts `startDate`, `endDate`, `title`, `description` and
`search`:

- `title` / `description` are field-specific and combined with AND.
- `search` matches title **or** description, case-insensitive. `%` and `_` are escaped,
  so they are treated as literal characters.
- Every query is scoped to the authenticated user.
- `sort` is limited to `date`, `amount`, `title`, `description`; anything else is 400.

Errors go through `GlobalExceptionHandler` as `ProblemDetail`: duplicate email 409,
missing user/transaction 404, invalid password/sort 400. Bean Validation enforces a
3–30 character title, a description of at most 300 characters and an amount with at
most 2 decimals. Registration requires 8–72 password characters and also rejects UTF-8
passwords over 72 bytes (the BCrypt limit). `null` descriptions are stored as `""`.

## Resolved in previous passes

- `@RestControllerAdvice` with `ProblemDetail` for the custom 400/404/409 cases.
- `@Digits` on the request amount; `null` descriptions normalized; emails trimmed,
  lowercased and persisted canonically.
- LIKE metacharacters escaped; filtering lowercases with `Locale.ROOT`.
- Sort allow-list; missing or foreign transactions return 404.
- Title/description column lengths aligned with the request bounds (30/300).
- UTF-8 password byte check on registration; the rejected password is no longer
  included in the response or logs.
- CSRF endpoint (`GET /api/csrf`) and SPA token handling; registration requires a CSRF
  token, and the login/logout contract is covered by tests.

## Known issues

### API / code

- `TransactionController` injects `TransactionService` twice (`service` and
  `transactionService`).
- `AuthController` imports `ResponseStatusException` but does not use it.
- `AuthService.register` checks the 72-byte password limit **after** the duplicate-email
  lookup, so an existing email plus an over-long password returns 409 instead of 400
  (account enumeration).
- `@Digits` rejects values such as `10.500` because trailing zeros count toward the
  scale, even though they are valid money amounts after normalization.
- `Page<TransactionResponse>` is serialized as `PageImpl`, whose JSON format Spring
  documents as unstable; a paging DTO/`PagedModel` would pin it.
- No explicit `spring.data.web.pageable.max-page-size` (the default cap applies), so a
  client can still request very large pages.
- `POST /api/transactions` returns 201 without a `Location` header.
- Negative amounts mean expenses, but this is not documented or validated; `amount = 0`
  is accepted.
- Validation messages depend on the JVM locale (no `ValidationMessages.properties`).
- Unknown JSON properties are accepted and ignored (no explicit decision).
- `AuthService` uses `jakarta.transaction.Transactional` while `TransactionService`
  uses Spring's; pick one.
- Dead code: `auth/dto/LoginRequest`, `HelloController`. `spring.jpa.open-in-view` uses
  the default `true`.
- No audit fields or `@Version`; concurrent updates are last-write-wins.

### Configuration / security

- `application.properties` has hardcoded DB credentials, `ddl-auto=update`,
  `show-sql=true` and `server.address=127.0.0.1`; there are no dev/prod profiles and no
  migrations (Flyway/Liquibase).
- CORS allows only `http://localhost:5173`.
- The CSRF cookie uses the default `Secure`/`SameSite` settings; fine over localhost
  HTTP, not production-ready as-is.
- The authentication entry point returns `sendError(401)`, which produces an HTML body
  inconsistent with the JSON `ProblemDetail` responses.
- No login throttling/lockout or session-concurrency limit.
- No OpenAPI/springdoc; the contract is only readable from the controllers.

### Tests

- No Docker, so Testcontainers is unavailable; the test database must exist manually.
- `src/test/resources/application.properties` replaces the main properties instead of
  layering on them; consider `application-test.properties` + `@ActiveProfiles("test")`.
- Test classes share the database and clean up individually; safe serially, not with
  `maxParallelForks`.
- All DB tests run in the `test` task; there is no `integrationTest` source set/tag.
- No CI and no JaCoCo coverage.
- `TransactionControllerTest` still uses raw `Specification.class` matchers.
- Duplicated `objectAsJson`, near-duplicate update tests, mixed JUnit/AssertJ assertions
  and hardcoded dates remain.
- `@WithMockUser` bypasses the real authentication chain; there is no HTTP test with
  form login.
- Missing coverage: repository derived queries, `@DataJpaTest` for `TransactionSpecs`,
  unauthenticated 401, CSRF 403 on `/api/transactions`, CORS preflight,
  `CurrentUserService`, `CustomUserDetailsService`, `SpaCsrfTokenRequestHandler` and the
  page-size cap.

## Suggested next steps

1. Move the password byte check before the duplicate-email lookup.
2. Accept trailing-zero amounts (or normalize before `@Digits`), and return a paging DTO
   with an explicit maximum page size.
3. Add profiles, environment-based configuration, migrations and production-safe
   CSRF/CORS settings.
4. Add CI with the integration tests and the missing coverage listed above.
