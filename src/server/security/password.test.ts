import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("stores an adaptive hash and verifies only the matching password", async () => {
    const password = "correct horse battery staple";
    const encoded = await hashPassword(password);

    expect(encoded).not.toContain(password);
    expect(encoded).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(encoded, password)).resolves.toBe(true);
    await expect(verifyPassword(encoded, "wrong password")).resolves.toBe(
      false,
    );
  });

  it("treats malformed stored hashes as failed verification", async () => {
    await expect(verifyPassword("not-an-argon-hash", "password")).resolves.toBe(
      false,
    );
  });
});
