import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MoneyAmount from "./MoneyAmount";

function renderedNode(amount: number, hideSign?: boolean) {
    const { container, unmount } = render(
        <MoneyAmount amount={amount} hideSign={hideSign} />
    );
    const node = container.firstElementChild as HTMLElement;

    return { node, unmount };
}

describe("MoneyAmount", () => {
    it("prefixes income with a plus sign and paints it green", () => {
        const { node } = renderedNode(1234.56);

        expect(node.textContent).toContain("+");
        expect(node.textContent).toMatch(/R\$\s*1\.234,56/);
        expect(node).toHaveClass("text-success");
    });

    it("prefixes expenses with a minus sign and paints them red", () => {
        const { node } = renderedNode(-10);

        expect(node.textContent).toContain("-");
        expect(node.textContent).toMatch(/R\$\s*10,00/);
        expect(node).toHaveClass("text-danger");
    });

    it("can hide the sign without changing the value", () => {
        const { node } = renderedNode(10, true);

        expect(node.textContent).not.toContain("+");
        expect(node.textContent).not.toContain("-");
    });

    it("[KNOWN BUG] a zero balance is not rendered as a negative amount", () => {
        // amount > 0 ? text-success : text-danger, so 0 is treated as an
        // expense: the calendar footer and the dashboard show "- R$ 0,00" in
        // red for an empty/neutral balance.
        const { node } = renderedNode(0);

        expect(node.textContent).not.toContain("-");
        expect(node).not.toHaveClass("text-danger");
    });
});
