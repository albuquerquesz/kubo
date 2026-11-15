import { describe, expect, test } from "bun:test";

import {
  BUILDER_REPLAY_APP,
  DEFAULT_POSTHOG_HOST,
  builderReplayConfig,
} from "../src/lib/builder-replay";

describe("builder session replay config", () => {
  test("records only explicitly, with inputs masked and no click autocapture", () => {
    const config = builderReplayConfig(undefined);
    expect(config.api_host).toBe(DEFAULT_POSTHOG_HOST);
    expect(config.disable_session_recording).toBe(true);
    expect(config.session_recording?.maskAllInputs).toBe(true);
    expect(config.autocapture).toBe(false);
    expect(config.respect_dnt).toBe(true);
    expect(config.persistence).toBe("localStorage");
  });

  test("uses a custom host and tags events as the web app", () => {
    expect(builderReplayConfig("https://eu.i.posthog.com").api_host).toBe(
      "https://eu.i.posthog.com",
    );
    expect(BUILDER_REPLAY_APP).toBe("kubojs-web");
  });
});
