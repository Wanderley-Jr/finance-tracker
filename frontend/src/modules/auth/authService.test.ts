import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../app/api";
import { login, register } from "./authService";

vi.mock("../../app/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const mockedApi = vi.mocked(api);

const credentials = {
    email: "test@example.com",
    password: "TestPassword123!",
};

beforeEach(() => {
    mockedApi.get.mockResolvedValue({});
    mockedApi.post.mockResolvedValue({});
});

describe("authService", () => {
    it("bootstraps a CSRF token and posts the login form", async () => {
        await login(credentials);

        expect(mockedApi.get).toHaveBeenCalledWith("/csrf");
        expect(mockedApi.post).toHaveBeenCalledWith(
            "/auth/login",
            expect.any(URLSearchParams),
            expect.objectContaining({
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
        );

        const body = mockedApi.post.mock.calls[0][1] as URLSearchParams;
        expect(body.get("username")).toBe(credentials.email);
        expect(body.get("password")).toBe(credentials.password);

        expect(mockedApi.get.mock.invocationCallOrder[0]).toBeLessThan(
            mockedApi.post.mock.invocationCallOrder[0]
        );
    });

    it("bootstraps a CSRF token before registering", async () => {
        // POST /api/auth/register is CSRF-protected. A brand-new visitor has no
        // XSRF-TOKEN cookie, so register() must call GET /api/csrf first (it
        // used to skip that and the first registration attempt got a 401).
        await register(credentials);

        expect(mockedApi.get).toHaveBeenCalledWith("/csrf");
        expect(mockedApi.get.mock.invocationCallOrder[0]).toBeLessThan(
            mockedApi.post.mock.invocationCallOrder[0]
        );
    });

    it("posts the registration payload as JSON", async () => {
        await register(credentials);

        expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", credentials);
    });
});
