# Frontend review — spring-demo

Status as of 2026-11-17: **28 unit tests, all green**; `npx tsc -b` and `npm run lint`
are clean; the Playwright smoke test passes **10/10** steps.

## Run

```powershell
cd frontend
npm test            # vitest run -> 28 tests
npm run test:watch  # watch mode
npx tsc -b          # type-check
npm run lint        # eslint
npm run test:e2e    # Playwright smoke test (needs backend + Vite running)
```

Unit stack: `vitest` + `jsdom` + Testing Library (`@testing-library/react`,
`user-event`, `jest-dom`), config in `vitest.config.ts`, setup in `src/test/setup.ts`.
`src/test/uncaughtErrors.ts` captures errors React 19 reports asynchronously from event
handlers; without it a crashing `onChange` can leave a test green.

## Behavior notes

- **Title only**: off (default) sends `search`, which the backend matches against the
  title **or** the description; on sends `title` (title only). An empty search box is
  omitted from the query. See `BACKEND_REVIEW.md` → API notes.
- **Dates**: `parseLocalDate(Date)` uses the local calendar day. Clearing a date input
  in the form, history filters or cash-flow chart resets it to `null` instead of
  throwing.
- **Calendar**: the day list renders only after a date is selected, and **Add
  transaction** is disabled until then.
- **Mutations**: create/edit/delete close the modal only on success, show an inline
  error alert on failure, and disable submit while pending.
- **Session**: logout clears the whole React Query cache; login goes through the
  `useLogin` mutation so the current-user query is invalidated.
- **Configuration**: the API base URL comes from `VITE_API_BASE_URL`, falling back to
  `http://localhost:8080/api`.

## Test layout

| Area | Files |
|---|---|
| Dates | `app/localDate.test.ts` |
| Money display | `components/MoneyAmount.test.tsx` |
| Auth | `components/ProtectedRoute.test.tsx`, `modules/auth/authService.test.ts`, `modules/auth/authHooks.test.tsx` |
| Transactions | `TransactionList.test.tsx`, `TransactionHistory.test.tsx`, `TransactionCalendar.test.tsx`, `modals/TransactionForm.test.tsx` |

## End-to-end

`e2e/smoke.mjs` runs with `npm run test:e2e`. It needs PostgreSQL, the backend on
`http://localhost:8080` and the Vite dev server on `http://localhost:5173` (install the
browser once with `npx playwright install chromium`). `E2E_BASE_URL` and `E2E_API_URL`
override the targets; the script exits non-zero when a step fails and writes
`e2e/failure.png` on abort.

Latest run: **10/10 passed** — registration, login/dashboard, calendar, create, edit,
the Title-only switch, the disabled Add button before a date is selected, delete and
logout. The only console entry is the expected `401 GET /api/auth/me` while signed out.

## Known issues

- Dashboard charts fetch `size: 1000`; an account with more transactions gets truncated
  charts and totals. A server-side aggregation endpoint is the scalable fix.
- The backend does not set an explicit page-size cap (the default is 2000), while the
  calendar asks for 1000.
- React-Bootstrap modals have no accessible name (`role="dialog"` without
  `aria-labelledby`).
- `MoneyAmount` always formats BRL although the API/DB are currency-agnostic.
- The Transactions screen fetches the calendar page and the history separately, so the
  same data can be requested twice.
- React logs the auth check's 401 while signed out; this is expected, not a bug.

## Suggested next steps

1. Run `npm run test:e2e` in CI with PostgreSQL, the backend and Vite as services.
2. Add a server-side aggregation endpoint for the calendar and dashboard so they do not
   depend on a fixed page size.
3. Add `aria-labelledby` to the modals and make the display currency configurable.
