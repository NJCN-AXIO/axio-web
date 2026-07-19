import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { issueOpaqueToken } from "./tokens";

describe("issueOpaqueToken", () => {
  it("returns a URL-safe 256-bit token and only its SHA-256 storage value", () => {
    const token = issueOpaqueToken();

    expect(token.raw).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(token.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(token.hash).toBe(
      createHash("sha256").update(token.raw).digest("hex"),
    );
    expect(token.hash).not.toContain(token.raw);
  });

  it("issues independent raw values", () => {
    expect(issueOpaqueToken().raw).not.toBe(issueOpaqueToken().raw);
  });
});
