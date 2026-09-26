import { tz } from "@date-fns/tz";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  getDay,
  getTime,
  intlFormat,
  isDate as isDateFnsDate,
  isValid,
  parseISO,
  toDate as toDateFns,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export type DateInput = Date | number | string;

export type DateFormatPreset =
  | "analyticsDay"
  | "analyticsMonth"
  | "analyticsMonthShortYear"
  | "analyticsUtcDateTime"
  | "chartShortDate"
  | "chartWeekdayDate"
  | "liveLogDateTime"
  | "year";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UTC_CONTEXT = tz("UTC");

const formatters: Record<DateFormatPreset, (date: Date) => string> = {
  analyticsDay: (date) => format(date, "d MMM", { locale: ptBR }),
  analyticsMonth: (date) => format(date, "MMM yyyy", { locale: ptBR }),
  analyticsMonthShortYear: (date) => format(date, "MMM yy", { locale: ptBR }),
  analyticsUtcDateTime: (date) =>
    intlFormat(
      date,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      },
      { locale: "pt-BR" },
    ),
  chartShortDate: (date) =>
    intlFormat(date, { month: "short", day: "numeric" }, { locale: "en-US" }),
  chartWeekdayDate: (date) =>
    intlFormat(date, { weekday: "short", month: "short", day: "numeric" }, { locale: "en-US" }),
  liveLogDateTime: (date) =>
    intlFormat(
      date,
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
      { locale: "pt-BR" },
    ),
  year: (date) => format(date, "yyyy"),
};

/** Normalize native date inputs while preserving JS date-only string semantics (UTC). */
export function toDate(value: DateInput): Date {
  if (typeof value === "string") {
    return parseISO(DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00Z` : value);
  }

  return toDateFns(value);
}

export function isDate(value: unknown): value is Date {
  return isDateFnsDate(value);
}

export function toValidDate(value: unknown): Date | null {
  if (!isDate(value) && typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const date = toDate(value);
  return isValid(date) ? date : null;
}

export function epochMilliseconds(value: DateInput): number {
  return getTime(toDate(value));
}

export function addCalendarDays(value: DateInput, amount: number): Date {
  return addDays(toDate(value), amount);
}

export function utcCalendarDayCount(startValue: DateInput, endValue: DateInput): number | null {
  const start = toValidDate(startValue);
  const end = toValidDate(endValue);
  if (!(start && end) || getTime(end) < getTime(start)) {
    return null;
  }

  return differenceInCalendarDays(end, start, { in: UTC_CONTEXT }) + 1;
}

export function utcCalendarDays(startValue: DateInput, endValue: DateInput): Date[] | null {
  const start = toValidDate(startValue);
  const end = toValidDate(endValue);
  if (!(start && end) || getTime(end) < getTime(start)) {
    return null;
  }

  return eachDayOfInterval({ start, end }, { in: UTC_CONTEXT });
}

export function utcDayOfWeek(value: DateInput): number {
  return getDay(toDate(value), { in: UTC_CONTEXT });
}

export function utcDateKey(value: DateInput): string {
  return format(toDate(value), "yyyy-MM-dd", { in: UTC_CONTEXT });
}

export function utcIsoString(value: DateInput): string {
  return format(toDate(value), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { in: UTC_CONTEXT });
}

export function formatDate(value: DateInput, preset: DateFormatPreset): string {
  return formatters[preset](toDate(value));
}
