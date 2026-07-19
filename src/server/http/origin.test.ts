import { describe, expect, it } from "vitest";

import { assertSameOrigin } from "./origin";

function request(origin?: string) {
  return new Request("https://axio.example/api/demo-requests", {
    headers: origin ? { origin } : undefined,
    method: "POST",
  });
}

describe("assertSameOrigin", () => {
  it("accepts an Origin header matching the request URL", () => {
    expect(() => assertSameOrigin(request("https://axio.example"))).not.toThrow();
  });

  it.each([undefined, "null", "https://attacker.example", "not a url"])(
    "rejects an absent or foreign origin: %s",
    (origin) => {
      expect(() => assertSameOrigin(request(origin))).toThrowError(
        "Cross-origin request rejected",
      );
    },
  );
});
