import { DEFAULT_CONFIG } from "../constants";
import type { Observability } from "../types";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableMultiselect } from "./navigable";

type ObservabilityProvider = Observability[number];

const options: { value: ObservabilityProvider; label: string; hint: string }[] = [
  {
    value: "himetrica",
    label: "Himetrica",
    hint: "Product analytics, errors, and Web Vitals for web apps",
  },
];

export async function getObservabilityChoice(
  observability?: Observability,
  previousValue?: Observability,
) {
  if (observability !== undefined) return observability;

  const response = await navigableMultiselect<ObservabilityProvider>({
    message: "Select observability providers",
    options,
    required: false,
    initialValues: previousValue ?? DEFAULT_CONFIG.observability,
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });
  return response;
}
