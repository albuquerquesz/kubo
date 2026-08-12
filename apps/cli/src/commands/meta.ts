import { log } from "@clack/prompts";
import { Result } from "better-result";
import pc from "picocolors";

import { openUrl } from "../utils/open-url";

const DOCS_URL = "https://kubojs.dev/docs";
const BUILDER_URL = "https://kubojs.dev/new";

async function openExternalUrl(url: string, successMessage: string) {
  const result = await Result.tryPromise({
    try: () => openUrl(url),
    catch: () => null,
  });

  if (result.isOk()) {
    log.success(pc.blue(successMessage));
  } else {
    log.message(`Please visit ${url}`);
  }
}

export async function openDocsCommand() {
  await openExternalUrl(DOCS_URL, "Opened docs in your default browser.");
}

export async function openBuilderCommand() {
  await openExternalUrl(BUILDER_URL, "Opened builder in your default browser.");
}
