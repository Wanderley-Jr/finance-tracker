import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import * as authService from "./authService";
import { useLogout } from "./authHooks";

vi.mock("./authService", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./authService")>();
    return { ...actual, logout: vi.fn() };
});

describe("useLogout", () => {
    it("clears cached financial data so the next account cannot see it", async () => {
        // Signing out used to only set the "auth/me" cache entry to null, so
        // every "transactions" query stayed cached and the next account on the
        // same tab briefly saw the previous user's transactions.
        vi.mocked(authService.logout).mockResolvedValue();

        const queryClient = new QueryClient();
        const transactionsKey = ["transactions", { page: 0 }];
        queryClient.setQueryData(transactionsKey, {
            content: [{ id: 1, amount: 100, title: "Previous account salary" }],
        });

        const wrapper = ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        const { result } = renderHook(() => useLogout(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync();
        });

        expect(queryClient.getQueryData(transactionsKey)).toBeUndefined();
    });
});
