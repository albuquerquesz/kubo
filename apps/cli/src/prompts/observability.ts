import { DEFAULT_CONFIG } from "../constants";
import type { Observability } from "../types";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableSelect, preferValidInitial } from "./navigable";

const options = [
  {
    value: "getmonitor" as Observability,
    label: "GetMonitor",
    hint: "Uptime monitoring, alerts, and hosted status pages",
  },
  {
    value: "none" as Observability,
    label: "None",
    hint: "Skip observability setup guidance",
  },
];

export async function getObservabilityChoice(
  observability?: Observability,
  previousValue?: Observability,
) {
  if (observability !== undefined) return observability;

  const response = await navigableSelect<Observability>({
    message: "Select observability provider",
    options,
    initialValue: preferValidInitial(options, previousValue, DEFAULT_CONFIG.observability),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });
  return response;
}
