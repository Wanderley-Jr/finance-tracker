import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Page } from "../../../app/api";
import { parseLocalDate } from "../../../app/localDate";
import { useTransactions } from "../transactionHooks";
import type { Transaction } from "../transactionService";
import TransactionList from "./TransactionList";

vi.mock("../transactionHooks", () => ({
    useTransactions: vi.fn(),
}));

const mockedUseTransactions = vi.mocked(useTransactions);

const firstPage: Page<Transaction> = {
    content: [
        {
            id: 1,
            amount: 10,
            date: parseLocalDate("2026-11-01"),
            title: "Groceries",
            description: "",
        },
    ],
    totalElements: 50,
    totalPages: 5,
    size: 10,
    number: 0,
    first: true,
    last: false,
};

function lastQueryParams() {
    return mockedUseTransactions.mock.calls.at(-1)?.[0];
}

beforeEach(() => {
    mockedUseTransactions.mockReturnValue({
        data: firstPage,
        error: null,
    } as unknown as ReturnType<typeof useTransactions>);
});

describe("TransactionList pagination", () => {
    it("requests the page selected by the user", async () => {
        const user = userEvent.setup();

        render(<TransactionList queryParams={{ title: "a" }} emptyNode="empty" />);

        await user.click(screen.getByRole("button", { name: "3" }));

        expect(lastQueryParams()).toMatchObject({ page: 2, title: "a" });
    });

    it("[KNOWN BUG] resets to the first page when the filters change", async () => {
        // pageIndex is internal and is not reset by TransactionHistory when the
        // search text, date range or sort order changes. After browsing to page
        // 3 and filtering down to one page of results, the list requests page 3
        // of 1 and appears empty until the page is reloaded.
        const user = userEvent.setup();

        const { rerender } = render(
            <TransactionList queryParams={{ title: "a" }} emptyNode="empty" />
        );

        await user.click(screen.getByRole("button", { name: "3" }));

        expect(lastQueryParams()).toMatchObject({ page: 2 });

        rerender(
            <TransactionList queryParams={{ title: "b" }} emptyNode="empty" />
        );

        expect(lastQueryParams()).toMatchObject({ page: 0, title: "b" });
    });
});
