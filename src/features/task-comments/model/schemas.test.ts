import { describe, expect, it } from "vitest";

import { commentBodySchema } from "./schemas";

describe("commentBodySchema", () => {
  it("trims a valid comment", () => {
    expect(commentBodySchema.parse("  Ready for review.  ")).toBe(
      "Ready for review.",
    );
  });

  it("rejects an empty comment", () => {
    expect(commentBodySchema.safeParse("   ").success).toBe(false);
  });

  it("rejects comments above the database limit", () => {
    expect(commentBodySchema.safeParse("a".repeat(10001)).success).toBe(false);
  });
});
