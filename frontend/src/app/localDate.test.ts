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

    it("converts a Date using its local calendar day", () => {
        // Near local midnight the UTC day is different: west of UTC in the
        // evening, east of UTC in the morning. The calendar month, DayPicker
        // selections and dashboard ranges all rely on the local day.
        const offsetMinutes = new Date().getTimezoneOffset();
        const [hour, minute] = offsetMinutes > 0 ? [23, 30] : [0, 30];
        const date = new Date(2026, 10, 17, hour, minute);
        const pad = (value: number) => String(value).padStart(2, "0");
        const expected = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

        expect(parseLocalDate(date)).toBe(expected);
    });

    it("works in timezones east of UTC", () => {
        // The old implementation built a Date at *local* midnight and compared
        // its UTC ISO string with the input. In Asia/Tokyo (UTC+9) local
        // midnight is 15:00 UTC of the previous day, so every valid date threw.
        try {
            vi.stubEnv("TZ", "Asia/Tokyo");

            expect(() => parseLocalDate("2026-11-17")).not.toThrow();
            expect(parseLocalDate("2026-11-17")).toBe("2026-11-17");
        } finally {
            vi.unstubAllEnvs();
        }
    });
});
