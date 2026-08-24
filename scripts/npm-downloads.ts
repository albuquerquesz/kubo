import { format } from "node:util";

const PACKAGE_NAME = "create-kubojs";
const REGISTRY_URL = "https://registry.npmjs.org";
const DOWNLOADS_API_URL = "https://api.npmjs.org/downloads";
const MAX_RANGE_MONTHS = 18;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_REQUEST_ATTEMPTS = 3;

type FetchImplementation = typeof fetch;
type SleepImplementation = (milliseconds: number) => Promise<void>;

type PackageMetadata = {
  time?: {
    created?: string;
  };
};

type DownloadResponse = {
  start: string;
  end: string;
  package: string;
  downloads: Array<{ day: string; downloads: number }>;
};

export type DownloadReport = {
  packageName: string;
  start: string;
  end: string;
  totalDownloads: number;
  chunks: number;
};

const defaultSleep: SleepImplementation = (milliseconds) => Bun.sleep(milliseconds);

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateOnly(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || dateOnly(date) !== value) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addMonthsSafely(date: Date, months: number): Date {
  const targetMonth = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();

  return new Date(Date.UTC(targetYear, normalizedMonth, Math.min(date.getUTCDate(), lastDay)));
}

function rangeUrl(packageName: string, start: string, end: string): string {
  return `${DOWNLOADS_API_URL}/range/${start}:${end}/${encodeURIComponent(packageName)}`;
}

async function fetchJson<T>(
  url: string,
  fetchImpl: FetchImplementation,
  sleep: SleepImplementation = defaultSleep,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt++) {
    let response: Response | undefined;

    try {
      response = await fetchImpl(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { Accept: "application/json" },
      });
    } catch (error) {
      lastError = error;
    }

    if (response) {
      if (!response.ok) {
        const body = await response.text();
        const error = new Error(
          `Request failed (${response.status}): ${body || response.statusText}`,
        );

        if (response.status < 500 && response.status !== 429) {
          throw error;
        }

        lastError = error;
      } else {
        return (await response.json()) as T;
      }
    }

    if (attempt < MAX_REQUEST_ATTEMPTS) {
      await sleep(250 * 2 ** (attempt - 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function getPackageCreatedDate(
  packageName: string,
  fetchImpl: FetchImplementation = fetch,
  sleep: SleepImplementation = defaultSleep,
): Promise<string> {
  const metadata = await fetchJson<PackageMetadata>(
    `${REGISTRY_URL}/${encodeURIComponent(packageName)}`,
    fetchImpl,
    sleep,
  );
  const created = metadata.time?.created;

  if (!created) {
    throw new Error(`npm metadata did not include a creation date for ${packageName}`);
  }

  const createdDate = new Date(created);
  if (Number.isNaN(createdDate.getTime())) {
    throw new Error(`npm metadata included an invalid creation date for ${packageName}`);
  }

  return dateOnly(createdDate);
}

export async function getAllTimeDownloads(options?: {
  packageName?: string;
  fetchImpl?: FetchImplementation;
  sleep?: SleepImplementation;
  today?: string;
}): Promise<DownloadReport> {
  const packageName = options?.packageName ?? PACKAGE_NAME;
  const fetchImpl = options?.fetchImpl ?? fetch;
  const sleep = options?.sleep ?? defaultSleep;
  const today = options?.today ?? dateOnly(new Date());
  const start = await getPackageCreatedDate(packageName, fetchImpl, sleep);
  const endDate = parseDateOnly(today);
  let cursor = parseDateOnly(start);
  let totalDownloads = 0;
  let chunks = 0;

  if (cursor > endDate) {
    throw new Error(`Package creation date ${start} is after today ${today}`);
  }

  while (cursor <= endDate) {
    const nextCursor = addMonthsSafely(cursor, MAX_RANGE_MONTHS);
    const chunkEnd = nextCursor > endDate ? endDate : addDays(nextCursor, -1);
    const response = await fetchJson<DownloadResponse>(
      rangeUrl(packageName, dateOnly(cursor), dateOnly(chunkEnd)),
      fetchImpl,
      sleep,
    );

    for (const entry of response.downloads) {
      if (!Number.isFinite(entry.downloads) || entry.downloads < 0) {
        throw new Error(`Invalid download count for ${entry.day}: ${format(entry.downloads)}`);
      }

      totalDownloads += entry.downloads;
    }

    chunks++;
    cursor = addDays(chunkEnd, 1);
  }

  return { packageName, start, end: today, totalDownloads, chunks };
}

export function formatHumanReport(report: DownloadReport): string {
  return [
    `${report.packageName} downloads`,
    `Period: ${report.start} → ${report.end}`,
    `Total: ${report.totalDownloads.toLocaleString("en-US")} downloads`,
  ].join("\n");
}

export function parseArguments(arguments_: string[]): { json: boolean; help: boolean } {
  const unknownArgument = arguments_.find(
    (argument) => argument !== "--json" && argument !== "--help",
  );
  if (unknownArgument) {
    throw new Error(`Unknown argument: ${unknownArgument}`);
  }

  return { json: arguments_.includes("--json"), help: arguments_.includes("--help") };
}

export function formatHelp(): string {
  return [
    "Usage: bun run downloads [--json]",
    "",
    `Reports all-time npm downloads for ${PACKAGE_NAME}.`,
  ].join("\n");
}

async function main(): Promise<void> {
  const arguments_ = parseArguments(process.argv.slice(2));
  if (arguments_.help) {
    console.log(formatHelp());
    return;
  }

  const report = await getAllTimeDownloads();
  console.log(arguments_.json ? JSON.stringify(report, null, 2) : formatHumanReport(report));
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
