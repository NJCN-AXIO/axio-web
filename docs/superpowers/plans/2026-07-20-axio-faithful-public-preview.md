# AXIO Faithful Public Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the concept preview with a faithful, fully navigable static copy of AXIO product commit `eef0f87`, backed only by sanitized browser-local simulation data.

**Architecture:** A deterministic import script reads only committed product frontend blobs with `git show`, transforms resource paths and request calls, and writes committed static assets under `public/preview/`. The imported product DOM/CSS remains the visual source of truth, while focused fixture, transport, state, shell, and responsive modules provide safe browser-local behavior without any network primitive.

**Tech Stack:** Next.js 16 static export, TypeScript, Vitest, Playwright, Node.js ESM, committed HTML/CSS/classic JavaScript product assets.

## Global Constraints

- Product UI source is exactly `D:\shopee-auto-lister` commit `eef0f87`; never read its dirty worktree files.
- The website remains at `D:\Desktop\AXIO web`; do not modify the product repository.
- The primary website CTA copy is exactly `在线体验` and its href is exactly `/preview/`.
- Preview default page is exactly `task` / “新建任务”.
- All 15 approved page entries must be present and navigable.
- Preview runtime must not call `fetch`, XHR, WebSocket, EventSource, sendBeacon, or an external script.
- Only fictional fixtures may ship; no real store, account, order, product, task, credential, provider host, or production identifier.
- Root Pages paths and repository Pages paths under `/axio-web/` must both work.
- Desktop product layout remains faithful; mobile changes are additive and may not alter desktop geometry.
- Every behavior change follows RED, GREEN, REFACTOR and ends in an atomic commit.

---

## File Map

- `scripts/build-faithful-preview.mjs`: read committed product blobs and deterministically transform them.
- `scripts/build-faithful-preview.test.mjs`: pin source baseline, generated contract, full page list, and default page.
- `scripts/check-public-preview.mjs`: scan the generated assets for network capability and sensitive content.
- `public/preview/index.html`: generated, sanitized product shell.
- `public/preview/assets/product.css`, `supervisor.css`: generated product styles.
- `public/preview/assets/product-main.js`, `product-supervisor.js`: generated product scripts using `demoRequest`.
- `public/preview/assets/matrix.html`: generated matrix operations page.
- `public/preview/assets/demo-fixtures.mjs`: fictional initial records for every product domain.
- `public/preview/assets/demo-state.mjs`: session-local state and deterministic mutations.
- `public/preview/assets/demo-transport.mjs`: Response-compatible local route dispatcher.
- `public/preview/assets/preview-shell.mjs`: default page, site links, preview status, and mobile drawer.
- `public/preview/assets/preview-responsive.css`: public mobile adaptations layered after product CSS.
- `src/content/zh-cn.ts`: primary CTA label and destination.
- `tests/e2e/public-preview.spec.ts`: full public-preview acceptance.

### Task 1: Route the Website Primary CTA to the Product Preview

**Files:**
- Modify: `src/content/zh-cn.test.ts`
- Modify: `src/content/zh-cn.ts`

**Interfaces:**
- Consumes: existing `SiteContent.hero.primaryCta`.
- Produces: `{ label: "在线体验", href: "/preview/" }` for desktop header, hero, and mobile navigation.

- [ ] **Step 1: Write the failing CTA contract**

```ts
it("routes the primary action to the static online experience", () => {
  expect(zhCN.hero.primaryCta).toEqual({
    label: "在线体验",
    href: "/preview/",
  });
});
```

- [ ] **Step 2: Run `npm test -- src/content/zh-cn.test.ts`**

Expected: FAIL because the current value is “预约产品演示” with `/demo`.

- [ ] **Step 3: Change the shared content value**

```ts
primaryCta: { label: "在线体验", href: "/preview/" },
```

- [ ] **Step 4: Run `npm test -- src/content/zh-cn.test.ts`**

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/content/zh-cn.ts src/content/zh-cn.test.ts
git commit -m "feat: route primary cta to online preview"
```

### Task 2: Import the Committed Product Interface Deterministically

**Files:**
- Create: `scripts/build-faithful-preview.test.mjs`
- Create: `scripts/build-faithful-preview.mjs`
- Replace: `public/preview/index.html`
- Create: `public/preview/assets/product.css`
- Create: `public/preview/assets/supervisor.css`
- Create: `public/preview/assets/product-main.js`
- Create: `public/preview/assets/product-supervisor.js`
- Create: `public/preview/assets/matrix.html`
- Delete: `public/preview/assets/preview-data.mjs`
- Delete: `public/preview/assets/preview-state.mjs`

**Interfaces:**
- Consumes: `readCommittedFile(repo, commit, path): string`.
- Produces: `buildFaithfulPreview({ productRepo, output, commit }): string[]`.
- Generated scripts call global `demoRequest(input, init)`.

- [ ] **Step 1: Write failing importer tests**

```js
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRODUCT_COMMIT,
  PAGE_IDS,
  buildFaithfulPreview,
} from "./build-faithful-preview.mjs";

it("pins the product baseline and all page identifiers", () => {
  expect(PRODUCT_COMMIT).toBe("eef0f87");
  expect(PAGE_IDS).toEqual([
    "dashboard", "history", "task", "stores", "selection",
    "hotpick", "keywords", "orders", "tianji", "scoring",
    "shopboard", "optimize", "titlelearn", "ipcontrol", "config",
  ]);
});

it("generates the product shell with task active and local assets", () => {
  const output = mkdtempSync(join(tmpdir(), "axio-faithful-preview-"));
  try {
    buildFaithfulPreview({
      productRepo: "D:/shopee-auto-lister",
      output,
      commit: PRODUCT_COMMIT,
    });
    const html = readFileSync(join(output, "index.html"), "utf8");
    const main = readFileSync(join(output, "assets/product-main.js"), "utf8");
    expect(html).toContain('id="page-task" class="page active');
    expect(html).toContain('href="./assets/product.css"');
    expect(main).toContain("demoRequest(");
    expect(main).not.toMatch(/\bfetch\s*\(/);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run `npm test -- scripts/build-faithful-preview.test.mjs`**

Expected: FAIL because the importer module does not exist.

- [ ] **Step 3: Implement the committed-blob reader and asserted transforms**

```js
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const PRODUCT_COMMIT = "eef0f87";
export const PAGE_IDS = Object.freeze([
  "dashboard", "history", "task", "stores", "selection",
  "hotpick", "keywords", "orders", "tianji", "scoring",
  "shopboard", "optimize", "titlelearn", "ipcontrol", "config",
]);

export function readCommittedFile(repo, commit, path) {
  return execFileSync("git", ["-C", repo, "show", `${commit}:${path}`], {
    encoding: "utf8",
    windowsHide: true,
  });
}

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0 || source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected one ${label}`);
  }
  return source.replace(before, after);
}

export function transformProductScript(source) {
  return source.replaceAll(/\bfetch\s*\(/g, "demoRequest(");
}

export function transformIndex(source) {
  let html = source
    .replace(/\/static\/css\/style\.css[^"]*/g, "./assets/product.css")
    .replace(/\/static\/css\/supervisor\.css[^"]*/g, "./assets/supervisor.css")
    .replace(/\/static\/116shop_dashboard\.html/g, "./assets/matrix.html")
    .replace(/\/static\/js\/supervisor\.js[^"]*/g, "./assets/product-supervisor.js")
    .replace(/\/static\/js\/main\.js[^"]*/g, "./assets/product-main.js")
    .replaceAll("Shopee Auto", "AXIO 智核");
  html = replaceOnce(
    html,
    'class="nav-item active" data-page="dashboard"',
    'class="nav-item" data-page="dashboard"',
    "dashboard nav",
  );
  html = replaceOnce(
    html,
    'class="nav-item" data-page="task"',
    'class="nav-item active" data-page="task"',
    "task nav",
  );
  html = replaceOnce(
    html,
    'id="page-dashboard" class="page active dashboard-page"',
    'id="page-dashboard" class="page dashboard-page"',
    "dashboard page",
  );
  html = replaceOnce(
    html,
    'id="page-task" class="page page-width-normal task-workspace"',
    'id="page-task" class="page active page-width-normal task-workspace"',
    "task page",
  );
  return html;
}
```

The build function writes the six generated files, asserts every replacement count, and injects `demo-transport.mjs` before generated product scripts.

- [ ] **Step 4: Generate assets**

Run: `node scripts/build-faithful-preview.mjs --product-repo D:\shopee-auto-lister --output public\preview`

Expected: six generated files, all 15 page roots, and “新建任务” active.

- [ ] **Step 5: Re-run the importer test**

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add scripts/build-faithful-preview.mjs scripts/build-faithful-preview.test.mjs public/preview
git commit -m "feat: import faithful product preview shell"
```

### Task 3: Add Browser-Local Fixtures and Transport

**Files:**
- Create: `public/preview/assets/demo-fixtures.mjs`
- Create: `public/preview/assets/demo-state.mjs`
- Create: `public/preview/assets/demo-transport.mjs`
- Create: `scripts/demo-transport.test.mjs`

**Interfaces:**
- Produces: `createDemoState(): DemoState`.
- Produces: `dispatchDemoRequest(state, input, init): DemoResponse`.
- Produces global `demoRequest(input, init): Promise<DemoResponse>`.
- `DemoResponse` exposes `ok`, `status`, `json()`, `text()`, and `blob()`.

- [ ] **Step 1: Write failing transport tests**

```js
import { describe, expect, it } from "vitest";
import { createDemoState } from "../public/preview/assets/demo-state.mjs";
import { dispatchDemoRequest } from "../public/preview/assets/demo-transport.mjs";

it("returns fictional stores without network access", async () => {
  const state = createDemoState();
  const response = dispatchDemoRequest(state, "/api/stores", { method: "GET" });
  expect(response.ok).toBe(true);
  expect(await response.json()).toMatchObject({
    stores: expect.arrayContaining([
      expect.objectContaining({ name: "演示店铺 A" }),
    ]),
  });
});

it("creates and advances a task in shared local state", async () => {
  const state = createDemoState();
  const created = dispatchDemoRequest(state, "/api/task/create", {
    method: "POST",
    body: JSON.stringify({ keyword: "桌面收纳", count: 6 }),
  });
  const { task_id } = await created.json();
  dispatchDemoRequest(state, `/api/task/${task_id}/execute`, { method: "POST" });
  const status = dispatchDemoRequest(state, `/api/task/${task_id}/status`, {});
  expect(await status.json()).toMatchObject({ status: "waiting_confirm" });
});
```

- [ ] **Step 2: Run `npm test -- scripts/demo-transport.test.mjs`**

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement response and state primitives**

```js
export class DemoResponse {
  constructor(body, status = 200) {
    this.body = body;
    this.status = status;
    this.ok = status >= 200 && status < 300;
  }
  async json() { return structuredClone(this.body); }
  async text() {
    return typeof this.body === "string" ? this.body : JSON.stringify(this.body);
  }
  async blob() {
    return new Blob([await this.text()], { type: "application/json" });
  }
}

export function normalizeDemoRequest(input, init = {}) {
  const url = new URL(String(input), "https://preview.invalid");
  return {
    method: String(init.method || "GET").toUpperCase(),
    path: url.pathname,
    searchParams: url.searchParams,
    body: typeof init.body === "string" ? JSON.parse(init.body) : init.body,
  };
}
```

```js
export function createDemoState() {
  return structuredClone({
    stores: DEMO_FIXTURES.stores,
    tasks: DEMO_FIXTURES.tasks,
    keywords: DEMO_FIXTURES.keywords,
    candidates: DEMO_FIXTURES.candidates,
    orders: DEMO_FIXTURES.orders,
    rules: DEMO_FIXTURES.rules,
    taskSequence: 4,
  });
}
```

Unknown paths return `404` with `{ error: "演示接口未覆盖" }`; there is no real-request fallback.

- [ ] **Step 4: Re-run the transport test**

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add public/preview/assets/demo-fixtures.mjs public/preview/assets/demo-state.mjs public/preview/assets/demo-transport.mjs scripts/demo-transport.test.mjs
git commit -m "feat: add local preview transport"
```

### Task 4: Make New Task the Complete Default Workflow

**Files:**
- Create: public/preview/assets/preview-shell.mjs
- Modify: public/preview/assets/demo-fixtures.mjs
- Modify: public/preview/assets/demo-state.mjs
- Modify: public/preview/assets/demo-transport.mjs
- Replace: tests/e2e/public-preview.spec.ts

**Interfaces:**
- Consumes imported product function showPage(page, element) and existing task handlers.
- Produces deriveSiteRoot(pathname): string.
- Produces task states draft -> preview -> waiting_confirm -> completed.

- [ ] **Step 1: Write the failing default-page and task-flow E2E**

    test("opens the faithful new-task workspace and completes locally", async ({ page }) => {
      const writes = [];
      page.on("request", (request) => {
        if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
      });
      await page.goto("./preview/");
      await expect(page.locator("#page-task")).toHaveClass(/active/);
      await page.locator("#task-input").fill("桌面收纳用品，马来站，6 件");
      await page.getByRole("button", { name: /解析|生成/ }).first().click();
      await expect(page.locator("#task-preview")).toBeVisible();
      await page.getByRole("button", { name: /确认|开始执行/ }).first().click();
      await expect(page.getByText(/模拟任务已完成/)).toBeVisible();
      expect(writes).toEqual([]);
    });

- [ ] **Step 2: Run focused E2E and observe RED**

Run: npm run build, serve out on port 3002, then run npx playwright test tests/e2e/public-preview.spec.ts.

Expected: FAIL because local task endpoints and the preview shell are incomplete.

- [ ] **Step 3: Implement the shell and task route sequence**

    export function deriveSiteRoot(pathname) {
      const marker = "/preview/";
      const index = pathname.indexOf(marker);
      if (index < 0) throw new Error("Expected preview path");
      return pathname.slice(0, index + 1) || "/";
    }

    const root = deriveSiteRoot(location.pathname);
    document.querySelector("[data-site-home]")?.setAttribute("href", root);
    document.documentElement.dataset.previewMode = "local";
    document.addEventListener("DOMContentLoaded", () => {
      const item = document.querySelector('[data-page="task"]');
      if (item && typeof globalThis.showPage === "function") {
        globalThis.showPage("task", item);
      }
    });

Task handlers return the exact properties consumed by imported parse, preflight, status, confirmation, and result renderers. Poll transitions are deterministic and use no timer longer than 500ms.

- [ ] **Step 4: Re-run focused E2E**

Expected: desktop and mobile projects PASS with zero request writes.

- [ ] **Step 5: Commit**

    git add public/preview/assets tests/e2e/public-preview.spec.ts
    git commit -m "feat: simulate complete new task workflow"

### Task 5: Cover Dashboard, Task History, and Store Management

**Files:**
- Modify: public/preview/assets/demo-fixtures.mjs
- Modify: public/preview/assets/demo-state.mjs
- Modify: public/preview/assets/demo-transport.mjs
- Modify: tests/e2e/public-preview.spec.ts

**Interfaces:**
- Produces dashboard summary/overview, catalog summary, supervisor report, task list/status, and store list/filter responses.
- Reuses the task created by Task 4.

- [ ] **Step 1: Write failing page tests**

    for (const entry of [
      { label: "控制台", selector: "#page-dashboard", proof: /演示数据/ },
      { label: "任务历史", selector: "#page-history", proof: /桌面收纳/ },
      { label: "店铺管理", selector: "#page-stores", proof: /演示店铺 A/ },
    ]) {
      test(entry.label + " renders local operational data", async ({ page }) => {
        await page.goto("./preview/");
        await page.getByText(entry.label, { exact: true }).click();
        await expect(page.locator(entry.selector)).toHaveClass(/active/);
        await expect(page.locator(entry.selector)).toContainText(entry.proof);
      });
    }

- [ ] **Step 2: Run and observe RED**

Run: npx playwright test tests/e2e/public-preview.spec.ts -g "local operational data".

Expected: FAIL on missing route fixtures.

- [ ] **Step 3: Add exact route groups**

    [
      "GET /api/dashboard/summary",
      "GET /api/dashboard/overview",
      "GET /api/product-catalog/summary",
      "GET /api/supervisor/report",
      "GET /api/tasks",
      "GET /api/stores",
    ]

Each response populates IDs referenced by imported renderers and uses only fictional values 演示店铺 A, 演示店铺 B, 马来演示站, and 泰国演示站.

- [ ] **Step 4: Re-run focused tests**

Expected: PASS.

- [ ] **Step 5: Commit**

    git add public/preview/assets tests/e2e/public-preview.spec.ts
    git commit -m "feat: simulate dashboard history and stores"

### Task 6: Cover the Complete Selection Decision Chain

**Files:**
- Modify: public/preview/assets/demo-fixtures.mjs
- Modify: public/preview/assets/demo-state.mjs
- Modify: public/preview/assets/demo-transport.mjs
- Modify: tests/e2e/public-preview.spec.ts

**Interfaces:**
- Produces local data and mutations for selection, hotpick, keywords, orders, tianji, and scoring.
- Keyword import mutates the same collection returned by keyword-library reads.

- [ ] **Step 1: Write the failing chain test**

    test("moves a fictional candidate through the selection chain", async ({ page }) => {
      await page.goto("./preview/");
      for (const label of ["选品决策", "热销采集", "关键词库", "订单回流", "田忌赛马", "候选池"]) {
        await page.getByText(label, { exact: true }).click();
        await expect(page.locator(".page.active")).toBeVisible();
      }
      await page.getByText("热销采集", { exact: true }).click();
      await page.getByRole("button", { name: /导入关键词/ }).first().click();
      await page.getByText("关键词库", { exact: true }).click();
      await expect(page.locator("#page-keywords")).toContainText("桌面收纳");
    });

- [ ] **Step 2: Run and observe RED**

Run: npx playwright test tests/e2e/public-preview.spec.ts -g "selection chain".

Expected: FAIL at the first uncovered route or mutation.

- [ ] **Step 3: Add the route groups**

    [
      "GET /api/selection/candidates",
      "POST /api/selection/candidates/:id/import-keyword",
      "GET /api/keywords",
      "GET /api/keywords/analysis",
      "POST /api/keywords/import",
      "POST /api/keywords",
      "PUT /api/keywords/:id",
      "DELETE /api/keywords/:id",
      "GET /api/orders",
      "POST /api/orders/sync",
      "POST /api/orders/import-keywords",
      "POST /api/hotpick/collect",
      "POST /api/hotpick/import",
      "POST /api/scoring/score",
    ]

Add exact handlers for every route and preserve imported keyword state across navigation.

- [ ] **Step 4: Re-run and observe GREEN**

Expected: PASS.

- [ ] **Step 5: Commit**

    git add public/preview/assets tests/e2e/public-preview.spec.ts
    git commit -m "feat: simulate selection decision chain"

### Task 7: Cover Matrix, Optimization, Titles, Risk, Configuration, and Supervisor

**Files:**
- Modify: public/preview/assets/matrix.html
- Modify: public/preview/assets/demo-fixtures.mjs
- Modify: public/preview/assets/demo-state.mjs
- Modify: public/preview/assets/demo-transport.mjs
- Modify: tests/e2e/public-preview.spec.ts

**Interfaces:**
- Produces all remaining page initialization responses and local-only mutations.
- Matrix retains dashboard/battle-plan tab switching and filters.

- [ ] **Step 1: Write failing per-page tests**

    const pages = [
      ["矩阵运营", "#page-shopboard"],
      ["智能优化", "#page-optimize"],
      ["标题学习", "#page-titlelearn"],
      ["违禁管控", "#page-ipcontrol"],
      ["系统配置", "#page-config"],
    ];
    for (const [label, selector] of pages) {
      test(label + " supports local simulation", async ({ page }) => {
        await page.goto("./preview/");
        await page.getByText(label, { exact: true }).click();
        await expect(page.locator(selector)).toHaveClass(/active/);
        await expect(page.locator(selector)).toContainText(/演示|模拟|本地/);
        await page.locator(selector).getByRole("button").first().click();
        await expect(page.locator(selector)).toContainText(/完成|成功|已更新|预览/);
      });
    }

- [ ] **Step 2: Run and observe RED**

Run: npx playwright test tests/e2e/public-preview.spec.ts -g "local simulation".

Expected: FAIL on missing routes or missing feedback.

- [ ] **Step 3: Implement explicit handlers**

    [
      "/api/pricing/shadow",
      "/api/pricing/shadow/approve",
      "/api/ai/status",
      "/api/ai/test",
      "/api/ai/switch",
      "/api/supervisor/authority",
      "/api/supervisor/commands/preview",
      "/api/optimize/run",
      "/api/optimize/jobs/:id",
      "/api/optimize/images/sku-preview",
      "/api/optimize/images/preview",
      "/api/ip-brands",
      "/api/ip-brands/add",
      "/api/ip-scan",
      "/api/title-library/candidates",
      "/api/title-library/candidates/review",
      "/api/title-library/candidates/score",
      "/api/title-library/candidates/merge",
      "/api/cat-groups",
      "/api/cat-templates",
    ]

Replace any embedded real matrix rows with fictional rows before committing.

- [ ] **Step 4: Re-run and observe GREEN**

Expected: PASS for every remaining page.

- [ ] **Step 5: Commit**

    git add public/preview/assets tests/e2e/public-preview.spec.ts
    git commit -m "feat: complete local product simulations"

### Task 8: Harden Mobile Behavior and the New Safety Contract

**Files:**
- Create: public/preview/assets/preview-responsive.css
- Modify: public/preview/assets/preview-shell.mjs
- Modify: public/preview/index.html
- Modify: scripts/check-public-preview.mjs
- Replace: scripts/check-public-preview.test.mjs
- Modify: tests/e2e/public-preview.spec.ts

**Interfaces:**
- Scanner requires the generated shell, product assets, transport, fixtures, shell, responsive CSS, and matrix page.
- Mobile shell exposes data-preview-menu, data-preview-sidebar, and aria-expanded.

- [ ] **Step 1: Write failing scanner and mobile tests**

    it("allows simulated route keys but rejects real network capability", () => {
      expect(scanText('const key="/api/stores"')).toEqual([]);
      expect(scanText('fetch("/api/stores")')).toContain("network primitive");
      expect(scanText("new XMLHttpRequest()")).toContain("network primitive");
      expect(scanText("https://private.example")).toContain("external URL");
    });

    test("opens the product pages from a contained mobile drawer", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("./preview/");
      await page.locator("[data-preview-menu]").click();
      await expect(page.locator("[data-preview-sidebar]")).toHaveAttribute("data-open", "true");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-preview-menu]")).toBeFocused();
    });

- [ ] **Step 2: Run scanner and mobile tests and observe RED**

Run: npm test -- scripts/check-public-preview.test.mjs; then run the focused Playwright mobile drawer test.

Expected: scanner rejects allowed route keys or mobile selectors are missing.

- [ ] **Step 3: Implement layered responsive CSS and strict scanner rules**

    @media (max-width: 900px) {
      .sidebar { position: fixed; inset: 0 auto 0 0; transform: translateX(-100%); z-index: 60; }
      .sidebar[data-open="true"] { transform: translateX(0); }
      .main-content { margin-left: 0; width: 100%; padding-top: 64px; }
      [data-preview-menu] { display: inline-flex; min-width: 44px; min-height: 44px; }
    }

The scanner rejects network primitives, external URLs, credential assignments with values, provider hosts, production identifiers, environment files, and runtime data files. It allows inert /api/ route keys because all requests go through demoRequest. Runtime E2E proves no browser request leaves the document.

- [ ] **Step 4: Re-run scanner and mobile tests**

Expected: PASS.

- [ ] **Step 5: Commit**

    git add public/preview scripts/check-public-preview.mjs scripts/check-public-preview.test.mjs tests/e2e/public-preview.spec.ts
    git commit -m "fix: harden faithful preview boundaries"

### Task 9: Verify Root and Repository Pages Deployments

**Files:**
- Modify: README.md
- Modify: package.json
- Test: all unit, scanner, build, and E2E suites.

**Interfaces:**
- Produces npm run preview:sync for an explicit local baseline refresh.
- Keeps npm run verify as the complete quality gate.

- [ ] **Step 1: Add the refresh script and documentation**

    "preview:sync": "node scripts/build-faithful-preview.mjs --product-repo D:\\shopee-auto-lister --output public\\preview"

README states that the public preview is a sanitized static copy of product commit eef0f87, preview:sync is maintainer-only, and GitHub Actions consumes committed public/preview assets.

- [ ] **Step 2: Run the root-path gate**

    npm run verify
    $env:PLAYWRIGHT_BASE_URL = "http://127.0.0.1:3002/"
    npm run test:e2e

Expected: lint, typecheck, format, scanner, Vitest, build, export scanner, and all Playwright projects PASS.

- [ ] **Step 3: Run the repository-subpath gate**

    $env:NEXT_PUBLIC_BASE_PATH = "/axio-web"
    npm run build
    npm run preview:export-check
    $env:PLAYWRIGHT_BASE_URL = "http://127.0.0.1:3003/axio-web/"
    npx playwright test tests/e2e/public-preview.spec.ts
    Remove-Item Env:NEXT_PUBLIC_BASE_PATH
    Remove-Item Env:PLAYWRIGHT_BASE_URL

Expected: export scanner and full preview E2E PASS under /axio-web/.

- [ ] **Step 4: Inspect repository scope**

    git diff --check
    git status --short
    git -C D:\shopee-auto-lister status --short

Expected: only website files are changed; product dirty state is unchanged.

- [ ] **Step 5: Commit**

    git add README.md package.json
    git commit -m "docs: document faithful preview refresh"

- [ ] **Step 6: Start the final root-path static server**

    npm run build
    python -m http.server 3002 --bind 127.0.0.1 --directory out

Expected: http://127.0.0.1:3002/preview/ opens the faithful product preview on “新建任务”.
