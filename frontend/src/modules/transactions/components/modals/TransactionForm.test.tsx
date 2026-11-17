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

    it("clearing the date does not crash the form", async () => {
        // The native date input can be cleared (the calendar button has a
        // "Clear" action and mobile keyboards do too). onChange now resets the
        // value to null instead of calling parseLocalDate(""), which threw
        // "Invalid LocalDate" from inside the event handler.
        render(<TransactionForm id="transaction-form" onSubmit={vi.fn()} />);

        const date = screen.getByLabelText("Date");
        fireEvent.change(date, { target: { value: "2026-11-17" } });

        expect(await uncaughtErrorsFrom(() => {
            fireEvent.change(date, { target: { value: "" } });
        })).toEqual([]);

        expect(date).toHaveValue("");
    });

    it("requires a date before the form can be submitted", () => {
        // The date input is required, and handleSubmit also refuses to submit
        // without a date, so the backend never receives `date: null`.
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
