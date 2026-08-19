import { describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

describe("static SEO resources", () => {
  it("publishes canonical public routes in the sitemap", () => {
    const entries = sitemap();

    expect(entries).toHaveLength(8);
    expect(entries.map((entry) => entry.url)).toContain(
      "https://njcn-axio.github.io/axio-web/download/",
    );
  });

  it("allows indexing and points crawlers to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://njcn-axio.github.io/axio-web/sitemap.xml",
    });
  });
});
