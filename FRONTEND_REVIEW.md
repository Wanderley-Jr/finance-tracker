# Frontend review — spring-demo

Status as of 2026-11-17 (after commit `74fdcc3`): **27 tests, 22 green, 5 red.** The
seven first-pass red tests now pass because the application was fixed in `74fdcc3`
(their names still contain `[KNOWN BUG]`). The "Title only" test is commented out
because that feature is **postponed**. The five red tests are new third-pass
reproductions, all tagged `[KNOWN BUG]`.

```powershell
cd frontend
npm test            # vitest run -> 27 tests, 5 failed (all [KNOWN BUG])
npm run test:watch  # watch mode
```

Test stack: `vitest` + `jsdom` + Testing Library (`@testing-library/react`,
`user-event`, `jest-dom`), config in `vitest.config.ts`, setup in `src/test/setup.ts`.
`src/test/uncaughtErrors.ts` captures errors React 19 reports asynchronously from event
handlers; without it a crashing `onChange` can leave a test green.

> `npm run build` and `npm run lint` were already failing before this review and still
> fail; see §5.

---

## 1. Open red tests (third pass)

| # | Test | Expects | Today |
|---|---|---|---|
| F8 | `App/localDate.test.ts` — "converts a Date using its local calendar day" | a `Date` keeps its **local** day | `parseLocalDate(Date)` uses `toISOString()`, i.e. the UTC day. Near local midnight the calendar opens on the wrong day/month, and `DayPicker`'s `onSelect(Date)` stores the previous day east of UTC. |
| F9 | `modals/TransactionForm.test.tsx` — "clearing the date does not crash the form" | clearing the date resets it | `onChange` calls `parseLocalDate("")`, which throws `Invalid LocalDate` from inside the handler. |
| F10 | `TransactionHistory.test.tsx` — "clearing a date filter does not crash the history" | clearing the filter resets it | Same crash; `MonthlyCashFlowChart` has the same pattern. |
| F11 | `TransactionCalendar.test.tsx` — "asks for a date before listing transactions" | prompt only, no rows | `selectedDate` is `undefined`, so `TransactionList` queries with no bounds and shows the first page of the whole history. |
| F12 | `auth/authHooks.test.tsx` — "clears cached financial data..." | `["transactions"]` cache is gone after logout | logout only sets `["auth","me"]` to `null`; the previous account's transactions stay cached and are visible to the next account until the refetch completes. |

## 2. First-pass tests (green after `74fdcc3`)

| # | Test | Was | Now |
|---|---|---|---|
| F1 | `auth/authService.test.ts` — CSRF before register | fresh visitor got 401 | `register()` calls `GET /csrf` first |
| F2 | `TransactionHistory.test.tsx` — title-only switch | switch did nothing | test commented out — **feature postponed** |
| F3 | `TransactionList.test.tsx` — page reset on filter change | stayed on page N | `useEffect` resets to page 0 |
| F4 | `TransactionCalendar.test.tsx` — totals by month and year | Nov 2025 counted in Nov 2026 | also compares `getFullYear()` |
| F5 | `modals/TransactionForm.test.tsx` — date required | no `required`, silent 400 | date input is `required` |
| F6 | `MoneyAmount.test.tsx` — zero is neutral | `- R$ 0,00` in red | `>= 0` → `+ R$ 0,00` in `text-success` |
| F7 | `App/localDate.test.ts` — UTC+ string parsing | every date threw east of UTC | the string form is parsed with `Date.UTC` and round-tripped |

## 3. End-to-end (Playwright, real backend + Vite dev server)

The 2026-11-17 Chromium run predates `74fdcc3`. It passed the happy path (login,
dashboard charts, calendar, create/edit/delete, logout) and failed fresh-visitor
registration (F1) and date-less creation (F5). Both causes are fixed in code now; re-run
before releasing. It also observed the controlled/uncontrolled warning described below.

## 4. Other findings without a failing test

- `Transactions.tsx` fetches `useTransactions({})` (default page size **20**) and feeds
  that page to the calendar footer and day highlights. Monthly totals ignore every
  transaction after the first 20. The `transactions` prop of `TransactionHistory` is
  ignored (it fetches its own page), so the parent fetch exists only for the calendar.
- Dashboard charts request `size: 1000`; accounts with more transactions silently get
  truncated charts and wrong totals.
- `DayPicker`'s `onSelect` can pass `undefined` when the selected day is clicked again;
  `parseLocalDate(undefined)` falls back to *now*, so deselecting actually selects today.
- `LoginPage` calls `authService.login` directly instead of the `useLogin` mutation, so
  the `invalidateQueries(["auth","me"])` in `useLogin` is dead code. After a logout
  (cache set to `null`) a successful login can be bounced back to `/login` by
  `ProtectedRoute` before the refetch finishes.
- Mutations (`useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`) use
  bare `mutate()` and modals close immediately, so **every** API error is silent. The
  date-less 400 was one instance; server-side validation, 404 on edit/delete and network
  errors behave the same.
- `TransactionForm` recomputes initial state in `useEffect` instead of using
  `key`/initializers; this triggers the controlled/uncontrolled warning and the
  `react-hooks/set-state-in-effect` lint rule.
- `RegisterPage` reduces every backend failure to "Registration failed…" (the 409
  "email already registered" detail is lost) and has no `maxLength` on the password, so
  a >72-byte password can only be rejected by the server.
- `CreateTransactionModal` accepts `onCreate` and `DeleteTransactionModal` accepts
  `onDelete`, but neither is used (lint errors).
- `Pagination` only adds `.disabled` to boundary buttons; they remain clickable
  (clamped), but assistive tech sees them as enabled.
- `api.ts` hardcodes `http://localhost:8080/api`; there is no env-based configuration.
  It also imports `Pagination` and declares a `Pagination` type in the same module (dead
  import / confusing name).
- `main.tsx` imports `./app/App.tsx` although the directory is `src/App`; works on
  Windows/macOS, fails on case-sensitive filesystems (Linux CI).
- React-Bootstrap modals have no accessible name (`role="dialog"` without
  `aria-labelledby`).
- `MoneyAmount` formats everything as BRL although the API/DB are currency-agnostic.

## 5. Pre-existing build / lint failures

`npm run build` (`tsc -b`) still fails with three `noUnusedLocals` errors in
`TransactionCalendar.tsx`: `nextMonth`, `day`, `modifiers`.

`npm run lint` fails with those three plus the empty props pattern in
`TransactionHistory` and `react-hooks/set-state-in-effect` in `TransactionForm`.
`ProtectedRoute`, `App`, the auth pages and the dashboard charts type-check.

## 6. Suggested fix order

1. F8/F9/F10: make `parseLocalDate` tolerant of `""` at the call sites (or handle empty
   values there) and derive a `Date`'s day from local getters, not `toISOString`.
2. F11: skip/disable the calendar list until a day is selected.
3. F12 + logout→login invalidation: clear or scope query caches per user.
4. Surface mutation errors instead of closing modals.
5. The 20-transaction/1000-row caps and the remaining build/lint errors.
6. Wire `titleOnly` when the postponed feature is picked up (the test is commented out).
