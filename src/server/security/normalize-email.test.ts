import { describe, expect, it } from "vitest";

import { normalizeEmail } from "./normalize-email";

describe("normalizeEmail", () => {
  it("trims surrounding whitespace and lowercases the address", () => {
    expect(normalizeEmail("  Seller@Example.COM ")).toBe(
      "seller@example.com",
    );
  });
});
