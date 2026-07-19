import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, it } from "vitest";

it("declares the approved models without a Session or sensitive credential fields", () => {
  const schema = readFileSync(resolve("prisma/schema.prisma"), "utf8");
  const models = Array.from(schema.matchAll(/^model\s+(\w+)\s+\{/gm), (match) =>
    match[1],
  );

  expect(models).toEqual([
    "User",
    "EmailVerificationToken",
    "DemoRequest",
    "License",
    "ClientRelease",
    "LaunchCode",
    "RateLimitEvent",
  ]);
  expect(schema).not.toMatch(/^model\s+Session\s+\{/m);
  expect(schema).not.toMatch(
    /marketplace|browserProfile|aiProvider|apiKey|cookie|signature/i,
  );
  expect(schema).toMatch(/model\s+License\s+\{[\s\S]*?expiresAt\s+DateTime\?/);
});
