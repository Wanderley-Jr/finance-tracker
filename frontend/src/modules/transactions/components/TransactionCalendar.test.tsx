import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Page } from "../../../app/api";
import { parseLocalDate } from "../../../app/localDate";
import { useTransactions } from "../transactionHooks";
import type { Transaction } from "../transactionService";
import TransactionCalendar from "./TransactionCalendar";

vi.mock("../transactionHooks", () => ({
    useTransactions: vi.fn(),
    useCreateTransaction: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateTransaction: () => ({ mutate: vi.fn(), isPending: false }),
    useDeleteTransaction: () => ({ mutate: vi.fn(), isPending: false }),
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

function transaction(id: number, amount: number, date: string): Transaction {
    return {
        id,
        amount,
        date: parseLocalDate(date),
        title: `Transaction ${id}`,
        description: "",
    };
}

function footerValue(label: "Income" | "Expenses" | "Balance") {
    return screen.getByText(label).parentElement?.textContent ?? "";
}

beforeEach(() => {
    mockedUseTransactions.mockReturnValue({
        data: emptyPage,
        error: null,
    } as unknown as ReturnType<typeof useTransactions>);
});

describe("TransactionCalendar footer totals", () => {
    it("separates income from expenses for the selected month", () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const date = `${today.getFullYear()}-${month}-15`;

        render(
            <TransactionCalendar
                transactions={[
                    transaction(1, 100, date),
                    transaction(2, -30, date),
                ]}
            />
        );

        expect(footerValue("Income")).toContain("100,00");
        expect(footerValue("Expenses")).toContain("30,00");
        expect(footerValue("Balance")).toContain("70,00");
    });

    it("asks for a date before listing transactions", () => {
        // Until the user picks a day, selectedDate is undefined, so the
        // TransactionList is not rendered at all and the prompt is shown
        // instead of the first page of the whole history.
        mockedUseTransactions.mockReturnValue({
            data: {
                ...emptyPage,
                content: [transaction(1, 100, "2026-11-17")],
                totalElements: 1,
                totalPages: 1,
            },
            error: null,
        } as unknown as ReturnType<typeof useTransactions>);

        render(<TransactionCalendar transactions={[]} />);

        expect(screen.queryByText("Transaction 1")).not.toBeInTheDocument();
        expect(
            screen.getByText("Select a date to view transactions made")
        ).toBeInTheDocument();
    });

    it("only counts transactions from the selected month of the selected year", () => {
        // The footer totals compare both month and year, so a transaction from
        // November 2025 is not added to the November 2026 totals.
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const thisYear = `${today.getFullYear()}-${month}-15`;
        const lastYear = `${today.getFullYear() - 1}-${month}-15`;

        render(
            <TransactionCalendar
                transactions={[
                    transaction(1, 100, thisYear),
                    transaction(2, 50, lastYear),
                ]}
            />
        );

        expect(footerValue("Income")).toContain("100,00");
        expect(footerValue("Income")).not.toContain("150,00");
    });
});
