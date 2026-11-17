// End-to-end smoke test for the finance tracker.
//
// Prerequisites:
//   - PostgreSQL running with the app database
//   - backend on http://localhost:8080 (./gradlew bootRun)
//   - Vite dev server on http://localhost:5173 (npm run dev)
//   - Chromium installed once with: npx playwright install chromium
//
// Run from the frontend directory:
//   npm run test:e2e
//
// Override the targets when needed:
//   $env:E2E_BASE_URL="http://localhost:4173"
//   $env:E2E_API_URL="http://localhost:8080/api"
//
// The script exits with a non-zero code if any step fails.

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const API = process.env.E2E_API_URL ?? "http://localhost:8080/api";
const email = `e2e-${Date.now()}@example.com`;
const password = "E2ePassword123!";
const results = [];
const consoleErrors = [];
const failedResponses = [];

function record(step, ok, detail = "") {
    results.push({ step, ok, detail });
    console.log(`${ok ? "PASS" : "FAIL"} | ${step}${detail ? " | " + detail : ""}`);
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

page.on("console", (message) => {
    if (message.type() === "error") {
        consoleErrors.push(message.text());
    }
});
page.on("response", (response) => {
    if (response.status() >= 400) {
        failedResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
});

try {
    // 1. A brand-new visitor registers from a fresh session.
    await page.goto(`${BASE}/register`);
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    const registerOutcome = await Promise.race([
        page.waitForURL(/\/login/, { timeout: 8000 }).then(() => "redirected"),
        page.waitForSelector('[role="alert"]', { timeout: 8000 }).then(() => "alert"),
    ]).catch(() => "timeout");

    record(
        "fresh visitor can register (no prior CSRF cookie)",
        registerOutcome === "redirected",
        `outcome=${registerOutcome}, url=${page.url()}`
    );

    // 2. Bootstrap CSRF (what the app should do itself) and retry registration.
    await context.request.get(`${API}/csrf`);
    if (!page.url().includes("/login")) {
        await page.goto(`${BASE}/register`);
        await page.getByLabel("Email address").fill(email);
        await page.getByLabel("Password", { exact: true }).fill(password);
        await page.getByLabel("Confirm password").fill(password);
        await page.getByRole("button", { name: "Create account" }).click();
    }
    await page.waitForURL(/\/login/, { timeout: 15000 });
    record("register with a CSRF cookie", true, `url=${page.url()}`);

    // 3. Login.
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(`${BASE}/`, { timeout: 15000 });

    const dashboard = await Promise.all([
        page.getByText("Balance over time").first().waitFor({ timeout: 15000 }).then(() => true),
        page.getByText("Cash Flow").waitFor({ timeout: 15000 }).then(() => true),
        page.getByText("Income distribution").waitFor({ timeout: 15000 }).then(() => true),
    ]).then(() => true);
    record("login lands on the dashboard with all charts", dashboard, `url=${page.url()}`);

    // 4. Go to Transactions and select a date.
    await page.getByRole("link", { name: "Transactions" }).click();
    await page.waitForURL(/\/transactions/);

    const dayCells = page.locator('[data-day], button.rdp-day_button');
    await dayCells.first().waitFor({ timeout: 15000 });
    const dayCount = await dayCells.count();
    // Pick a day from the current month that is not an "outside" day.
    let chosenDay = null;
    for (let i = 0; i < dayCount; i++) {
        const cell = dayCells.nth(i);
        const outside = await cell.evaluate((el) => {
            const td = el.closest("td");
            return Boolean(td && td.classList.contains("rdp-outside"));
        });
        if (!outside) {
            chosenDay = cell;
            break;
        }
    }
    record("calendar renders selectable days", Boolean(chosenDay), `cells=${dayCount}`);
    await chosenDay.click();

    // 5. Create a transaction via the calendar.
    await page.getByRole("button", { name: "Add transaction" }).first().click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByLabel("Amount").fill("123.45");
    await createDialog.getByLabel("Title").fill("Playwright coffee");
    await createDialog.getByLabel("Description").fill("e2e description");
    await createDialog.getByRole("button", { name: "Add transaction" }).click();

    const createdRow = page.locator("tr", { hasText: "Playwright coffee" }).first();
    await createdRow.waitFor({ timeout: 15000 });
    record("create transaction from the calendar", true);

    // 6. Edit the transaction.
    await createdRow.getByRole("button").first().click();
    const editDialog = page.getByRole("dialog");
    await editDialog.getByLabel("Title").fill("Playwright coffee edited");
    await editDialog.getByRole("button", { name: "Edit transaction" }).click();

    const editedRow = page.locator("tr", { hasText: "Playwright coffee edited" }).first();
    await editedRow.waitFor({ timeout: 15000 });
    record("edit transaction", true);

    // 7. "Title only" off searches title OR description; on searches title only.
    const historyCard = page.locator(".card", { hasText: "Transaction History" });
    const searchBox = page.getByPlaceholder("Search transactions...");

    await searchBox.fill("e2e");
    await historyCard.getByText("Playwright coffee edited").waitFor({ timeout: 15000 });
    const descriptionMatchOff = await historyCard.getByText("Playwright coffee edited").count();

    await page.getByRole("switch").click();
    await page.waitForTimeout(1200);
    const descriptionMatchOn = await historyCard.getByText("Playwright coffee edited").count();

    await searchBox.fill("Playwright");
    await historyCard.getByText("Playwright coffee edited").waitFor({ timeout: 15000 });
    const titleMatchOn = await historyCard.getByText("Playwright coffee edited").count();

    record(
        "Title only switch: description matched when off, title-only when on",
        descriptionMatchOff === 1 && descriptionMatchOn === 0 && titleMatchOn === 1,
        `off(description)=${descriptionMatchOff}, on(description)=${descriptionMatchOn}, on(title)=${titleMatchOn}`
    );

    await searchBox.fill("");
    await page.getByRole("switch").click();

    // 8. "Add transaction" is disabled until a day is selected.
    await page.goto(`${BASE}/transactions`);
    const addTransactionButton = page.getByRole("button", { name: "Add transaction" }).first();
    const disabledBeforeDate = await addTransactionButton.isDisabled();
    // Bootstrap's disabled state removes pointer events, so also try the keyboard.
    await addTransactionButton.focus().catch(() => {});
    await page.keyboard.press("Enter");
    await page.waitForTimeout(750);
    const noDateDialogCount = await page.getByRole("dialog").count();

    record(
        "Add transaction is disabled until a date is selected",
        disabledBeforeDate && noDateDialogCount === 0,
        `disabled=${disabledBeforeDate}, dialogs opened=${noDateDialogCount}`
    );

    // 9. Delete the transaction.
    await page.goto(`${BASE}/transactions`);
    const rowAfterInvalidEdit = page.locator("tr", { hasText: "Playwright coffee edited" }).first();
    await rowAfterInvalidEdit.waitFor({ timeout: 15000 });
    await rowAfterInvalidEdit.getByRole("button").nth(1).click();
    const deleteDialog = page.getByRole("dialog");
    await deleteDialog.getByRole("button", { name: "Delete Transaction" }).click();
    await page.locator("tr", { hasText: "Playwright coffee edited" }).first().waitFor({ state: "detached", timeout: 15000 });
    record("delete transaction", true);

    // 10. Logout invalidates the session and protects the app again.
    await page.locator("nav .dropdown > button").click();
    await page.getByRole("button", { name: "Logout" }).click();
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await page.goto(`${BASE}/transactions`);
    await page.waitForURL(/\/login/, { timeout: 15000 });
    record("logout protects the app again", true, `url=${page.url()}`);
} catch (error) {
    record("e2e flow aborted", false, String(error).split("\n")[0]);
    await page
        .screenshot({
            path: fileURLToPath(new URL("./failure.png", import.meta.url)),
            fullPage: true,
        })
        .catch(() => {});
} finally {
    console.log("\nConsole errors:", consoleErrors.length ? consoleErrors : "none");
    console.log("HTTP >= 400:", failedResponses.length ? failedResponses : "none");
    console.log("\nSummary:");
    for (const result of results) {
        console.log(`${result.ok ? "PASS" : "FAIL"} ${result.step} ${result.detail}`);
    }
    const failed = results.filter((r) => !r.ok).length;
    console.log(`\n${results.length - failed}/${results.length} steps passed`);
    await browser.close();
    if (failed > 0) {
        process.exitCode = 1;
    }
}
