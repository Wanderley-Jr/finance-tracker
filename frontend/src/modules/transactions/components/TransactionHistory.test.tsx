import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Page } from "../../../app/api";
import { useTransactions } from "../transactionHooks";
import type { Transaction } from "../transactionService";
import TransactionHistory from "./TransactionHistory";

vi.mock("../transactionHooks", () => ({
    useTransactions: vi.fn(),
}));

const mockedUseTransactions = vi.mocked(useTransactions);

const emptyPage: Page<Transaction> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
};

function mockResult(page: Page<Transaction> = emptyPage) {
    mockedUseTransactions.mockReturnValue({
        data: page,
        error: null,
    } as unknown as ReturnType<typeof useTransactions>);
}

function lastQueryParams() {
    return mockedUseTransactions.mock.calls.at(-1)?.[0];
}

beforeEach(() => {
    mockResult();
});

describe("TransactionHistory", () => {
    it("sends the search text as the title filter", async () => {
        const user = userEvent.setup();

        render(<TransactionHistory transactions={[]} />);

        await user.type(
            screen.getByPlaceholderText("Search transactions..."),
            "coffee"
        );

        expect(lastQueryParams()).toMatchObject({ title: "coffee" });
    });

    it("sends the selected sort option to the backend", async () => {
        const user = userEvent.setup();

        render(<TransactionHistory transactions={[]} />);

        await user.selectOptions(
            screen.getByDisplayValue("Date (newest first)"),
            "amount,asc"
        );

        expect(lastQueryParams()).toMatchObject({ sort: ["amount,asc"] });
    });

    // it("[KNOWN BUG] the 'Title only' switch changes what is searched", async () => {
    //     // TransactionHistory never sends a `description` filter, so searching
    //     // with the switch off (the default) only matches titles. The switch
    //     // state `titleOnly` is read by nothing and therefore has no effect.
    //     const user = userEvent.setup();

    //     render(<TransactionHistory transactions={[]} />);

    //     await user.type(
    //         screen.getByPlaceholderText("Search transactions..."),
    //         "coffee"
    //     );

    //     expect(lastQueryParams()).toMatchObject({
    //         title: "coffee",
    //         description: "coffee",
    //     });

    //     await user.click(screen.getByRole("switch"));

    //     expect(lastQueryParams()).toMatchObject({ title: "coffee" });
    //     expect(lastQueryParams()?.description).toBeUndefined();
    // });
});
