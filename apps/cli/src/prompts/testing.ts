import { DEFAULT_CONFIG } from "../constants";
import type { Frontend, Testing } from "../types";
import { isPlaywrightAllowed } from "../utils/compatibility-rules";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableMultiselect } from "./navigable";

export async function getTestingChoice(
  testing?: Testing[],
  frontends?: Frontend[],
  previousValue?: Testing[],
) {
  if (testing !== undefined) return testing;

  const options: { value: Testing; label: string; hint: string }[] = [
    { value: "vitest", label: "Vitest", hint: "Fast unit test runner" },
  ];

  if (isPlaywrightAllowed(frontends ?? [])) {
    options.push({
      value: "playwright",
      label: "Playwright",
      hint: "End-to-end browser testing",
    });
  }

  const response = await navigableMultiselect<Testing>({
    message: "Select testing tools",
    options,
    required: false,
    initialValues: (previousValue ?? DEFAULT_CONFIG.testing)?.filter((t) =>
      options.some((o) => o.value === t),
    ),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}

export async function getTestingToAdd(config: { frontend?: Frontend[]; testing?: Testing[] }) {
  const existing = config.testing ?? [];
  const options: { value: Testing; label: string; hint: string }[] = [];

  if (!existing.includes("vitest")) {
    options.push({ value: "vitest", label: "Vitest", hint: "Fast unit test runner" });
  }

  if (!existing.includes("playwright") && isPlaywrightAllowed(config.frontend ?? [])) {
    options.push({
      value: "playwright",
      label: "Playwright",
      hint: "End-to-end browser testing",
    });
  }

  if (options.length === 0) return [];

  const response = await navigableMultiselect<Testing>({
    message: "Select testing tools to add",
    options,
    required: false,
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}
