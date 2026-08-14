import { DEFAULT_CONFIG } from "../constants";
import type { Auth, Backend, Frontend, Payments } from "../types";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableSelect, preferValidInitial } from "./navigable";

export async function getPaymentsChoice(
  payments?: Payments,
  auth?: Auth,
  backend?: Backend,
  frontends: Frontend[] = [],
  previousValue?: Payments,
) {
  if (payments !== undefined) return payments;

  if (backend === "none") {
    return "none" as Payments;
  }

  const options = [
    {
      value: "none" as Payments,
      label: "None",
      hint: "No payments integration",
    },
    {
      value: "abacatepay" as Payments,
      label: "AbacatePay",
      hint: "Hosted checkout with webhook reconciliation",
    },
  ];

  const hasWebFrontend = frontends.some((frontend) =>
    [
      "tanstack-router",
      "react-router",
      "tanstack-start",
      "next",
      "nuxt",
      "svelte",
      "solid",
      "astro",
    ].includes(frontend),
  );
  const isConvex = backend === "convex";
  const abacatePayDisabledReason = !hasWebFrontend
    ? "Requires a web frontend"
    : isConvex
      ? "Not supported with Convex"
      : undefined;

  const selectableOptions = options.map((option) => {
    if (option.value !== "abacatepay") return option;

    return {
      ...option,
      hint: abacatePayDisabledReason ?? option.hint,
      disabled: abacatePayDisabledReason !== undefined,
    };
  });

  const response = await navigableSelect<Payments>({
    message: "Select payments provider",
    options: selectableOptions,
    initialValue: preferValidInitial(selectableOptions, previousValue, DEFAULT_CONFIG.payments),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}
