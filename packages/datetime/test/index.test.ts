import { describe, expect, it } from "bun:test";

import {
  addCalendarDays,
  epochMilliseconds,
  formatDate,
  isDate,
  toDate,
  toValidDate,
  utcCalendarDayCount,
  utcCalendarDays,
  utcDateKey,
  utcDayOfWeek,
  utcIsoString,
} from "../src/index";

describe("date input normalization", () => {
  it("converts dates, timestamps, and ISO values", () => {
    const date = new Date("2024-02-29T12:30:00.000Z");

    expect(epochMilliseconds(toDate(date))).toBe(date.getTime());
    expect(toDate(0).getTime()).toBe(0);
    expect(utcIsoString("2024-02-29")).toBe("2024-02-29T00:00:00.000Z");
    expect(utcIsoString("2024-02-29T12:30:00.000Z")).toBe("2024-02-29T12:30:00.000Z");
  });

  it("identifies valid date inputs and rejects invalid values", () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate("2024-01-01")).toBe(false);
    expect(toValidDate("2024-02-29")).toBeInstanceOf(Date);
    expect(toValidDate("not a date")).toBeNull();
    expect(toValidDate(Number.NaN)).toBeNull();
    expect(toValidDate({})).toBeNull();
    expect(toValidDate(new Date(Number.NaN))).toBeNull();
  });
});

describe("UTC calendar helpers", () => {
  it("includes both endpoints and handles leap days and DST boundaries", () => {
    const days = utcCalendarDays("2024-03-09", "2024-03-12");

    expect(days?.map(utcDateKey)).toEqual(["2024-03-09", "2024-03-10", "2024-03-11", "2024-03-12"]);
    expect(utcCalendarDayCount("2024-02-28", "2024-03-01")).toBe(3);
    expect(utcCalendarDayCount("2024-03-12", "2024-03-09")).toBeNull();
    expect(utcCalendarDays("invalid", "2024-03-09")).toBeNull();
  });

  it("uses UTC when deriving weekdays and date keys", () => {
    expect(utcDayOfWeek("2024-02-29T23:30:00-02:00")).toBe(5);
    expect(utcDateKey("2024-01-01T00:30:00+02:00")).toBe("2023-12-31");
  });
});

describe("date formatting", () => {
  it("formats analytics labels with Portuguese locale", () => {
    const localDate = new Date(2026, 0, 15, 12);

    expect(formatDate(localDate, "analyticsDay")).toBe("15 jan");
    expect(formatDate(localDate, "analyticsMonth")).toBe("jan 2026");
    expect(formatDate(localDate, "analyticsMonthShortYear")).toBe("jan 26");
    const utcDateTime = formatDate("2024-01-01T01:30:00+03:00", "analyticsUtcDateTime");
    expect(utcDateTime).toContain("31 de dez. de 2023");
    expect(utcDateTime).toContain("22:30");
  });

  it("keeps chart labels in English and live logs in Portuguese", () => {
    const localDate = new Date(2026, 0, 15, 12);

    expect(formatDate(localDate, "chartShortDate")).toBe("Jan 15");
    expect(formatDate(localDate, "chartWeekdayDate")).toBe("Thu, Jan 15");
    expect(formatDate(localDate, "liveLogDateTime")).toContain("jan");
    expect(formatDate(localDate, "year")).toBe("2026");
  });
});

describe("calendar arithmetic", () => {
  it("preserves local time when adding calendar days", () => {
    const start = new Date(2024, 2, 9, 12);
    const nextDay = addCalendarDays(start, 1);

    expect(nextDay.getDate()).toBe(10);
    expect(nextDay.getHours()).toBe(12);
  });
});
