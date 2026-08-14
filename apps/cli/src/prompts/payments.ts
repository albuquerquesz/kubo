import { getPaymentCompatibilityIssue, type PaymentProvider } from "@kubojs/types";

import { DEFAULT_CONFIG } from "../constants";
import type { Auth, Backend, Frontend, Payments } from "../types";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableMultiselect } from "./navigable";

export async function getPaymentsChoice(
  payments?: Payments,
  auth?: Auth,
  backend?: Backend,
  frontends: Frontend[] = [],
  previousValue?: Payments,
) {
  if (payments !== undefined) return payments;

  if (backend === "none") {
    return [];
  }

  const options = [
    {
      value: "abacatepay" as PaymentProvider,
      label: "AbacatePay",
      hint: "Hosted checkout with webhook reconciliation",
    },
    {
      value: "stripe" as PaymentProvider,
      label: "Stripe",
      hint: "Embedded Checkout with a fulfillment webhook",
    },
  ];

  const getDisabledReason = (provider: PaymentProvider) => {
    const issue = getPaymentCompatibilityIssue({ provider, backend, frontends });
    if (issue === "requires-web-frontend") return "Requires a web frontend";
    if (issue === "convex-unsupported") return "Not supported with Convex";
    if (issue === "native-only-unsupported") return "Not supported with native-only frontends";
    if (issue === "sql-database-required") return "Requires a SQL database with Prisma or Drizzle";
    return undefined;
  };

  const selectableOptions = options.map((option) => {
    const disabledReason = getDisabledReason(option.value);
    return {
      ...option,
      hint: disabledReason ?? option.hint,
      disabled: disabledReason !== undefined,
    };
  });

  const response = await navigableMultiselect<PaymentProvider>({
    message: "Select payments providers",
    options: selectableOptions,
    required: false,
    initialValues: previousValue ?? DEFAULT_CONFIG.payments,
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });

  return response;
}
