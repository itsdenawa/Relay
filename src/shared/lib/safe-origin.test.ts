import { afterEach, describe, expect, it, vi } from "vitest";

import { getSafeRequestOrigin } from "./safe-origin";

describe("getSafeRequestOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows the configured canonical origin", () => {
    expect(
      getSafeRequestOrigin(
        "http://127.0.0.1:3000/login",
        "http://127.0.0.1:3000",
      ),
    ).toBe("http://127.0.0.1:3000");
  });

  it("rejects an arbitrary Origin header", () => {
    expect(
      getSafeRequestOrigin("https://evil.example", "http://127.0.0.1:3000"),
    ).toBe("http://127.0.0.1:3000");
  });

  it("allows the active Vercel preview host exactly", () => {
    vi.stubEnv("VERCEL_URL", "relay-preview.vercel.app");

    expect(
      getSafeRequestOrigin(
        "https://relay-preview.vercel.app",
        "https://relay-vert-seven.vercel.app",
      ),
    ).toBe("https://relay-preview.vercel.app");
  });
});
