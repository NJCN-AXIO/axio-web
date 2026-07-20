import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PREVIEW_WORKSPACES } from "../public/preview/assets/preview-data.mjs";
import {
  createPreviewState,
  deriveSiteRoot,
  reducePreviewState,
} from "../public/preview/assets/preview-state.mjs";

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
