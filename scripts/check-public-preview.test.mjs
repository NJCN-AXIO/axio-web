import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PREVIEW_WORKSPACES } from "../public/preview/assets/preview-data.mjs";
import {
  createPreviewState,
  deriveSiteRoot,
  reducePreviewState,
} from "../public/preview/assets/preview-state.mjs";
import {
  assertPreviewDirectory,
  scanPreviewDirectory,
} from "./check-public-preview.mjs";

describe("public preview contract", () => {
  it("ships exactly the six approved fictional workspaces", () => {
    expect(PREVIEW_WORKSPACES.map(({ id }) => id)).toEqual([
      "dashboard",
      "selection",
      "task",
      "pricing",
      "optimization",
      "risk",
    ]);
    expect(JSON.stringify(PREVIEW_WORKSPACES)).toContain("示例店铺");
  });

  it("advances the controlled task once per confirmation", () => {
    let state = createPreviewState();
    expect(state.taskStage).toBe("draft");
    for (const expected of ["preview", "confirmed", "verified", "verified"]) {
      state = reducePreviewState(state, { type: "advance-task" });
      expect(state.taskStage).toBe(expected);
    }
  });

  it("accepts only approved workspace identifiers", () => {
    const state = createPreviewState();
    expect(
      reducePreviewState(state, { type: "select-workspace", id: "pricing" }),
    ).toMatchObject({ activeWorkspace: "pricing", navOpen: false });
    expect(() =>
      reducePreviewState(state, { type: "select-workspace", id: "config" }),
    ).toThrow(/unknown workspace/i);
  });

  it("derives website links for root and repository Pages paths", () => {
    expect(deriveSiteRoot("/preview/")).toBe("/");
    expect(deriveSiteRoot("/axio-web/preview/")).toBe("/axio-web/");
    expect(() => deriveSiteRoot("/demo/")).toThrow(/preview path/i);
  });

  it("uses an isolated relative-asset shell without an iframe", () => {
    const html = readFileSync(
      join(process.cwd(), "public/preview/index.html"),
      "utf8",
    );
    expect(html).toContain('href="./assets/preview.css"');
    expect(html).toContain('src="./assets/preview.mjs"');
    expect(html).toContain("data-preview-main");
    expect(html).toContain("data-preview-nav");
    expect(html).not.toMatch(/<iframe|https?:\/\//i);
  });
});

describe("public preview safety scanner", () => {
  it("rejects backend, provider, network, external, credential, and production identifiers recursively", () => {
    const root = mkdtempSync(join(tmpdir(), "axio-preview-unsafe-"));
    try {
      mkdirSync(join(root, "assets"));
      mkdirSync(join(root, "assets/nested"));
      writeFileSync(
        join(root, "index.html"),
        '<script src="./assets/preview.mjs" type="module"></script>',
      );
      writeFileSync(join(root, "assets/preview.css"), "body{}");
      writeFileSync(
        join(root, "assets/preview-data.mjs"),
        'export const id="7539232"; export const url="https://deepseek.example";',
      );
      writeFileSync(
        join(root, "assets/preview-state.mjs"),
        'export const password="not-real";',
      );
      writeFileSync(join(root, "assets/preview.mjs"), 'fetch("/api/stores");');
      writeFileSync(join(root, "assets/nested/provider.txt"), "aigcfox");

      expect(scanPreviewDirectory(root)).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/backend route/i),
          expect.stringMatching(/network primitive/i),
          expect.stringMatching(/external URL/i),
          expect.stringMatching(/credential field/i),
          expect.stringMatching(/provider host/i),
          expect.stringMatching(/production identifier/i),
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports a missing preview directory without reading it", () => {
    const parent = mkdtempSync(join(tmpdir(), "axio-preview-missing-"));
    try {
      expect(scanPreviewDirectory(join(parent, "preview"))).toEqual([
        expect.stringMatching(/missing preview directory/i),
      ]);
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  it("reports missing required files", () => {
    const root = mkdtempSync(join(tmpdir(), "axio-preview-incomplete-"));
    try {
      expect(scanPreviewDirectory(root)).toEqual(
        expect.arrayContaining([
          "missing required file: index.html",
          "missing required file: assets/preview.mjs",
        ]),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("accepts the committed public preview and all required files", () => {
    expect(() =>
      assertPreviewDirectory(join(process.cwd(), "public/preview")),
    ).not.toThrow();
  });
});
