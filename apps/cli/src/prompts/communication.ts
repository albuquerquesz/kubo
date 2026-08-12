import { DEFAULT_CONFIG } from "../constants";
import type { Backend, Communication } from "../types";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableSelect, preferValidInitial } from "./navigable";

export async function getCommunicationChoice(
  communication?: Communication,
  backend?: Backend,
  previousValue?: Communication,
) {
  if (communication !== undefined) return communication;

  if (backend === "none") {
    return "none" as Communication;
  }

  const options = [
    {
      value: "none" as Communication,
      label: "None",
      hint: "No email/communication provider",
    },
    {
      value: "resend" as Communication,
      label: "Resend",
      hint: "Transactional email for developers",
    },
    {
      value: "notifique" as Communication,
      label: "Notifique",
      hint: "Omnichannel BR messaging API (WhatsApp, SMS, email, …)",
    },
  ];

  const response = await navigableSelect<Communication>({
    message: "Select communication provider",
    options,
    initialValue: preferValidInitial(options, previousValue, DEFAULT_CONFIG.communication),
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });
  return response;
}
