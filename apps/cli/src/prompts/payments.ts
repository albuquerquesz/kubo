import { getPaymentCompatibilityIssue } from "@kubojs/types";

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
    {
      value: "stripe" as Payments,
      label: "Stripe",
      hint: "Embedded Checkout with a fulfillment webhook",
    },
  ];

  const getDisabledReason = (provider: Payments) => {
    const issue = getPaymentCompatibilityIssue({ provider, backend, frontends });
    if (issue === "requires-web-frontend") return "Requires a web frontend";
    if (issue === "convex-unsupported") return "Not supported with Convex";
    if (issue === "native-only-unsupported") return "Not supported with native-only frontends";
    if (issue === "sql-database-required") return "Requires a SQL database with Prisma or Drizzle";
    return undefined;
  };

  const selectableOptions = options.map((option) => {
    if (option.value === "none") return option;

    const disabledReason = getDisabledReason(option.value);
    return {
      ...option,
      hint: disabledReason ?? option.hint,
      disabled: disabledReason !== undefined,
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
