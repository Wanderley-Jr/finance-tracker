# Backend review — spring-demo

Status as of 2026-10-28: **45 tests, 15 red, 30 green.**

The 15 failures are intentional reproductions of existing bugs. No production code
was changed to write them; every red below fails on the real HTTP behavior of
`src/main`, not on test setup.

---

## 1. How to run

```powershell
# Gradle itself needs a JDK >= 17, independent of the java toolchain setting.
$env:JAVA_HOME="C:\Users\wanderleyatj\.jdks\temurin-25.0.3"
cd backend
.\gradlew test
```

Prerequisite: a reachable PostgreSQL with a `finance_tracker_test` database
(`src/test/resources/application.properties`). Docker is **not installed** on this
machine, so Testcontainers cannot be used yet (see §4.1).

Expected output right now: `45 tests completed, 15 failed`.

| Test class | Tests | Failing |
|---|---|---|
| `auth.AuthControllerTest` | 8 | 2 |
| `auth.AuthServiceTest` | 4 | 2 |
| `transaction.TransactionControllerTest` | 11 | 0 |
| `transaction.TransactionFilteringTest` | 4 | 2 |
| `transaction.TransactionIntegrationTest` | 18 | 9 |

---

## 2. Failing tests and the bug each one pins down

### 2.1 Error mapping — there is no `@RestControllerAdvice`

| Test | Expects | Today |
|---|---|---|
| `AuthControllerTest.registerWithExistingEmailReturnsConflict` | 409 | `EmailAlreadyRegisteredException` → **500** |
| `TransactionIntegrationTest.shouldReturnNotFoundWhenUpdatingMissingTransaction` | 404 | `TransactionNotFoundException` → **500** |
| `TransactionIntegrationTest.shouldReturnNotFoundWhenUpdatingAnotherUsersTransaction` | 404, row unchanged | **500** |
| `TransactionIntegrationTest.shouldReturnNotFoundWhenDeletingMissingTransaction` | 404 | **204** |
| `TransactionIntegrationTest.shouldReturnNotFoundWhenDeletingAnotherUsersTransaction` | 404, row still exists | **204** |
| `AuthServiceTest.mapsConcurrentInsertViolationToConflict` | `EmailAlreadyRegisteredException` | raw `DataIntegrityViolationException` |

`EmailAlreadyRegisteredException` (`auth/AuthService.java:13`) and
`TransactionNotFoundException` (`transaction/TransactionService.java:15`) are
package-private `RuntimeException`s with no handler. The delete path
(`TransactionService.java:83-87`) silently succeeds for missing/foreign ids.

### 2.2 Money scale — `RoundingMode.UNNECESSARY`

| Test | Expects | Today |
|---|---|---|
| `TransactionIntegrationTest.shouldRejectAmountWithMoreThanTwoDecimalsOnCreate` | 400 | `ArithmeticException: Rounding necessary` → **500** |
| `TransactionIntegrationTest.shouldRejectAmountWithMoreThanTwoDecimalsOnUpdate` | 400 | **500** |

`TransactionRequest.amount` only has `@NotNull @Positive`; the entity setter
(`transaction/Transaction.java:85-87`) calls `setScale(2, UNNECESSARY)`.
`@Digits(integer = 13, fraction = 2)` exists on the entity but is never applied
to the request DTO.

### 2.3 Nullable description

| Test | Expects | Today |
|---|---|---|
| `TransactionIntegrationTest.shouldCreateTransactionWhenDescriptionIsOmitted` | 201, `""` | `ConstraintViolationException` → **500** |
| `TransactionIntegrationTest.shouldCreateTransactionWhenDescriptionIsNull` | 201, `""` | **500** |

`TransactionRequest.description` is optional, `TransactionService.create`
(line 40) copies it verbatim (erasing the entity default `""`), and
`Transaction.description` is `@NotNull` (`Transaction.java:35-37`).

### 2.4 Email canonicalization

| Test | Expects | Today |
|---|---|---|
| `AuthControllerTest.registerPersistsCanonicalEmail` | `test-…@example.com` | `Test-…@Example.com` |
| `AuthServiceTest.savesCanonicalEmail` | `test@example.com` | `  Test@Example.com  ` |

`AuthService.java:31` normalizes into a local variable but line 38 saves
`request.email()` unmodified. The duplicate check and the persisted value use
different strings. (Direct service call bypasses `@Email`; over HTTP, surrounding
whitespace is rejected by `@Email` first — see §4.2.)

### 2.5 LIKE wildcards in the search filters

| Test | Expects | Today |
|---|---|---|
| `TransactionFilteringTest.percentInTitleFilterIsNotTreatedAsWildcard` | 1 row | 2 rows |
| `TransactionFilteringTest.underscoreInTitleFilterIsNotTreatedAsWildcard` | 1 row | 2 rows |

`TransactionSpecs.java:32-48` interpolates user input straight into
`criteriaBuilder.like(..., "%" + query + "%")`. `%` and `_` are SQL LIKE
metacharacters, so searching for `100%` matches everything containing `100`.

### 2.6 Unknown sort property

| Test | Expects | Today |
|---|---|---|
| `TransactionIntegrationTest.shouldRejectSortByUnknownProperty` | 400 | `PropertyReferenceException` → **500** |

`?sort=doesNotExist,asc` is passed to Spring Data unfiltered. There is no
allow-list of sortable properties.

### 2.7 Corrected stale tests

`AuthControllerTest.logoutInvalidatesAuthentication` used to expect
`3xxRedirection` on logout and on `/api/auth/me` after logout. It was the only red
test before this change, and it was red because it encoded pre-`SecurityConfig`
behavior. It is now split into
`logoutReturnsNoContentAndInvalidatesAuthentication`, which asserts the current
(wrong-or-right, but intended) contract: **204** on logout, **401** afterwards.
It is green now — it documents behavior, it does not flag a bug.

---

## 3. Behavior to decide before fixing

| # | Question | Recommendation | Affects |
|---|---|---|---|
| D1 | `PUT`/`DELETE` on missing or foreign row → 404 or 204? | **404** | 4 red tests |
| D2 | >2 decimals → 400 or round half-up? | **400** (never silently round money) | 2 red tests |
| D3 | `%`/`_` in filters → literal or wildcard? | **literal** (escape before `LIKE`) | 2 red tests |
| D4 | Canonical email (lowercase) in DB? | **yes**, normalize at the boundary | 2 red tests |
| D5 | Duplicate email → 409 vs 200-idempotent? | **409** | 2 red tests |

If D1/D2/D3 go the other way, the corresponding tests must be rewritten rather
than fixed in `src/main`.

---

## 4. Findings without a failing test

### 4.1 Test infrastructure

- **No Docker** → Testcontainers is not an option today. Tests require a manually
  created `finance_tracker_test` Postgres database; a fresh clone or CI cannot run
  them. Either install Docker and add
  `spring-boot-testcontainers` + `org.testcontainers:postgresql`, or commit a DB
  bootstrap script and document it.
- **Test properties shadow the main ones.** `src/test/resources/application.properties`
  replaces (not layers on) `src/main/resources/application.properties`, so every
  main property not duplicated there silently disappears in tests. Rename to
  `application-test.properties` and use `@ActiveProfiles("test")`.
- **No isolation between test classes.** `TransactionIntegrationTest` and
  `TransactionFilteringTest` truncate shared tables in `@BeforeEach`, while
  `AuthControllerTest` leaves rows behind with random emails. Fine serially; breaks
  under `maxParallelForks` or reordering. Add a shared `AbstractIntegrationTest`
  (cleanup via `@Sql` or a base `@BeforeEach`) and only then enable parallel forks.
- **No source-set separation.** All tests run in one `test` task, including ones
  that need Postgres. Tag DB tests `@Tag("integration")` and add an
  `integrationTest` task so `./gradlew test` can stay fast/hermetic.
- **Gradle needs its own JDK.** `build.gradle` sets a Java 17 toolchain, but the
  Gradle daemon requires JVM ≥ 17 too; the machine default is JVM 8 and the build
  fails with `Gradle requires JVM 17 or later`. Document `JAVA_HOME` or commit
  `gradle.properties` with `org.gradle.java.installations.paths`.
- **No CI and no coverage.** No `.github/workflows`, no JaCoCo. The suite had been
  red unnoticed — that is the root cause of the stale logout test.
- **Unchecked warnings.** `any(Specification.class)` in
  `TransactionControllerTest` compiles with raw-type warnings; use
  `ArgumentMatchers.<Specification<Transaction>>any()`.
- **Duplicated helpers.** `objectAsJson` exists in two test classes with different
  exception handling; move to a test utility.
- **Near-duplicate tests.** `shouldUpdateTransaction` and
  `updateTransactionShouldPersistAllChanges` overlap; merge into one parameterized
  test.
- **Mixed assertions.** JUnit `assertEquals` and AssertJ `assertThat` are used in
  the same classes. Standardize on AssertJ.
- **Hardcoded dates.** `2026-10-06`, `LocalDate.now()` — prefer a fixed `Clock`.
- **`@WithMockUser` bypasses the whole auth chain.** `TransactionIntegrationTest`
  never proves that the authenticated principal's name is the email that
  `CurrentUserService` looks up. One end-to-end test with `formLogin` is warranted.
- **Missing coverage that would pass today**: repository derived queries
  (`findByIdAndUserId`, `deleteByIdAndUserId`, `existsByEmailIgnoreCase`),
  `@DataJpaTest` for `TransactionSpecs`, unauthenticated `401`s, CSRF `403` on
  `/api/transactions`, CORS preflight, `CurrentUserService`,
  `CustomUserDetailsService`, `SpaCsrfTokenRequestHandler`, page-size cap.

### 4.2 Validation / DTO details

- `TransactionRequest` has no `@Digits` (see §2.2), so the entity-level constraint
  is the only guard and it throws instead of rejecting.
- `TransactionRequest.description` has no `@Size` bound; arbitrarily long
  descriptions reach the DB.
- `RegisterRequest.password` uses `@Size(min = 8, max = 72)` — characters, not
  bytes. BCrypt truncates at 72 **bytes**, so multi-byte passwords are not
  protected by this bound.
- Validation messages come from the JVM default locale; the observed message was
  `"nǜo deve ser nulo"` (pt-BR with a mojibake `ã`). No `ValidationMessages.properties`
  and no explicit `Locale` for the test JVM.
- `@Valid` on `AuthService.register` (line 30) is a no-op: the class has no
  `@Validated`, and Spring's method validation for service beans is not active.
  Validation happens only at the controller. Misleading.
- Unknown JSON properties are accepted and ignored (e.g. `user`, `id` in a body).
  Fine today, but worth an explicit decision.

### 4.3 Configuration / security

- `src/main/resources/application.properties` contains hardcoded DB credentials
  (lines 7-9), `ddl-auto=update` (line 11) and `show-sql=true` (line 12). No
  `dev`/`prod` profiles, no environment-variable binding.
- No schema migrations (Flyway/Liquibase); `ddl-auto=update` will drift from the
  entities without warning.
- CORS allows a single hardcoded origin `http://localhost:5173`
  (`config/SecurityConfig.java:66`).
- The CSRF cookie is created by `CookieCsrfTokenRepository.withHttpOnlyFalse()`
  with no `Secure`/`SameSite` configuration (`SecurityConfig.java:55`). Fine over
  localhost HTTP, unsafe as-is in production.
- No login throttling, lockout, or session-concurrency limit.
- `server.address=127.0.0.1` (line 4) is a local-only assumption in the main config.
- The authentication entry point uses `sendError(401)`, which produces an HTML
  error page for API clients; a JSON body would be consistent with the future
  exception handler.
- No OpenAPI/springdoc — the contract is only readable from controllers.

### 4.4 Code quality

- `TransactionController` injects the same bean twice (`service` and
  `transactionService`, lines 18-24).
- `TransactionService.java:24` has a double semicolon (`private final
  TransactionRepository repository;;`).
- `AuthController.me()` (lines 33-34) queries `UserRepository` directly instead of
  reusing `CurrentUserService`, duplicating the lookup and the not-found policy.
- Dead code: `auth/dto/LoginRequest` (login is form-based), `HelloController`,
  unused imports in `SpringDemoApplication`, the second `Transaction` constructor
  if unused.
- `TransactionSpecs` uses the default-locale `toLowerCase()` (lines 36, 45);
  `Locale.ROOT` avoids Turkish-`I` surprises. Note the Java-side lowercase and the
  DB-side `lower()` must agree.
- `AuthService` uses `jakarta.transaction.Transactional` while `TransactionService`
  uses Spring's — pick one.
- Package name `spring_demo` (underscore) is non-idiomatic for Java.
- No audit fields (`createdAt`/`updatedAt`) and no `@Version` optimistic locking;
  concurrent updates silently lose data (last write wins).
- `spring.jpa.open-in-view` is left at its default `true`.
- `Page<TransactionResponse>` is serialized as `PageImpl`, which Spring Boot
  documents as unstable; a dedicated paging DTO removes that risk.
- No explicit `spring.data.web.pageable.max-page-size`; the default cap is relied
  upon implicitly.
- `POST /api/transactions` returns 201 without a `Location` header.

---

## 5. Suggested fix order

1. **D1–D5 decisions**, then a `@RestControllerAdvice` with a stable error body
   (400/401/403/404/409/500) — clears 6 red tests.
2. **Amount scale**: add `@Digits(fraction = 2)` to `TransactionRequest`, keep the
   entity defensive but non-throwing — clears 2.
3. **Description**: normalize `null` → `""` in the DTO or service, align the entity
   constraint — clears 2.
4. **Email**: normalize once, persist the normalized value, map
   `DataIntegrityViolationException` → 409 — clears 3.
5. **Filters**: escape `%`, `_`, `\` and use `Locale.ROOT` — clears 2.
6. **Sort allow-list** (`@PageableDefault` + validated sort fields) — clears 1.
7. Then re-green the suite, add the §4.1 missing coverage, and only afterwards
   tackle §4.3/§4.4.
