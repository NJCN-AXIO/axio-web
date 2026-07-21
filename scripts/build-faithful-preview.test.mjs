import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import {
  PAGE_IDS,
  PRODUCT_COMMIT,
  buildFaithfulPreview,
} from "./build-faithful-preview.mjs";

const PRODUCT_REPO = process.env.AXIO_PRODUCT_REPO ?? "D:/shopee-auto-lister";
const productRepoUnavailable = !existsSync(PRODUCT_REPO);

const EXPECTED_FILES = [
  "index.html",
  "assets/product.css",
  "assets/supervisor.css",
  "assets/product-main.js",
  "assets/product-supervisor.js",
  "assets/matrix.html",
];

const STALE_CONCEPT_FILES = [
  "assets/preview.css",
  "assets/preview.mjs",
  "assets/preview-data.mjs",
  "assets/preview-state.mjs",
];

it("pins the product baseline and all page identifiers", () => {
  expect(PRODUCT_COMMIT).toBe("eef0f87");
  expect(PAGE_IDS).toEqual([
    "dashboard",
    "history",
    "task",
    "stores",
    "selection",
    "hotpick",
    "keywords",
    "orders",
    "tianji",
    "scoring",
    "shopboard",
    "optimize",
    "titlelearn",
    "ipcontrol",
    "config",
  ]);
});

it.skipIf(productRepoUnavailable)(
  "generates the faithful product shell with task active and local assets",
  () => {
    const output = mkdtempSync(join(tmpdir(), "axio-faithful-preview-"));

    try {
      const generated = buildFaithfulPreview({
        productRepo: PRODUCT_REPO,
        output,
        commit: PRODUCT_COMMIT,
      });

      expect(generated).toEqual(EXPECTED_FILES);
      for (const file of EXPECTED_FILES) {
        expect(existsSync(join(output, file))).toBe(true);
      }

      const html = readFileSync(join(output, "index.html"), "utf8");
      const main = readFileSync(join(output, "assets/product-main.js"), "utf8");
      const supervisor = readFileSync(
        join(output, "assets/product-supervisor.js"),
        "utf8",
      );
      const matrix = readFileSync(join(output, "assets/matrix.html"), "utf8");

      expect(html).toContain('id="page-task" class="page active');
      expect(html).not.toContain('id="page-dashboard" class="page active');
      expect(html).toContain('href="./assets/product.css"');
      expect(html).toContain('import "./assets/demo-transport.mjs";');
      expect(html).toContain('import "./assets/preview-shell.mjs";');
      expect(html).toContain('href="./assets/preview-responsive.css"');
      expect(html).toContain(
        'await loadProductScript("./assets/product-main.js")',
      );
      expect(html).toContain('globalThis.showPage("task", taskNav)');
      expect(html).toContain(
        'document.dispatchEvent(new Event("DOMContentLoaded"))',
      );
      expect(html).toContain(
        'await loadProductScript("./assets/product-supervisor.js")',
      );
      expect(html).not.toContain('<script src="./assets/product-main.js">');

      for (const pageId of PAGE_IDS) {
        expect(html).toContain(`id="page-${pageId}"`);
      }

      expect(main).toContain("demoRequest(");
      expect(supervisor).toContain("demoRequest(");
      expect(main).not.toMatch(/\bfetch\s*\(/);
      expect(supervisor).not.toMatch(/\bfetch\s*\(/);
      expect(matrix).toContain('import "./demo-transport.mjs";');
      expect(matrix).toContain('id="matrix-product-source"');

      const generatedSource = [html, main, supervisor, matrix].join("\n");
      expect(generatedSource).not.toContain("/static/");
      expect(generatedSource).not.toMatch(/https?:\/\//);
      for (const provider of [
        "6uss",
        "aigcfox",
        "gpt_6uss",
        "shitapi",
        "deepseek",
        "agnes",
      ]) {
        expect(generatedSource.toLowerCase()).not.toContain(provider);
      }
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
  },
  15_000,
);

it.skipIf(productRepoUnavailable)(
  "removes every stale concept-preview asset",
  () => {
    const output = mkdtempSync(join(tmpdir(), "axio-faithful-preview-stale-"));

    try {
      mkdirSync(join(output, "assets"), { recursive: true });
      for (const file of STALE_CONCEPT_FILES) {
        writeFileSync(join(output, file), "stale", "utf8");
      }

      buildFaithfulPreview({
        productRepo: PRODUCT_REPO,
        output,
        commit: PRODUCT_COMMIT,
      });

      for (const file of STALE_CONCEPT_FILES) {
        expect(existsSync(join(output, file))).toBe(false);
      }
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
  },
);
