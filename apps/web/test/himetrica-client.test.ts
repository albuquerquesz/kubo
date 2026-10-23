import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import type { HimetricaClient } from "@himetrica/tracker-js";

import { createHimetricaClientGetter } from "../src/lib/himetrica";

const fakeClient = {} as HimetricaClient;

describe("Himetrica client getter", () => {
  beforeEach(() => {
    Object.assign(globalThis, { window: globalThis });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  test("returns null without an API key", () => {
    const create = mock(() => fakeClient);
    const getClient = createHimetricaClientGetter(undefined, create);

    expect(getClient()).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  test("returns null outside the browser", () => {
    Reflect.deleteProperty(globalThis, "window");
    const create = mock(() => fakeClient);
    const getClient = createHimetricaClientGetter("hm_test", create);

    expect(getClient()).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  test("creates one client per page and reuses it", () => {
    const create = mock(() => fakeClient);
    const getClient = createHimetricaClientGetter("hm_test", create);

    expect(getClient()).toBe(fakeClient);
    expect(getClient()).toBe(fakeClient);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith("hm_test");
  });
});
