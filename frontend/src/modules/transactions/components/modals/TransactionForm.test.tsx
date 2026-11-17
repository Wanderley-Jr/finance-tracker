import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { uncaughtErrorsFrom } from "../../../../test/uncaughtErrors";
import TransactionForm from "./TransactionForm";

describe("TransactionForm", () => {
    it("submits the typed values", () => {
        const onSubmit = vi.fn();
        const { container } = render(
            <TransactionForm id="transaction-form" onSubmit={onSubmit} />
        );

        fireEvent.change(screen.getByLabelText("Amount"), {
            target: { value: "10.5" },
        });
        fireEvent.change(screen.getByLabelText("Date"), {
            target: { value: "2026-11-17" },
        });
        fireEvent.change(screen.getByLabelText("Title"), {
            target: { value: "Coffee" },
        });
        fireEvent.change(screen.getByLabelText("Description"), {
            target: { value: "beans" },
        });

        fireEvent.submit(container.querySelector("form")!);

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 10.5,
                date: "2026-11-17",
                title: "Coffee",
                description: "beans",
            })
        );
    });

    it("limits the title to 30 characters and the description to 300", () => {
        render(<TransactionForm id="transaction-form" onSubmit={vi.fn()} />);

        expect(screen.getByLabelText("Title")).toHaveAttribute("maxLength", "30");
        expect(screen.getByLabelText("Description")).toHaveAttribute("maxLength", "300");
    });

    it("[KNOWN BUG] clearing the date does not crash the form", async () => {
        // The native date input can be cleared (the calendar button has a
        // "Clear" action and mobile keyboards do too). onChange then calls
        // parseLocalDate(""), which throws "Invalid LocalDate" from inside the
        // event handler. The same pattern is used by TransactionHistory and
        // MonthlyCashFlowChart.
        render(<TransactionForm id="transaction-form" onSubmit={vi.fn()} />);

        const date = screen.getByLabelText("Date");
        fireEvent.change(date, { target: { value: "2026-11-17" } });

        expect(await uncaughtErrorsFrom(() => {
            fireEvent.change(date, { target: { value: "" } });
        })).toEqual([]);

        expect(date).toHaveValue("");
    });

    it("[KNOWN BUG] requires a date before the form can be submitted", () => {
        // The date <input type="date"> has no `required` attribute, so an empty
        // date is not caught by the browser. handleSubmit then sends
        // `date: null`, the backend answers 400, the modal closes anyway and
        // the user gets no feedback.
        const { container } = render(
            <TransactionForm id="transaction-form" onSubmit={vi.fn()} />
        );

        fireEvent.change(screen.getByLabelText("Amount"), {
            target: { value: "10" },
        });
        fireEvent.change(screen.getByLabelText("Title"), {
            target: { value: "Coffee" },
        });

        expect(screen.getByLabelText("Date")).toBeRequired();
        expect(container.querySelector("form")!.checkValidity()).toBe(false);
    });
});
