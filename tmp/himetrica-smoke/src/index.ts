class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const storage = new MemoryStorage();
const eventTarget = {
  addEventListener() {},
  removeEventListener() {},
};

Object.assign(globalThis, {
  localStorage: storage,
  sessionStorage: storage,
  navigator: { doNotTrack: "0", globalPrivacyControl: false, sendBeacon: undefined },
  location: { protocol: "https:", hostname: "smoke.example.test", pathname: "/", search: "" },
  document: {
    cookie: "",
    title: "Himetrica smoke",
    body: { scrollHeight: 1000, offsetHeight: 1000 },
    documentElement: { scrollHeight: 1000, offsetHeight: 1000 },
    addEventListener() {},
    removeEventListener() {},
  },
  window: {
    ...eventTarget,
    self: undefined,
    top: undefined,
    location: { hostname: "smoke.example.test", pathname: "/", search: "" },
    screen: { width: 1440, height: 900 },
    scrollY: 0,
    innerHeight: 800,
  },
});
(globalThis.window as { self: unknown; top: unknown }).self = globalThis.window;
(globalThis.window as { self: unknown; top: unknown }).top = globalThis.window;

const { HimetricaClient } = await import("@himetrica/tracker-js");

type RequestRecord = {
  url: string;
  body: Record<string, unknown>;
};

const requests: RequestRecord[] = [];

globalThis.fetch = (async (input, init) => {
  const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
  requests.push({ url: String(input), body });

  return new Response(JSON.stringify({ ok: true, dnt: false }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}) as typeof fetch;

const client = new HimetricaClient({
  apiKey: "hm_pk_smoke-test",
  apiUrl: "https://app.himetrica.com",
  autoTrackPageViews: false,
  autoTrackErrors: false,
  trackVitals: false,
});

client.track("builder_started", { source: "tmp-smoke" });
client.captureMessage("SDK smoke test", "info", { source: "tmp-smoke" });
client.trackPageView("/");
client.flush();

await new Promise((resolve) => setTimeout(resolve, 1_150));

if (requests.length < 2) {
  throw new Error(`Expected at least two requests, received ${requests.length}`);
}

if (!requests.some(({ url }) => url.endsWith("/api/t/e"))) {
  throw new Error("The custom event was not sent to the documented tracker endpoint");
}

if (!requests.some(({ url }) => url.endsWith("/api/t/ce"))) {
  throw new Error("The captured message was not sent to the documented error endpoint");
}

console.log(`Himetrica SDK smoke passed: ${requests.length} requests intercepted.`);
client.destroy();
