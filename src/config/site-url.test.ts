import { describe, expect, it } from "vitest";

import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("uses the documented HTTPS production default", () => {
    expect(siteUrl).toBe("https://njcn-axio.github.io/axio-web");
    expect(new URL(siteUrl).protocol).toBe("https:");
  });
});
