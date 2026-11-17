# Frontend review — spring-demo

Status as of 2026-11-17 (working tree on top of `8e274f5`): **28 tests, all green**.
`npx tsc -b` and `npm run lint` are clean, and every `[KNOWN BUG]` tag has been removed
from the test names because the underlying bug is fixed.

```powershell
cd frontend
npm test            # vitest run -> 28 tests, 0 failed
npm run test:watch  # watch mode
npx tsc -b          # type-check (clean)
npm run lint        # eslint (clean)
```

Test stack: `vitest` + `jsdom` + Testing Library (`@testing-library/react`,
`user-event`, `jest-dom`), config in `vitest.config.ts`, setup in `src/test/setup.ts`.
`src/test/uncaughtErrors.ts` captures errors React 19 reports asynchronously from event
handlers; without it a crashing `onChange` can leave a test green.

---

## 1. Fixed in this pass

| # | Test | Was | Now |
|---|---|---|---|
| F8 | `app/localDate.test.ts` — "converts a Date using its local calendar day" | `parseLocalDate(Date)` used `toISOString()`, i.e. the **UTC** day, so near local midnight the calendar opened on the wrong day/month | `toLocalDateString()` uses the local `getFullYear/getMonth/getDate`; `parseLocalDate(Date)` uses it |
| F9 | `modals/TransactionForm.test.tsx` — "clearing the date does not crash the form" | `onChange` called `parseLocalDate("")`, which threw `Invalid LocalDate` | empty value resets the state to `null` |
| F10 | `TransactionHistory.test.tsx` — "clearing a date filter does not crash the history" | same crash on both date filters | empty values reset the filter to `null`; `MonthlyCashFlowChart` guards its two date inputs too |
| F11 | `TransactionCalendar.test.tsx` — "asks for a date before listing transactions" | with no day selected the list queried with no bounds and showed the first page of the whole history | the list renders only after a day is selected; the prompt is shown otherwise, and **Add transaction** is really `disabled` until then |
| F12 | `auth/authHooks.test.tsx` — "clears cached financial data..." | logout only set `["auth","me"]` to `null`, leaving the previous account's transactions cached | `queryClient.clear()` drops every cached query on logout |
| F2 | `TransactionHistory.test.tsx` — "the 'Title only' switch changes what is searched" | `titleOnly` was read by nothing; the test was commented out and the feature postponed | Off sends `search` (title **OR** description); On sends `title` (title only). See §2. |

Additional frontend fixes without a dedicated test:

- `TransactionList` resets to page 0 during render whenever the search text, date range
  or sort order changes (the old `useEffect` issued one request for the stale page first).
- Transaction mutations (`create`/`update`/`delete`) close the modal **only on success**,
  show an inline `alert-danger` on failure, and disable the submit button while pending.
- `TransactionForm` initialises state from `initialData` directly and the edit modal
  passes `key={transaction.id}`, so switching rows no longer needs a state-syncing
  effect (removes the controlled/uncontrolled warning).
- `RegisterPage` checks the 72-**byte** UTF-8 password limit and shows the backend
  `detail` message (e.g. "email already registered") instead of a generic failure.
- `LoginPage` uses the `useLogin` mutation, so the `["auth","me"]` invalidation runs.
- `CreateTransactionModal`/`DeleteTransactionModal` no longer accept the unused
  `onCreate`/`onDelete` props (lint errors).
- `Pagination` boundary buttons are truly `disabled`, have `type="button"` and
  `aria-label`s, and the active page has `aria-current="page"`.
- `api.ts` reads `VITE_API_BASE_URL` (localhost fallback) and no longer imports the
  unrelated `Pagination` component/type.
- `Transactions.tsx` requests `size: 1000` for the calendar instead of the default 20.
- The tracked directory was `src/App` while imports used `src/app`; it is now `src/app`
  everywhere, so the build also works on case-sensitive filesystems.

## 2. "Title only" behavior

The backend now accepts a general `search` query parameter that matches the title **or**
the description (case-insensitive, LIKE-escaped). The existing `title` and `description`
parameters remain field-specific and are still combined with AND.

| Switch | Query sent |
|---|---|
| Off (default) | `?search=<text>` — title or description |
| On | `?title=<text>` — title only |

The search box trims to `undefined` when empty, so clearing it removes the filter. Date
ranges and sorting are sent in both modes. Backend coverage lives in
`TransactionFilteringTest` (see `BACKEND_REVIEW.md` §6.4).

## 3. End-to-end (Playwright, real backend + Vite dev server)

The suite was re-run on 2026-11-17 against the fixed build: **10/10 steps passed**.

| Step | Result |
|---|---|
| Fresh visitor registers with no prior CSRF cookie | PASS |
| Register with a CSRF cookie | PASS |
| Login lands on the dashboard with all charts | PASS |
| Calendar renders selectable days | PASS |
| Create transaction from the calendar | PASS |
| Edit transaction | PASS |
| "Title only" off matches the description, on matches title only | PASS |
| Add transaction is disabled until a date is selected (no dialog opens) | PASS |
| Delete transaction | PASS |
| Logout protects the app again | PASS |

The only console entry is the expected `401 GET /api/auth/me` while logged out. The
smoke script is ad-hoc and currently lives outside the repository; committing it would
make the E2E check repeatable in CI.

## 4. Remaining findings without a failing test

- Dashboard charts request `size: 1000`; an account with more than 1000 transactions
  still gets truncated charts and totals. A dedicated aggregation endpoint would scale.
- The backend does not set `spring.data.web.pageable.max-page-size` explicitly; the
  calendar relies on the default cap (2000) while asking for 1000.
- React-Bootstrap modals still have no accessible name (`role="dialog"` without
  `aria-labelledby`).
- `MoneyAmount` formats everything as BRL although the API/DB are currency-agnostic.
- `Transactions` still fetches its own page only for the calendar; the history fetches
  separately. This is intentional today but means two requests on the same screen.

## 5. Build / lint

`npx tsc -b` and `npm run lint` both pass. The previous `noUnusedLocals` errors
(`nextMonth`, `day`, `modifiers`), the empty props pattern and the
`react-hooks/set-state-in-effect` errors are gone.

## 6. Suggested next steps

1. Commit the Playwright smoke script and run it in CI alongside the unit tests.
2. Add a server-side aggregation endpoint for the calendar/dashboard so they do not
   depend on a fixed page size.
3. Add `aria-labelledby` to the modals and make the currency configurable.
