import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { deriveSiteRoot } from "../public/preview/assets/preview-shell.mjs";
import {
  assertPreviewDirectory,
  scanPreviewDirectory,
  scanText,
} from "./check-public-preview.mjs";

describe("faithful public preview contract", () => {
  it("derives website links for root and repository Pages paths", () => {
    expect(deriveSiteRoot("/preview/")).toBe("/");
    expect(deriveSiteRoot("/axio-web/preview/")).toBe("/axio-web/");
    expect(() => deriveSiteRoot("/demo/")).toThrow(/preview path/i);
  });

  it("allows inert route keys but rejects real network capability", () => {
    expect(scanText('const key = "/api/stores"')).toEqual([]);
    expect(scanText('fetch("/api/stores")')).toContain("network primitive");
    expect(scanText("new XMLHttpRequest()")).toContain("network primitive");
    expect(scanText('const url = "https://private.example"')).toContain(
      "external URL",
    );
    expect(scanText('const apiKey = "live-secret-value"')).toContain(
      "credential value",
    );
  });

  it("reports a missing preview directory and required faithful files", () => {
    const root = mkdtempSync(join(tmpdir(), "axio-preview-incomplete-"));
    try {
      writeFileSync(join(root, "index.html"), "<!doctype html>");
      expect(scanPreviewDirectory(root)).toEqual(
        expect.arrayContaining([
          "missing required file: assets/product-main.js",
          "missing required file: assets/preview-responsive.css",
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("accepts the committed faithful public preview", () => {
    expect(() =>
      assertPreviewDirectory(join(process.cwd(), "public/preview")),
    ).not.toThrow();
  });
});
