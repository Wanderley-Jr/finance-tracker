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

    it("[KNOWN BUG] converts a Date using its local calendar day", () => {
        // parseLocalDate(Date) does value.toISOString().slice(0, 10), i.e. the
        // *UTC* day. Near local midnight that is a different day: west of UTC
        // in the evening, east of UTC in the morning. This is how the calendar
        // month and the dashboard range pick their default day.
        const offsetMinutes = new Date().getTimezoneOffset();
        const [hour, minute] = offsetMinutes > 0 ? [23, 30] : [0, 30];
        const date = new Date(2026, 10, 17, hour, minute);
        const pad = (value: number) => String(value).padStart(2, "0");
        const expected = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

        expect(parseLocalDate(date)).toBe(expected);
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
