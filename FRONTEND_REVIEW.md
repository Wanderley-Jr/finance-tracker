# Frontend review — spring-demo

Status as of 2026-11-17: **23 tests, 16 green, 7 red.** The red tests are tagged
`[KNOWN BUG]` and reproduce real defects; no application code was changed to write
them.

```powershell
cd frontend
npm test            # vitest run -> 23 tests, 7 failed (all [KNOWN BUG])
npm run test:watch  # watch mode
```

Test stack added: `vitest` + `jsdom` + Testing Library (`@testing-library/react`,
`user-event`, `jest-dom`), config in `vitest.config.ts`, setup in `src/test/setup.ts`.

> `npm run build` and `npm run lint` were already failing before this review and still
> fail; see §4. They are not caused by the tests.

---

## 1. Red tests (reproductions)

| # | Test | Expects | Today |
|---|---|---|---|
| F1 | `auth/authService.test.ts` — "bootstraps a CSRF token before registering" | `GET /csrf` before `POST /auth/register` | no CSRF call → first registration returns **401** for a fresh visitor |
| F2 | `TransactionHistory.test.tsx` — "'Title only' switch changes what is searched" | switch off sends both `title` and `description` | `titleOnly` is never read; only `title` is ever sent, so the switch does nothing |
| F3 | `TransactionList.test.tsx` — "resets to the first page when the filters change" | `page=0` after a filter change | keeps `pageIndex` (e.g. `page=2`); filtered result looks empty until reload |
| F4 | `TransactionCalendar.test.tsx` — "only counts ... selected year" | Nov 2026 income excludes Nov 2025 | compares `getMonth()` only, so Nov 2025 is added (150,00 instead of 100,00) |
| F5 | `modals/TransactionForm.test.tsx` — "requires a date" | date input is `required` / form invalid | no `required`; submits `date: null`, backend answers 400, modal closes with no error |
| F6 | `MoneyAmount.test.tsx` — "zero balance is not negative" | `R$ 0,00`, neutral | renders `- R$ 0,00` **in red** (`amount > 0` ternary) |
| F7 | `App/localDate.test.ts` — "works in timezones east of UTC" | any valid date parses | `parseLocalDate` compares local midnight's **UTC** ISO string; in UTC+ zones every date throws |

## 2. End-to-end (Playwright, real backend + Vite dev server)

A one-off Chromium run against `localhost:5173` / `localhost:8080` exercised the full
flow. **7 of 9 checks passed**:

- PASS register (after manually bootstrapping CSRF), login, dashboard renders all three
  charts, calendar renders, create/edit/delete transaction, logout invalidates the
  session and `/transactions` redirects to `/login`.
- FAIL fresh visitor registration: `POST /api/auth/register` → **401** because no
  `XSRF-TOKEN` cookie exists yet (F1). Shown to the user as "Registration failed…".
- FAIL date-less transaction: the "Add transaction" button only has Bootstrap's
  `.disabled` class (`pointer-events: none`, still keyboard-focusable). Pressing Enter
  opens the form with an empty date; submitting produces **400**, the modal closes and
  no error is shown (F5).

Also observed in the browser: React warns
`A component is changing an uncontrolled input to be controlled` when the edit modal
mounts, because `TransactionForm` starts with `date = null` and fills it from an effect.

## 3. Other findings without a failing test

- `Transactions.tsx` fetches `useTransactions({})` (default page size **20**) and feeds
  that page to the calendar footer. Monthly income/expenses are therefore computed from
  at most 20 transactions, silently ignoring the rest. The `TransactionHistory` prop is
  ignored (it fetches its own page), so the parent fetch exists only for the calendar.
- `TransactionHistory` has no debounce/reset; every keystroke triggers a request and the
  pagination bug (F3) makes the filtered list appear empty.
- Mutations (`useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`) use
  bare `mutate()` and modals close immediately, so **every** API error is silent.
- `TransactionForm` recomputes its initial state in `useEffect` instead of using
  `key`/initializers; this triggers the controlled/uncontrolled warning and lint rule
  `react-hooks/set-state-in-effect`.
- `CreateTransactionModal` accepts `onCreate` and `DeleteTransactionModal` accepts
  `onDelete`, but neither is used (lint errors).
- `TransactionCalendar.nextMonth` is dead code; `onDayKeyDown` ignores `day`/`modifiers`.
- `Pagination` only adds the `.disabled` class to boundary buttons; they remain clickable
  (clamped), but are exposed to assistive tech as enabled.
- `api.ts` hardcodes `http://localhost:8080/api`, matching the backend's single-origin
  CORS; there is no env-based configuration for deploys.
- `main.tsx` imports `./app/App.tsx` although the directory is `src/App`; works on
  Windows/macOS, fails on case-sensitive filesystems (Linux CI).
- No accessible name on React-Bootstrap modals (`role="dialog"` without
  `aria-labelledby`); Playwright must locate them by role only.
- `MoneyAmount` formats with `Intl.NumberFormat("pt-BR", { currency: "BRL" })`, but the
  API and DB are currency-agnostic; okay for this app, worth a product decision.

## 4. Pre-existing build / lint failures

`npm run build` (`tsc -b`) fails with three `noUnusedLocals` errors:

```
src/modules/transactions/components/TransactionCalendar.tsx(21,10): 'nextMonth' is declared but never read
src/modules/transactions/components/TransactionCalendar.tsx(80,48): 'day' is declared but never read
src/modules/transactions/components/TransactionCalendar.tsx(80,53): 'modifiers' is declared but never read
```

`npm run lint` fails with five errors: the three above plus the empty props pattern in
`TransactionHistory` and `react-hooks/set-state-in-effect` in `TransactionForm`.
`ProtectedRoute`, `App`, auth pages and the dashboard charts pass type-checking.

## 5. Suggested fix order

1. F1 (`register` must call `GET /csrf` like `login` does) — blocks new users.
2. F5 + mutation error handling (validate date and surface API errors).
3. F3 + F2 (reset page on filter change; wire `titleOnly` or remove it).
4. F4 + the 20-transaction cap in `Transactions.tsx` (aggregate server-side or fetch all).
5. F7 (`parseLocalDate` must use local components, not `toISOString`).
6. F6, then the build/lint errors and dead props.
