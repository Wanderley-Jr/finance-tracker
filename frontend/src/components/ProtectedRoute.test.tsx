import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCurrentUser } from "../modules/auth/authHooks";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../modules/auth/authHooks", () => ({
    useCurrentUser: vi.fn(),
}));

const mockedUseCurrentUser = vi.mocked(useCurrentUser);

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<div>private dashboard</div>} />
                </Route>
                <Route path="/login" element={<div>login page</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe("ProtectedRoute", () => {
    beforeEach(() => {
        mockedUseCurrentUser.mockReturnValue({
            data: undefined,
            isPending: false,
            isError: true,
        } as unknown as ReturnType<typeof useCurrentUser>);
    });

    it("redirects unauthenticated visitors to the login page", () => {
        renderAt("/");

        expect(screen.getByText("login page")).toBeInTheDocument();
        expect(screen.queryByText("private dashboard")).not.toBeInTheDocument();
    });

    it("shows a loading state while the session is being resolved", () => {
        mockedUseCurrentUser.mockReturnValue({
            data: undefined,
            isPending: true,
            isError: false,
        } as unknown as ReturnType<typeof useCurrentUser>);

        renderAt("/");

        expect(screen.getByText("Checking authentication...")).toBeInTheDocument();
    });

    it("renders the protected route for an authenticated user", () => {
        mockedUseCurrentUser.mockReturnValue({
            data: { id: 1, email: "test@example.com" },
            isPending: false,
            isError: false,
        } as unknown as ReturnType<typeof useCurrentUser>);

        renderAt("/");

        expect(screen.getByText("private dashboard")).toBeInTheDocument();
    });
});
