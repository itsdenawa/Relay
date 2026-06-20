import { describe, expect, it } from "vitest";

import { parsePublicEnvironment } from "./env";

describe("parsePublicEnvironment", () => {
  it("allows the application to run before Supabase is configured", () => {
    expect(parsePublicEnvironment({})).toEqual({});
  });

  it("accepts a complete Supabase configuration", () => {
    expect(
      parsePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });
  });

  it("rejects partial Supabase configuration", () => {
    expect(() =>
      parsePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow("Supabase URL and publishable key must be configured together");
  });
});
