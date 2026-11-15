import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import {
  CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  readConsent,
  subscribeConsent,
  writeConsent,
} from "../src/lib/consent";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

describe("analytics consent", () => {
  beforeEach(() => {
    const target = new EventTarget();
    Object.assign(globalThis, {
      window: {
        localStorage: new MemoryStorage(),
        addEventListener: target.addEventListener.bind(target),
        removeEventListener: target.removeEventListener.bind(target),
        dispatchEvent: target.dispatchEvent.bind(target),
      },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  test("starts unanswered and without consent", () => {
    expect(readConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  test("stores the answer and notifies subscribers", () => {
    const listener = mock(() => {});
    const unsubscribe = subscribeConsent(listener);

    writeConsent("granted");
    expect(readConsent()).toBe("granted");
    expect(hasAnalyticsConsent()).toBe(true);

    writeConsent("denied");
    expect(hasAnalyticsConsent()).toBe(false);

    writeConsent(null);
    expect(readConsent()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    writeConsent("granted");
    expect(listener).toHaveBeenCalledTimes(3);
  });

  test("ignores unknown stored values", () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "maybe");
    expect(readConsent()).toBeNull();
  });

  test("is off outside the browser", () => {
    Reflect.deleteProperty(globalThis, "window");
    expect(readConsent()).toBeNull();
    expect(() => writeConsent("granted")).not.toThrow();
  });
});
