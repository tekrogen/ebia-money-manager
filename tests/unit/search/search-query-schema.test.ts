import { describe, expect, it } from "vitest";

import { searchQuerySchema } from "@/features/search/schemas";

describe("searchQuerySchema", () => {
  it("rejects empty and single-character queries", () => {
    expect(searchQuerySchema.safeParse("").success).toBe(false);
    expect(searchQuerySchema.safeParse("a").success).toBe(false);
  });

  it("accepts trimmed two-character queries", () => {
    const parsed = searchQuerySchema.safeParse(" ab ");
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toBe("ab");
    }
  });

  it("rejects queries longer than 200 characters", () => {
    expect(searchQuerySchema.safeParse("a".repeat(201)).success).toBe(false);
  });
});
