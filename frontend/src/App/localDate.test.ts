import { describe, expect, it, vi } from "vitest";

import { parseLocalDate, toDate } from "./localDate";

describe("parseLocalDate", () => {
    it("round-trips a valid calendar date in the machine timezone", () => {
        expect(parseLocalDate("2026-11-17")).toBe("2026-11-17");
        expect(toDate(parseLocalDate("2026-11-17")).getDate()).toBe(17);
    });

    it("rejects malformed and impossible dates", () => {
        expect(() => parseLocalDate("2026-02-30")).toThrow(/Invalid LocalDate/);
        expect(() => parseLocalDate("17/11/2026")).toThrow(/Invalid LocalDate/);
    });

    it("[KNOWN BUG] works in timezones east of UTC", () => {
        // parseLocalDate builds a Date at *local* midnight and then compares
        // its UTC ISO string with the input. In Asia/Tokyo (UTC+9) local
        // midnight is 15:00 UTC of the previous day, so every valid date
        // throws. This breaks the calendar, the history filters and the
        // cash-flow chart for users east of UTC.
        try {
            vi.stubEnv("TZ", "Asia/Tokyo");

            expect(() => parseLocalDate("2026-11-17")).not.toThrow();
            expect(parseLocalDate("2026-11-17")).toBe("2026-11-17");
        } finally {
            vi.unstubAllEnvs();
        }
    });
});
