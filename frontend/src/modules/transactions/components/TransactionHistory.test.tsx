import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Page } from "../../../app/api";
import { uncaughtErrorsFrom } from "../../../test/uncaughtErrors";
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
    it("searches titles and descriptions by default", async () => {
        const user = userEvent.setup();

        render(<TransactionHistory />);

        await user.type(
            screen.getByPlaceholderText("Search transactions..."),
            "coffee"
        );

        expect(lastQueryParams()).toMatchObject({ search: "coffee" });
        expect(lastQueryParams()?.title).toBeUndefined();
    });

    it("sends the selected sort option to the backend", async () => {
        const user = userEvent.setup();

        render(<TransactionHistory />);

        await user.selectOptions(
            screen.getByDisplayValue("Date (newest first)"),
            "amount,asc"
        );

        expect(lastQueryParams()).toMatchObject({ sort: ["amount,asc"] });
    });

    it("clearing a date filter does not crash the history", async () => {
        // Clearing the native date input used to call parseLocalDate("") from
        // inside the handler, which threw instead of resetting the filter.
        const { container } = render(<TransactionHistory />);

        const from = container.querySelector(
            'input[type="date"]'
        ) as HTMLInputElement;

        fireEvent.change(from, { target: { value: "2026-11-17" } });

        expect(await uncaughtErrorsFrom(() => {
            fireEvent.change(from, { target: { value: "" } });
        })).toEqual([]);

        expect(from).toHaveValue("");
    });

    it("the 'Title only' switch changes what is searched", async () => {
        // Off (default) sends `search`, which the backend matches against the
        // title OR the description. On sends `title`, which matches only the
        // title.
        const user = userEvent.setup();

        render(<TransactionHistory />);

        await user.type(
            screen.getByPlaceholderText("Search transactions..."),
            "coffee"
        );

        expect(lastQueryParams()).toMatchObject({ search: "coffee" });

        await user.click(screen.getByRole("switch"));

        expect(lastQueryParams()).toMatchObject({ title: "coffee" });
        expect(lastQueryParams()?.search).toBeUndefined();
    });
});
