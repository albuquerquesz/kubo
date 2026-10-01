import { DEFAULT_CONFIG } from "../constants";
import type { Backend, Communication, CommunicationProvider } from "../types";
import { normalizeCommunication } from "../utils/config-processing";
import { UserCancelledError } from "../utils/errors";
import { isCancel, navigableMultiselect } from "./navigable";

const options = [
  {
    value: "arara" as CommunicationProvider,
    label: "AraraHQ",
    hint: "Recommended — WhatsApp messaging via the official Node SDK",
  },
  {
    value: "resend" as CommunicationProvider,
    label: "Resend",
    hint: "Transactional email for developers",
  },
  {
    value: "notifique" as CommunicationProvider,
    label: "Notifique",
    hint: "Omnichannel BR messaging API",
  },
];

export async function getCommunicationChoice(
  communication?: Communication,
  backend?: Backend,
  previousValue?: Communication,
) {
  if (communication !== undefined) return normalizeCommunication(communication);

  if (backend === "none") {
    return [] as Communication;
  }

  const response = await navigableMultiselect<CommunicationProvider>({
    message: "Select communication providers",
    options,
    required: false,
    initialValues: previousValue ?? DEFAULT_CONFIG.communication,
  });

  if (isCancel(response)) throw new UserCancelledError({ message: "Operation cancelled" });
  return response;
}
