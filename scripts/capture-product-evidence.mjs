import { mkdir, readdir, rename, rmdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import sharp from "sharp";

export const OUTPUT_NAMES = Object.freeze([
  "supervisor.webp",
  "task-pricing.webp",
  "image-workspace.webp",
  "matrix-pricing.webp",
]);

const MIN_OUTPUT_BYTES = 40 * 1024;
const METADATA_FIELDS = [
  "exif",
  "icc",
  "iptc",
  "xmp",
  "comments",
  "orientation",
];

const SENSITIVE_PATTERNS = [
  { label: "email", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  {
    label: "phone",
    pattern: /(?:\+?86[-\s]?)?1[3-9]\d(?:[-\s]?\d){8}\b/,
  },
  {
    label: "phone",
    pattern: /(?:\+\d{1,3}[\s.-])?(?:\(?\d{2,4}\)?[\s.-])\d{3,4}[\s.-]\d{4}\b/,
  },
  { label: "URL", pattern: /https?:\/\//i },
  { label: "API key", pattern: /\bapi[\s_-]?key\b/i },
  { label: "token", pattern: /\btoken\b/i },
  { label: "cookie", pattern: /\bcookie\b/i },
  { label: "signature", pattern: /\bsignature\b/i },
];

export function assertLoopbackBaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Capture base URL must be an exact HTTP IPv4 loopback URL");
  }

  const isExactRoot =
    url.protocol === "http:" &&
    url.hostname === "127.0.0.1" &&
    url.pathname === "/" &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash;

  if (!isExactRoot) {
    throw new Error("Capture base URL must be an exact HTTP IPv4 loopback URL");
  }

  return url;
}

export function assertNoSensitiveText(values, sensitiveNames = []) {
  const names = sensitiveNames.map((name) => name.trim()).filter(Boolean);

  for (const rawValue of values) {
    const value = String(rawValue ?? "").trim();
    if (!value) continue;

    for (const { label, pattern } of SENSITIVE_PATTERNS) {
      if (pattern.test(value)) {
        throw new Error(`Sensitive ${label} text remains in capture target`);
      }
    }

    const normalized = value.toLocaleLowerCase("zh-CN");
    if (
      names.some((name) => normalized.includes(name.toLocaleLowerCase("zh-CN")))
    ) {
      throw new Error("Sensitive configured name remains in capture target");
    }
  }
}

export function assertNoWriteRequests(attempts) {
  if (attempts.length > 0) {
    throw new Error(
      `Product write request was attempted during evidence capture: ${attempts.join(", ")}`,
    );
  }
}

export function assertOutputManifest(assets, expectedNames = OUTPUT_NAMES) {
  if (assets.length !== expectedNames.length || assets.length !== 4) {
    throw new Error("Expected exactly four product-evidence WebP outputs");
  }

  const actualNames = assets.map(({ name }) => name).sort();
  const requiredNames = [...expectedNames].sort();
  if (actualNames.some((name, index) => name !== requiredNames[index])) {
    throw new Error(
      "Product-evidence output names do not match the required set",
    );
  }

  for (const asset of assets) {
    if (asset.format !== "webp") {
      throw new Error(`${asset.name} is not a WebP output`);
    }
    if (asset.size <= MIN_OUTPUT_BYTES) {
      throw new Error(`${asset.name} must be above 40KB`);
    }
    if (
      asset.width !== 1600 ||
      !Number.isInteger(asset.height) ||
      asset.height < 1
    ) {
      throw new Error(`${asset.name} must be exactly 1600px wide`);
    }
    if (
      METADATA_FIELDS.some((field) => {
        const value = asset.metadata?.[field];
        return Array.isArray(value) ? value.length > 0 : Boolean(value);
      })
    ) {
      throw new Error(`${asset.name} contains metadata that must be stripped`);
    }
  }
}

export async function runSequentialScenes(scenes, capture) {
  for (const scene of scenes) {
    await scene.activate();
    await capture(scene);
  }
}

function parseArguments(argv) {
  const options = { sensitiveNames: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!["--base-url", "--out", "--sensitive-name"].includes(flag) || !value) {
      throw new Error(`Unknown or incomplete argument: ${flag}`);
    }

    if (flag === "--base-url") options.baseUrl = value;
    if (flag === "--out") options.out = value;
    if (flag === "--sensitive-name") options.sensitiveNames.push(value);
    index += 1;
  }

  if (!options.baseUrl || !options.out) {
    throw new Error(
      "Usage: --base-url http://127.0.0.1:8080 --out <directory>",
    );
  }

  const environmentNames = (process.env.AXIO_CAPTURE_SENSITIVE_NAMES ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  options.sensitiveNames.push(...environmentNames);
  options.baseUrl = assertLoopbackBaseUrl(options.baseUrl);
  options.out = path.resolve(options.out);
  return options;
}

async function anonymizeTarget(locator, mode) {
  await locator.evaluate((root, captureMode) => {
    const queryAll = (selector) => [
      ...(root.matches?.(selector) ? [root] : []),
      ...root.querySelectorAll(selector),
    ];

    for (const input of queryAll("input, textarea")) {
      if (input.type === "number" || input.type === "range") {
        const minimum = Number(input.min);
        const maximum = Number(input.max);
        const neutral =
          Number.isFinite(minimum) && Number.isFinite(maximum)
            ? Math.round((minimum + maximum) / 2)
            : 10;
        input.value = String(neutral);
      } else if (
        !["button", "checkbox", "radio", "submit"].includes(input.type)
      ) {
        input.value = "";
        input.removeAttribute("value");
      }
      input.removeAttribute("placeholder");
      input.removeAttribute("autocomplete");
    }

    for (const select of queryAll("select")) {
      select.selectedIndex = select.options.length ? 0 : -1;
      const identitySelector = [select.id, select.name, select.className]
        .join(" ")
        .toLowerCase();
      if (/store|shop|company|account|profile/.test(identitySelector)) {
        for (const option of select.options) option.textContent = "示例店铺";
      }
    }

    for (const element of queryAll(
      "[data-store], [data-shop], [data-company], [data-account], .shop-name, .store-name, .company-name",
    )) {
      element.textContent = "示例店铺";
    }

    if (captureMode === "supervisor") {
      const transcript = root.querySelector(
        "#supervisor-conversation-transcript",
      );
      if (transcript) {
        transcript.textContent =
          "示例对话：检查今日任务状态并列出需要人工复核的事项。";
      }
      const evidenceNodes = root.querySelectorAll(
        "[id*='evidence'], [class*='evidence']",
      );
      for (const element of evidenceNodes) {
        element.textContent = "示例证据：任务记录完整，等待运营人员确认。";
      }
    }

    if (captureMode === "task") {
      const batchCommand = root.querySelector("#batch-command");
      const naturalCommand = root.querySelector("#nl-command");
      if (batchCommand) batchCommand.value = "采集示例商品并生成待审核上架任务";
      if (naturalCommand) naturalCommand.value = "检查定价并提交人工复核";
      for (const option of root.querySelectorAll(
        "#f-explicit-store-list option, [id*='store'] option, [name*='store'] option",
      )) {
        option.textContent = "示例店铺";
      }
    }

    if (captureMode === "image") {
      for (const element of queryAll(
        "[id*='identity'], [class*='identity'], [id*='account'], [class*='account']",
      )) {
        if (!element.matches("input, textarea, select"))
          element.textContent = "";
      }
    }

    root.style.setProperty("animation", "none", "important");
    root.style.setProperty("transition", "none", "important");
  }, mode);
}

async function visibleCaptureStrings(locator) {
  return locator.evaluate((root) => {
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        bounds.width > 0 &&
        bounds.height > 0
      );
    };

    const values = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (parent && isVisible(parent))
        values.push(walker.currentNode.nodeValue ?? "");
    }

    for (const element of [root, ...root.querySelectorAll("*")]) {
      if (!isVisible(element)) continue;
      for (const attribute of ["aria-label", "alt", "title", "placeholder"]) {
        const value = element.getAttribute(attribute);
        if (value) values.push(value);
      }
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        values.push(element.value);
      }
      if (element instanceof HTMLSelectElement && element.selectedIndex >= 0) {
        values.push(element.options[element.selectedIndex]?.textContent ?? "");
      }
    }
    return values;
  });
}

async function sanitizeAndScreenshot({
  locator,
  mode,
  pngPath,
  sensitiveNames,
}) {
  await locator.waitFor({ state: "visible", timeout: 15_000 });
  await anonymizeTarget(locator, mode);
  const strings = await visibleCaptureStrings(locator);
  assertNoSensitiveText(strings, sensitiveNames);
  await locator.screenshot({ path: pngPath, animations: "disabled" });
}

async function convertPng(pngPath, outputPath) {
  const pendingPath = `${outputPath}.pending`;
  try {
    await sharp(pngPath)
      .resize({ width: 1600 })
      .webp({ quality: 82, effort: 0, nearLossless: true })
      .toFile(pendingPath);
    await rename(pendingPath, outputPath);
  } finally {
    await unlink(pngPath).catch(() => {});
    await unlink(pendingPath).catch(() => {});
  }
}

async function inspectOutputs(outDirectory) {
  const names = (await readdir(outDirectory)).filter((name) =>
    name.toLowerCase().endsWith(".webp"),
  );

  return Promise.all(
    names.map(async (name) => {
      const filePath = path.join(outDirectory, name);
      const [fileStats, metadata] = await Promise.all([
        stat(filePath),
        sharp(filePath).metadata(),
      ]);
      return {
        name,
        size: fileStats.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        metadata,
      };
    }),
  );
}

async function runCapture(options) {
  await mkdir(options.out, { recursive: true });
  const tempDirectory = path.join(
    path.dirname(options.out),
    `.tmp-product-evidence-${process.pid}`,
  );
  await mkdir(tempDirectory, { recursive: false });

  for (const name of OUTPUT_NAMES) {
    await unlink(path.join(options.out, name)).catch(() => {});
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1400 },
    deviceScaleFactor: 1,
  });
  const origin = options.baseUrl.origin;
  const forwardedWriteRequests = [];
  const blockedWriteRequests = [];

  await page.route("**/*", async (route) => {
    const request = route.request();
    let requestUrl;
    try {
      requestUrl = new URL(request.url());
    } catch {
      await route.abort("blockedbyclient");
      return;
    }

    if (request.method() !== "GET") {
      blockedWriteRequests.push(`${request.method()} ${requestUrl.pathname}`);
      await route.abort("blockedbyclient");
      return;
    }
    if (requestUrl.origin !== origin) {
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });

  try {
    await page.goto(options.baseUrl.href, { waitUntil: "domcontentloaded" });

    const scenes = [
      {
        name: OUTPUT_NAMES[0],
        mode: "supervisor",
        locator: page.locator("#dashboard-supervisor-report"),
        activate: () => page.evaluate(() => window.showPage?.("dashboard")),
      },
      {
        name: OUTPUT_NAMES[1],
        mode: "task",
        locator: page.locator("#page-task"),
        activate: () => page.evaluate(() => window.showPage?.("task")),
      },
      {
        name: OUTPUT_NAMES[2],
        mode: "image",
        locator: page.locator(".image-workspace"),
        activate: () =>
          page.evaluate(() => {
            window.showPage?.("optimize");
            window.selectOptType?.("image");
          }),
      },
    ];

    await runSequentialScenes(scenes, async (capture) => {
      const pngPath = path.join(tempDirectory, `${capture.name}.png`);
      const outputPath = path.join(options.out, capture.name);
      await sanitizeAndScreenshot({
        ...capture,
        pngPath,
        sensitiveNames: options.sensitiveNames,
      });
      await convertPng(pngPath, outputPath);
    });

    await page.evaluate(() => window.showPage?.("shopboard"));
    const frame = page.frameLocator("#shopboard-frame");
    const pricingTab = frame.locator("#tabPricing");
    await pricingTab.waitFor({ state: "visible", timeout: 15_000 });
    await pricingTab.evaluate((element) => element.click());
    const pricing = frame.locator("#contentPricing");
    await pricing.waitFor({ state: "visible", timeout: 15_000 });
    await frame.locator("#toolbarFilters").evaluate((element) => {
      element.style.display = "none";
    });
    await frame.locator("#matrixDataSummary").evaluate((element) => {
      element.style.display = "none";
    });
    const pricingPng = path.join(tempDirectory, `${OUTPUT_NAMES[3]}.png`);
    await sanitizeAndScreenshot({
      locator: pricing,
      mode: "pricing",
      pngPath: pricingPng,
      sensitiveNames: options.sensitiveNames,
    });
    await convertPng(pricingPng, path.join(options.out, OUTPUT_NAMES[3]));

    assertNoWriteRequests(forwardedWriteRequests);
    const assets = await inspectOutputs(options.out);
    assertOutputManifest(assets);
    if (blockedWriteRequests.length > 0) {
      console.log(
        `Blocked ${blockedWriteRequests.length} non-GET product requests before transmission`,
      );
    }
    return assets;
  } finally {
    await browser.close();
    const leftovers = await readdir(tempDirectory).catch(() => []);
    await Promise.all(
      leftovers.map((name) =>
        unlink(path.join(tempDirectory, name)).catch(() => {}),
      ),
    );
    await rmdir(tempDirectory).catch(() => {});
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const assets = await runCapture(options);
  for (const asset of assets.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    console.log(
      `${asset.name}: ${asset.width}x${asset.height}, ${asset.size} bytes`,
    );
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
