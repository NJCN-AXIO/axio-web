import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("global theme contrast tokens", () => {
  it("uses a semantic link hover token with accessible values in both themes", () => {
    expect(css).toMatch(
      /\[data-theme="light"\][\s\S]*--link-hover:\s*#c43b20/i,
    );
    expect(css).toMatch(/\[data-theme="dark"\][\s\S]*--link-hover:\s*#ff6a4d/i);
    expect(css).toMatch(
      /\.site-footer__links a:hover[\s\S]*color:\s*var\(--link-hover\)/,
    );
  });
});
