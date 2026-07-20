# AXIO Public Product Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a curated, no-network AXIO product preview at `/preview/` and expose it from the existing `/demo/` page without redesigning the official website.

**Design:** `docs/superpowers/specs/2026-07-20-axio-public-product-preview-design.md`

**Architecture:** The website repository owns a standalone static preview under `public/preview/`; Next.js copies it unchanged into the GitHub Pages export. Fictional fixtures and a pure reducer drive six representative workspaces, while a small DOM adapter renders them. The marketing application only replaces the pending overview-video position with a base-path-aware link, and automated source/export scans prevent backend routes, provider details, or production identifiers from shipping.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 5.9, plain ESM/CSS for the isolated preview, Vitest 3, Playwright 1.61, GitHub Pages.

## Global Constraints

- Work only in `D:/Desktop/AXIO web`; treat `D:/shopee-auto-lister` at committed baseline `aa70853` as read-only product reference.
- Never copy runtime-modified, untracked, config, database, JSONL, profile, credential, merchant, store, order, product, SKU, URL, price, or log data from the product repository.
- Keep the homepage, global navigation, pricing pages, existing core-workflow video, booking form, WeChat contact, and conversion content structurally intact.
- The public preview must make no fetch, XHR, WebSocket, beacon, form submission, upload, AI, ERP, browser-automation, or backend call.
- Preview data must be purpose-built and fictional; production data must never be copied and redacted.
- Serve the preview at trailing-slash-safe `/preview/` with relative assets and support both an empty base path and `/axio-web`.
- Do not add a dependency, backend, authentication layer, second deployment workflow, iframe, or automatic sync from the product repository.
- Desktop and tablet receive the full workspace; mobile uses a drawer and single-column summaries with no page-level horizontal overflow.

## File Map

- `public/preview/index.html`: standalone semantic shell and mount points; no production application markup.
- `public/preview/assets/preview-data.mjs`: fictional immutable workspace fixtures only.
- `public/preview/assets/preview-state.mjs`: pure navigation, workflow transition, and base-path functions.
- `public/preview/assets/preview.mjs`: DOM rendering and event binding only.
- `public/preview/assets/preview.css`: isolated responsive product-preview visual system.
- `scripts/check-public-preview.mjs`: source/export safety scan and required-file validation.
- `scripts/check-public-preview.test.mjs`: scanner, fixture, reducer, and path tests.
- `src/components/marketing/product-preview-stage.tsx`: `/demo/` marketing entry point.
- `src/app/(marketing)/demo/page.tsx`: replace only the pending overview position.
- `src/app/(marketing)/marketing.css`: styles for the new marketing entry section.
- `src/app/(marketing)/public-routes.test.tsx`: preserve section order and assert the preview link.
- `tests/e2e/public-preview.spec.ts`: desktop/mobile interaction, no-network, and overflow acceptance.
- `package.json`: add preview source/export checks to the existing verification chain.
- `README.md`: document the public route and static boundary.

---

### Task 1: Fictional Preview Contract And Pure State

**Files:**
- Create: `public/preview/assets/preview-data.mjs`
- Create: `public/preview/assets/preview-state.mjs`
- Create: `scripts/check-public-preview.test.mjs`

**Interfaces:**
- Produces: `PREVIEW_WORKSPACES: readonly Workspace[]`
- Produces: `WORKFLOW_STAGES: readonly string[]`
- Produces: `createPreviewState(): PreviewState`
- Produces: `reducePreviewState(state, action): PreviewState`
- Produces: `deriveSiteRoot(pathname: string): string`
- Consumes: no production repository data or network input.

- [ ] **Step 1: Write failing fixture, reducer, and path tests**

Create `scripts/check-public-preview.test.mjs` with the first contract tests:

```js
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
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm test -- scripts/check-public-preview.test.mjs
```

Expected: FAIL because `preview-data.mjs` and `preview-state.mjs` do not exist.

- [ ] **Step 3: Add the fictional workspace fixture**

Create `public/preview/assets/preview-data.mjs`. Keep all names and values fictional and use this exact schema for every workspace:

```js
export const PREVIEW_WORKSPACES = Object.freeze([
  {
    id: "dashboard",
    navLabel: "运营总览",
    eyebrow: "OPERATIONS OVERVIEW",
    title: "今日运营计划",
    description: "从经营目标到受控执行，集中查看当前计划、风险与回读状态。",
    stats: [
      ["待复核计划", "6"],
      ["价格影子方案", "18"],
      ["风险拦截", "3"],
      ["已验证回读", "12"],
    ],
    rows: [
      ["新品候选复核", "待确认", "示例站点 A · 8 个候选"],
      ["价格影子比较", "可复核", "示例店铺组 · 18 个商品"],
      ["存量风险检查", "已验证", "无真实店铺连接"],
    ],
  },
  {
    id: "selection",
    navLabel: "选品决策",
    eyebrow: "EVIDENCE-BASED SELECTION",
    title: "候选商品决策",
    description: "用需求、竞争、物流、利润与证据完整度形成可复核的候选排序。",
    stats: [
      ["候选商品", "24"],
      ["通过硬门槛", "9"],
      ["证据待补", "5"],
      ["推荐进入任务", "4"],
    ],
    rows: [
      ["轻量收纳组件", "推荐", "综合评分 86 · 证据完整"],
      ["桌面整理套件", "复核", "综合评分 78 · 核对物流"],
      ["旅行分装组合", "拦截", "示例风险规则命中"],
    ],
  },
  {
    id: "task",
    navLabel: "新建任务",
    eyebrow: "CONTROLLED TASK",
    title: "创建受控上架任务",
    description: "先生成范围与参数预览，再确认执行意图，最后展示模拟回读。",
    stats: [
      ["目标站点", "示例站点 A"],
      ["商品数量", "8"],
      ["定价版本", "精确定价 V1"],
      ["执行模式", "公开演示"],
    ],
    rows: [
      ["商品来源", "已锁定", "虚构候选集合"],
      ["图片检查", "已通过", "8 个示例图像清单"],
      ["执行权限", "待确认", "不会连接真实平台"],
    ],
  },
  {
    id: "pricing",
    navLabel: "精准定价",
    eyebrow: "PRICING SHADOW",
    title: "价格影子比较",
    description: "拆分成本、平台费用、物流与利润目标，并在执行前比较原方案。",
    stats: [
      ["采购成本", "¥42.00"],
      ["物流成本", "¥18.40"],
      ["目标净利率", "22%"],
      ["建议成交价", "¥119.00"],
    ],
    rows: [
      ["原价格方案", "¥109.00", "预计净利率 15%"],
      ["精准定价方案", "¥119.00", "预计净利率 22%"],
      ["影子差异", "+¥10.00", "等待人工复核"],
    ],
  },
  {
    id: "optimization",
    navLabel: "智能优化",
    eyebrow: "SMART OPTIMIZATION",
    title: "商品内容优化预览",
    description: "并排复核标题、图片与存量经营建议，所有变化停留在预览状态。",
    stats: [
      ["待优化商品", "12"],
      ["图片预览", "6"],
      ["标题建议", "9"],
      ["已人工确认", "4"],
    ],
    rows: [
      ["主图清晰度", "预览就绪", "保持商品外观与数量"],
      ["标题结构", "建议复核", "删除重复修饰语"],
      ["存量经营", "计划就绪", "等待范围确认"],
    ],
  },
  {
    id: "risk",
    navLabel: "风险与回读",
    eyebrow: "RISK AND READBACK",
    title: "执行前检查与结果回读",
    description: "把关键词、图片、价格与执行结果放在同一条可追溯链路中。",
    stats: [
      ["规则检查", "28"],
      ["需要复核", "3"],
      ["执行阻断", "1"],
      ["回读完整", "96%"],
    ],
    rows: [
      ["关键词风险", "已通过", "示例词库检查完成"],
      ["图片一致性", "待复核", "1 个示例差异"],
      ["业务回读", "已验证", "模拟结果与计划一致"],
    ],
  },
]);
```

- [ ] **Step 4: Add the pure state reducer and path derivation**

Create `public/preview/assets/preview-state.mjs`:

```js
import { PREVIEW_WORKSPACES } from "./preview-data.mjs";

export const WORKFLOW_STAGES = Object.freeze([
  "draft",
  "preview",
  "confirmed",
  "verified",
]);

const workspaceIds = new Set(PREVIEW_WORKSPACES.map(({ id }) => id));

export function createPreviewState() {
  return { activeWorkspace: "dashboard", navOpen: false, taskStage: "draft" };
}

export function reducePreviewState(state, action) {
  if (action.type === "select-workspace") {
    if (!workspaceIds.has(action.id)) {
      throw new Error(`Unknown workspace: ${action.id}`);
    }
    return { ...state, activeWorkspace: action.id, navOpen: false };
  }
  if (action.type === "toggle-nav") {
    return { ...state, navOpen: !state.navOpen };
  }
  if (action.type === "close-nav") {
    return { ...state, navOpen: false };
  }
  if (action.type === "advance-task") {
    const index = WORKFLOW_STAGES.indexOf(state.taskStage);
    const next = WORKFLOW_STAGES[Math.min(index + 1, WORKFLOW_STAGES.length - 1)];
    return { ...state, taskStage: next };
  }
  throw new Error(`Unknown preview action: ${action.type}`);
}

export function deriveSiteRoot(pathname) {
  const marker = "/preview/";
  const index = pathname.indexOf(marker);
  if (index < 0) throw new Error(`Expected preview path: ${pathname}`);
  return pathname.slice(0, index + 1) || "/";
}
```

- [ ] **Step 5: Run tests and commit the contract**

Run:

```powershell
npm test -- scripts/check-public-preview.test.mjs
```

Expected: 4 tests PASS.

Commit:

```powershell
git add public/preview/assets/preview-data.mjs public/preview/assets/preview-state.mjs scripts/check-public-preview.test.mjs
git commit -m "feat: define public preview contract"
```

---

### Task 2: Standalone Preview Shell And Responsive Rendering

**Files:**
- Create: `public/preview/index.html`
- Create: `public/preview/assets/preview.mjs`
- Create: `public/preview/assets/preview.css`
- Modify: `scripts/check-public-preview.test.mjs`

**Interfaces:**
- Consumes: `PREVIEW_WORKSPACES`, `createPreviewState`, `reducePreviewState`, `deriveSiteRoot` from Task 1.
- Produces: static route `/preview/`, `[data-preview-nav]`, `[data-preview-main]`, `[data-task-action]`, `[data-site-home]`, and `[data-book-demo]` DOM contracts.

- [ ] **Step 1: Add a failing structural shell test**

Add `readFileSync` and `join` to the existing import block at the top of `scripts/check-public-preview.test.mjs`, then append the structural test:

```js
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run `npm test -- scripts/check-public-preview.test.mjs`.

Expected: FAIL with `ENOENT public/preview/index.html`.

- [ ] **Step 3: Create the semantic static shell**

Create `public/preview/index.html` with no inline event handlers, no form, and only relative preview assets:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="AXIO 智核公开交互预览" />
    <title>产品预览 | AXIO 智核</title>
    <link rel="stylesheet" href="./assets/preview.css" />
  </head>
  <body>
    <a class="skip-link" href="#preview-main">跳到主要内容</a>
    <header class="preview-bar">
      <a class="preview-brand" data-site-home href="../">AXIO 智核</a>
      <p><span class="status-dot" aria-hidden="true"></span>公开演示 · 不连接真实店铺</p>
      <div class="preview-bar__actions">
        <a class="button button--quiet" data-site-home href="../">返回官网</a>
        <a class="button button--primary" data-book-demo href="../demo/">预约真实演示</a>
      </div>
    </header>
    <div class="preview-shell">
      <aside class="preview-sidebar" data-preview-sidebar>
        <div class="preview-sidebar__heading">
          <span>PRODUCT TOUR</span>
          <strong>经营与受控执行</strong>
        </div>
        <nav aria-label="产品预览" data-preview-nav></nav>
        <p class="preview-sidebar__note">所有内容均为虚构示例数据</p>
      </aside>
      <main class="preview-main" data-preview-main id="preview-main" tabindex="-1"></main>
    </div>
    <button
      aria-controls="preview-navigation"
      aria-expanded="false"
      class="preview-menu-button"
      data-menu-button
      type="button"
    >
      <span aria-hidden="true">☰</span><span>功能导航</span>
    </button>
    <div class="preview-toast" data-preview-toast hidden role="status"></div>
    <script src="./assets/preview.mjs" type="module"></script>
  </body>
</html>
```

- [ ] **Step 4: Implement the DOM adapter**

Create `public/preview/assets/preview.mjs`. Render all user-visible values with `textContent`; do not use `innerHTML` for fixture data:

```js
import { PREVIEW_WORKSPACES } from "./preview-data.mjs";
import {
  WORKFLOW_STAGES,
  createPreviewState,
  deriveSiteRoot,
  reducePreviewState,
} from "./preview-state.mjs";

let state = createPreviewState();
const nav = document.querySelector("[data-preview-nav]");
const main = document.querySelector("[data-preview-main]");
const sidebar = document.querySelector("[data-preview-sidebar]");
const menuButton = document.querySelector("[data-menu-button]");
const toast = document.querySelector("[data-preview-toast]");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function renderNav() {
  nav.replaceChildren();
  nav.id = "preview-navigation";
  for (const workspace of PREVIEW_WORKSPACES) {
    const button = element("button", "preview-nav-item", workspace.navLabel);
    button.type = "button";
    button.dataset.workspace = workspace.id;
    button.setAttribute(
      "aria-current",
      state.activeWorkspace === workspace.id ? "page" : "false",
    );
    nav.append(button);
  }
  sidebar.dataset.open = String(state.navOpen);
  menuButton.setAttribute("aria-expanded", String(state.navOpen));
}

function renderWorkspace() {
  const workspace = PREVIEW_WORKSPACES.find(
    ({ id }) => id === state.activeWorkspace,
  );
  if (!workspace) {
    const failure = element("section", "preview-empty");
    failure.append(
      element("h1", "", "预览数据暂不可用"),
      element("p", "", "请返回运营总览继续浏览。"),
    );
    main.replaceChildren(failure);
    return;
  }

  const header = element("header", "workspace-header");
  header.append(
    element("p", "workspace-eyebrow", workspace.eyebrow),
    element("h1", "", workspace.title),
    element("p", "workspace-description", workspace.description),
  );

  const stats = element("section", "stats-grid");
  stats.setAttribute("aria-label", "关键指标");
  for (const [label, value] of workspace.stats) {
    const card = element("article", "stat-card");
    card.append(element("span", "", label), element("strong", "", value));
    stats.append(card);
  }

  const table = element("section", "workspace-table");
  table.append(element("h2", "", "当前工作区"));
  const rows = element("div", "workspace-rows");
  for (const [label, status, detail] of workspace.rows) {
    const row = element("article", "workspace-row");
    row.append(
      element("strong", "", label),
      element("span", "workspace-status", status),
      element("p", "", detail),
    );
    rows.append(row);
  }
  table.append(rows);

  const children = [header, stats, table];
  if (workspace.id === "task") {
    const workflow = element("section", "task-workflow");
    workflow.append(element("h2", "", "模拟任务状态"));
    const stages = element("ol", "task-stages");
    const activeIndex = WORKFLOW_STAGES.indexOf(state.taskStage);
    const labels = ["草稿", "预览", "已确认", "已回读"];
    WORKFLOW_STAGES.forEach((stage, index) => {
      const item = element("li", index <= activeIndex ? "is-complete" : "", labels[index]);
      item.dataset.stage = stage;
      stages.append(item);
    });
    const action = element(
      "button",
      "button button--primary",
      state.taskStage === "verified" ? "模拟回读已完成" : "推进模拟任务",
    );
    action.type = "button";
    action.dataset.taskAction = "";
    action.disabled = state.taskStage === "verified";
    workflow.append(stages, action);
    children.push(workflow);
  }
  main.replaceChildren(...children);
}

function render() {
  renderNav();
  renderWorkspace();
}

const siteRoot = deriveSiteRoot(window.location.pathname);
document.querySelectorAll("[data-site-home]").forEach((link) => {
  link.href = siteRoot;
});
document.querySelector("[data-book-demo]").href = `${siteRoot}demo/`;

document.addEventListener("click", (event) => {
  const workspaceButton = event.target.closest("[data-workspace]");
  if (workspaceButton) {
    state = reducePreviewState(state, {
      type: "select-workspace",
      id: workspaceButton.dataset.workspace,
    });
    render();
    main.focus({ preventScroll: true });
    return;
  }
  if (event.target.closest("[data-menu-button]")) {
    state = reducePreviewState(state, { type: "toggle-nav" });
    renderNav();
    return;
  }
  if (event.target.closest("[data-task-action]")) {
    state = reducePreviewState(state, { type: "advance-task" });
    renderWorkspace();
    showToast("模拟状态已更新，不会执行真实任务");
  }
});

render();
```

- [ ] **Step 5: Add isolated responsive styles**

Create `public/preview/assets/preview.css` with the approved quiet work-surface palette and these required layout rules:

```css
:root {
  color-scheme: light;
  --page: #f4f6f8;
  --surface: #ffffff;
  --surface-soft: #f8fafb;
  --text: #1b2027;
  --muted: #5a6571;
  --border: #dfe3e8;
  --brand: #ee4d2d;
  --brand-dark: #c43b20;
  --success: #157a52;
  --sidebar: 232px;
  font-family: system-ui, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}
* { box-sizing: border-box; }
html, body { min-height: 100%; margin: 0; background: var(--page); color: var(--text); }
body { font-size: 14px; line-height: 1.6; letter-spacing: 0; }
button, a { font: inherit; letter-spacing: 0; }
button { cursor: pointer; }
a { color: inherit; text-decoration: none; }
.skip-link { position: fixed; left: 12px; top: -60px; z-index: 100; padding: 10px 14px; background: var(--text); color: white; }
.skip-link:focus { top: 12px; }
.preview-bar { position: sticky; top: 0; z-index: 20; min-height: 64px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; padding: 10px 24px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,.96); }
.preview-brand { font-size: 18px; font-weight: 800; }
.preview-bar p { margin: 0; color: var(--muted); font-size: 13px; }
.status-dot { display: inline-block; width: 8px; height: 8px; margin-right: 8px; border-radius: 50%; background: var(--success); }
.preview-bar__actions { justify-self: end; display: flex; gap: 8px; }
.button { min-height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0 14px; border: 1px solid var(--border); border-radius: 6px; font-weight: 700; }
.button--quiet { background: var(--surface); }
.button--primary { border-color: var(--brand-dark); background: var(--brand-dark); color: white; }
.preview-shell { min-height: calc(100vh - 64px); display: grid; grid-template-columns: var(--sidebar) minmax(0, 1fr); }
.preview-sidebar { position: sticky; top: 64px; height: calc(100vh - 64px); padding: 24px 14px; border-right: 1px solid var(--border); background: var(--surface); }
.preview-sidebar__heading { display: grid; gap: 2px; padding: 0 10px 20px; }
.preview-sidebar__heading span, .workspace-eyebrow { color: var(--brand-dark); font-size: 11px; font-weight: 800; }
.preview-sidebar nav { display: grid; gap: 4px; }
.preview-nav-item { min-height: 44px; padding: 0 12px; border: 0; border-left: 3px solid transparent; background: transparent; color: var(--muted); text-align: left; }
.preview-nav-item[aria-current="page"] { border-left-color: var(--brand); background: #fff2ee; color: var(--brand-dark); font-weight: 800; }
.preview-sidebar__note { position: absolute; right: 20px; bottom: 20px; left: 20px; color: var(--muted); font-size: 12px; }
.preview-main { width: 100%; max-width: 1280px; min-width: 0; padding: 40px clamp(20px, 4vw, 56px) 64px; outline: none; }
.workspace-header { max-width: 760px; }
.workspace-header h1 { margin: 6px 0 8px; font-size: 30px; line-height: 1.2; }
.workspace-description { margin: 0; color: var(--muted); }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 28px 0; }
.stat-card { min-height: 96px; display: grid; align-content: center; gap: 5px; padding: 16px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); }
.stat-card span { color: var(--muted); font-size: 12px; }
.stat-card strong { font-size: 22px; }
.workspace-table, .task-workflow { padding: 20px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); }
.workspace-table h2, .task-workflow h2 { margin: 0 0 14px; font-size: 16px; }
.workspace-rows { display: grid; }
.workspace-row { display: grid; grid-template-columns: minmax(150px, 1fr) 100px minmax(220px, 2fr); gap: 16px; align-items: center; min-height: 62px; border-top: 1px solid var(--border); }
.workspace-row p { margin: 0; color: var(--muted); }
.workspace-status { color: var(--success); font-weight: 800; }
.task-workflow { margin-top: 16px; }
.task-stages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 0; list-style: none; }
.task-stages li { min-height: 42px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 4px; color: var(--muted); }
.task-stages .is-complete { border-color: #98cfb7; background: #edf8f2; color: var(--success); font-weight: 800; }
.preview-menu-button { display: none; }
.preview-toast { position: fixed; right: 20px; bottom: 20px; z-index: 40; max-width: 340px; padding: 12px 16px; border-radius: 6px; background: var(--text); color: white; }
@media (max-width: 900px) {
  .preview-bar { grid-template-columns: 1fr auto; }
  .preview-bar p { display: none; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 680px) {
  .preview-bar { padding: 10px 14px; }
  .preview-bar__actions .button--quiet { display: none; }
  .preview-shell { display: block; }
  .preview-sidebar { position: fixed; z-index: 30; top: 64px; bottom: 0; left: 0; width: min(84vw, 300px); height: auto; transform: translateX(-102%); transition: transform 180ms ease; }
  .preview-sidebar[data-open="true"] { transform: translateX(0); box-shadow: 16px 0 40px rgba(27,32,39,.18); }
  .preview-menu-button { position: fixed; right: 14px; bottom: 14px; z-index: 35; min-height: 44px; display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; border: 1px solid var(--brand-dark); border-radius: 6px; background: var(--brand-dark); color: white; }
  .preview-main { padding: 28px 16px 84px; }
  .workspace-header h1 { font-size: 25px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .workspace-row { grid-template-columns: 1fr auto; gap: 6px 12px; padding: 14px 0; }
  .workspace-row p { grid-column: 1 / -1; }
  .task-stages { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 6: Run focused tests and commit the standalone preview**

Run `npm test -- scripts/check-public-preview.test.mjs`.

Expected: 5 tests PASS.

Commit:

```powershell
git add public/preview scripts/check-public-preview.test.mjs
git commit -m "feat: build standalone public preview"
```

---

### Task 3: Source And Export Safety Gates

**Files:**
- Create: `scripts/check-public-preview.mjs`
- Modify: `scripts/check-public-preview.test.mjs`
- Modify: `package.json:4-14`

**Interfaces:**
- Produces: `scanPreviewDirectory(rootDir): string[]`
- Produces: `assertPreviewDirectory(rootDir): void`
- Produces: CLI `node scripts/check-public-preview.mjs <directory>`.
- Consumes: `public/preview/` during source checks and `out/preview/` after static export.

- [ ] **Step 1: Add failing scanner tests**

Add `mkdtempSync`, `mkdirSync`, `rmSync`, and `writeFileSync` to the existing `node:fs` import; add `tmpdir` to the top-level import block; import the scanner beside the preview imports; then append these tests:

```js
import {
  assertPreviewDirectory,
  scanPreviewDirectory,
} from "./check-public-preview.mjs";

it("rejects backend, provider, network, and production identifiers", () => {
  const root = mkdtempSync(join(tmpdir(), "axio-preview-unsafe-"));
  try {
    mkdirSync(join(root, "assets"));
    writeFileSync(join(root, "index.html"), '<script src="./assets/preview.mjs" type="module"></script>');
    writeFileSync(join(root, "assets/preview.css"), "body{}");
    writeFileSync(join(root, "assets/preview-data.mjs"), 'export const x="7539232";');
    writeFileSync(join(root, "assets/preview-state.mjs"), "export const x=1;");
    writeFileSync(join(root, "assets/preview.mjs"), 'fetch("/api/stores");');
    expect(scanPreviewDirectory(root)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/production identifier/i),
        expect.stringMatching(/backend route/i),
        expect.stringMatching(/network primitive/i),
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
```

- [ ] **Step 2: Run focused tests and verify RED**

Run `npm test -- scripts/check-public-preview.test.mjs`.

Expected: FAIL because `scripts/check-public-preview.mjs` does not exist.

- [ ] **Step 3: Implement the recursive safety scanner**

Create `scripts/check-public-preview.mjs`:

```js
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requiredFiles = [
  "index.html",
  "assets/preview.css",
  "assets/preview-data.mjs",
  "assets/preview-state.mjs",
  "assets/preview.mjs",
];
const textExtensions = new Set([".html", ".css", ".js", ".mjs", ".json", ".txt"]);
const prohibited = [
  ["backend route", /\/api\//i],
  ["network primitive", /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/],
  ["external URL", /https?:\/\//i],
  ["credential field", /api[ _-]?key|password|cookie|secret|signature/i],
  ["provider host", /aigcfox|6uss|shitapi|deepseek|agnes/i],
  ["production identifier", /7539232|omotu1\.my|rueuiohder1\.th|yndsfd5885\.vn|euouiogtfffg1\.br/i],
];

function walk(rootDir) {
  const files = [];
  for (const entry of readdirSync(rootDir)) {
    const path = join(rootDir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

export function scanPreviewDirectory(rootDir) {
  const root = resolve(rootDir);
  const findings = [];
  if (!existsSync(root)) return [`missing preview directory: ${root}`];
  for (const required of requiredFiles) {
    if (!existsSync(join(root, required))) findings.push(`missing required file: ${required}`);
  }
  for (const file of walk(root)) {
    if (!textExtensions.has(extname(file))) continue;
    const content = readFileSync(file, "utf8");
    const name = relative(root, file).replaceAll("\\", "/");
    for (const [label, pattern] of prohibited) {
      if (pattern.test(content)) findings.push(`${name}: ${label}`);
    }
  }
  return findings;
}

export function assertPreviewDirectory(rootDir) {
  const findings = scanPreviewDirectory(rootDir);
  if (findings.length) throw new Error(`Unsafe public preview:\n${findings.join("\n")}`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const rootDir = process.argv[2] ?? "public/preview";
  assertPreviewDirectory(rootDir);
  console.log(`Public preview check passed: ${rootDir}`);
}
```

During implementation, order the `existsSync(root)` guard before `walk(root)` exactly as shown by the tests: missing directories must return one finding rather than throw from `readdirSync`.

- [ ] **Step 4: Add source and exported-artifact commands to verification**

Modify `package.json` scripts to this exact sequence:

```json
{
  "scripts": {
    "test": "vitest run",
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format:check": "prettier --check .",
    "campaign:posters": "node scripts/render-campaign-posters.mjs",
    "preview:check": "node scripts/check-public-preview.mjs public/preview",
    "preview:export-check": "node scripts/check-public-preview.mjs out/preview",
    "test:e2e": "playwright test",
    "verify": "npm run lint && npm run typecheck && npm run format:check && npm run preview:check && npm run test && npm run build && npm run preview:export-check"
  }
}
```

Preserve all existing package metadata, dependencies, and overrides outside the `scripts` object.

- [ ] **Step 5: Run source tests, source scan, build, and export scan**

Run:

```powershell
npm test -- scripts/check-public-preview.test.mjs
npm run preview:check
npm run build
npm run preview:export-check
```

Expected: tests PASS; both scanners print `Public preview check passed`; build creates `out/preview/index.html` and the four assets.

- [ ] **Step 6: Commit safety gates**

```powershell
git add package.json scripts/check-public-preview.mjs scripts/check-public-preview.test.mjs
git commit -m "test: gate public preview safety"
```

---

### Task 4: Minimal `/demo/` Marketing Entry

**Files:**
- Create: `src/components/marketing/product-preview-stage.tsx`
- Modify: `src/app/(marketing)/demo/page.tsx:4-54`
- Modify: `src/app/(marketing)/marketing.css:430-526`
- Modify: `src/app/(marketing)/public-routes.test.tsx:10,127-154`

**Interfaces:**
- Consumes: `withBasePath("/preview/")` from `src/config/site-path.ts`.
- Produces: `ProductPreviewStage` with `data-testid="demo-interactive-preview"` and link name `进入交互预览`.
- Preserves: `data-testid="demo-core-workflow"` and `data-testid="demo-booking-form"` order.

- [ ] **Step 1: Replace the old overview assertion with a failing preview-entry assertion**

In `src/app/(marketing)/public-routes.test.tsx`, remove the `demoVideos.overview` assertion and change the demo order test to:

```tsx
it("orders the interactive preview, core workflow video, then booking form", () => {
  render(<DemoPage />);

  const preview = screen.getByTestId("demo-interactive-preview");
  const core = screen.getByTestId("demo-core-workflow");
  const form = screen.getByTestId("demo-booking-form");

  expect(
    within(preview).getByRole("heading", { name: "先体验，再预约真实演示" }),
  ).toBeVisible();
  expect(
    within(preview).getByRole("link", { name: "进入交互预览" }),
  ).toHaveAttribute("href", "/preview/");
  expect(within(preview).queryByText(/正在制作/)).toBeNull();
  expect(within(core).getByText(demoVideos.coreWorkflow.title)).toBeVisible();
  expect(
    within(core).getByLabelText(`播放${demoVideos.coreWorkflow.title}`),
  ).toHaveAttribute("poster", demoVideos.coreWorkflow.poster);
  expect(preview.nextElementSibling).toBe(core);
  expect(core.nextElementSibling).toBe(form);
  expect(
    within(form).getByRole("form", { name: "预约产品演示" }),
  ).not.toHaveAttribute("action", "/api/demo-requests");
  expect(
    within(form).getByRole("button", { name: "预约通道配置中" }),
  ).toBeDisabled();
  expect(within(form).getByText("微信咨询 · 楠 Nay")).toBeVisible();
});
```

- [ ] **Step 2: Run the route test and verify RED**

Run:

```powershell
npm test -- "src/app/(marketing)/public-routes.test.tsx"
```

Expected: FAIL because `demo-interactive-preview` is absent.

- [ ] **Step 3: Create the base-path-aware marketing stage**

Create `src/components/marketing/product-preview-stage.tsx`:

```tsx
import { ArrowRight, ShieldCheck } from "lucide-react";

import { withBasePath } from "../../config/site-path";

export function ProductPreviewStage() {
  return (
    <section
      className="marketing-preview-stage"
      data-testid="demo-interactive-preview"
    >
      <div className="marketing-preview-stage__inner">
        <div className="marketing-preview-stage__copy">
          <p className="marketing-eyebrow">INTERACTIVE PRODUCT PREVIEW</p>
          <h2>先体验，再预约真实演示</h2>
          <p>
            浏览 AXIO 的运营总览、选品决策、精准定价、智能优化与受控执行流程。
          </p>
          <a
            className="button button--primary"
            href={withBasePath("/preview/")}
          >
            进入交互预览 <ArrowRight aria-hidden="true" size={17} />
          </a>
        </div>
        <aside className="marketing-preview-stage__boundary">
          <ShieldCheck aria-hidden="true" size={22} />
          <div>
            <strong>公开演示环境</strong>
            <p>使用虚构数据，不连接店铺，也不会执行真实任务。</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Replace only the pending overview position**

In `src/app/(marketing)/demo/page.tsx`:

- Import `ProductPreviewStage`.
- Keep `DemoVideoPlayer`, `DemoForm`, `MarketingCta`, `WechatContact`, and `demoVideos` for the core video and booking flow.
- Change hero eyebrow to `DEMO CENTER / INTERACTIVE`.
- Change hero lead to `先体验公开交互预览，再查看已经录制的核心任务流程，最后提交你的业务场景。`.
- Change the hero aside title to `公开预览可直接体验` and body to `演示使用虚构数据，不连接店铺，也不会执行真实任务。`.
- Replace lines 33-44 with `<ProductPreviewStage />`.
- Leave lines 45-75 structurally unchanged.

- [ ] **Step 5: Add restrained marketing-stage styles**

Append to `src/app/(marketing)/marketing.css` near the existing video-stage styles:

```css
.marketing-preview-stage {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.marketing-preview-stage__inner {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 64px 0;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.7fr);
  gap: 48px;
  align-items: center;
}
.marketing-preview-stage__copy {
  display: grid;
  justify-items: start;
  gap: 16px;
}
.marketing-preview-stage__copy h2,
.marketing-preview-stage__copy p,
.marketing-preview-stage__boundary p {
  margin: 0;
}
.marketing-preview-stage__copy h2 {
  font-size: 30px;
  line-height: 1.2;
}
.marketing-preview-stage__copy > p:not(.marketing-eyebrow) {
  max-width: 680px;
  color: var(--muted);
}
.marketing-preview-stage__boundary {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
  padding: 18px;
  border-left: 3px solid var(--success);
  background: var(--page);
}
.marketing-preview-stage__boundary strong {
  display: block;
  margin-bottom: 4px;
}
.marketing-preview-stage__boundary p {
  color: var(--muted);
  font-size: 13px;
}
@media (max-width: 760px) {
  .marketing-preview-stage__inner {
    width: min(100% - 28px, 1180px);
    padding: 44px 0;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .marketing-preview-stage__copy h2 { font-size: 25px; }
  .marketing-preview-stage__copy .button { width: 100%; }
}
```

- [ ] **Step 6: Run route/static tests and commit the marketing entry**

Run:

```powershell
npm test -- "src/app/(marketing)/public-routes.test.tsx" src/config/static-deployment.test.ts
```

Expected: both suites PASS and the preview link is `/preview/` without a base path in tests.

Commit:

```powershell
git add src/components/marketing/product-preview-stage.tsx "src/app/(marketing)/demo/page.tsx" "src/app/(marketing)/marketing.css" "src/app/(marketing)/public-routes.test.tsx"
git commit -m "feat: link demo center to product preview"
```

---

### Task 5: Browser Acceptance, Documentation, And Final Verification

**Files:**
- Create: `tests/e2e/public-preview.spec.ts`
- Modify: `README.md:9-19,59-60,81-87`

**Interfaces:**
- Consumes: `/demo/`, `/preview/`, `data-workspace`, `data-task-action`, `data-site-home`, and `data-book-demo` contracts.
- Produces: desktop/mobile acceptance and no-product-network guarantee.

- [ ] **Step 1: Write the end-to-end acceptance test**

Create `tests/e2e/public-preview.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("public product preview", () => {
  test("enters from the demo center and completes the simulated task", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./demo/");
    await page.getByRole("link", { name: "进入交互预览" }).click();
    await expect(page).toHaveURL(/\/preview\/$/);
    await expect(
      page.getByRole("heading", { name: "今日运营计划" }),
    ).toBeVisible();

    const productRequests: string[] = [];
    page.on("request", (request) => {
      if (["fetch", "xhr", "websocket"].includes(request.resourceType())) {
        productRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    await page.getByRole("button", { name: "新建任务" }).click();
    const action = page.getByRole("button", { name: "推进模拟任务" });
    await action.click();
    await action.click();
    await action.click();
    await expect(
      page.getByRole("button", { name: "模拟回读已完成" }),
    ).toBeDisabled();
    await expect(page.locator('[data-stage="verified"]')).toHaveClass(
      /is-complete/,
    );
    expect(productRequests).toEqual([]);
    await expect(
      page.getByRole("link", { name: "预约真实演示" }),
    ).toHaveAttribute("href", /\/demo\/$/);
  });

  test("uses a mobile drawer without page-level horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./preview/");
    const menu = page.getByRole("button", { name: "功能导航" });
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "精准定价" }).click();
    await expect(
      page.getByRole("heading", { name: "价格影子比较" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run the new browser test and fix contract-level failures only**

Run:

```powershell
npx playwright test tests/e2e/public-preview.spec.ts
```

Expected: 4 project/test combinations PASS: two tests in desktop Chromium and two in mobile Chromium. If a locator fails, adjust accessible names or stable `data-*` contracts; do not add sleeps or weaken no-network/overflow assertions.

- [ ] **Step 3: Document the public route and verification commands**

Update the README route table row for `/demo` to `交互预览入口、核心流程视频、预约表单和微信二维码`, and add:

```markdown
| `/preview` | 使用虚构数据的静态交互产品预览，不连接真实店铺或后端 |
```

Add these command rows:

```markdown
| `npm run preview:check`        | 扫描公开预览源文件的敏感内容和后端依赖 |
| `npm run preview:export-check` | 验证静态导出中的预览文件和安全边界       |
```

Add `public/preview/` to the repository layout as `独立的公开交互预览及虚构数据`.

- [ ] **Step 4: Verify both root and GitHub repository base paths**

Run the normal verification:

```powershell
npm run verify
npm run test:e2e
```

Expected: lint, typecheck, format, source scan, all Vitest suites, static build, export scan, and all Playwright projects PASS.

Then verify the repository subpath export:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/axio-web"
npm run build
npm run preview:export-check
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

Expected: `out/preview/index.html` and all four preview assets exist; scanners PASS. Serve `out` with the existing local static-preview method and confirm `/axio-web/preview/` links back to `/axio-web/` and `/axio-web/demo/`.

- [ ] **Step 5: Review the final diff and commit acceptance coverage**

Run:

```powershell
git diff --check
git status --short
```

Expected: only the README and E2E test remain uncommitted; no files from `D:/shopee-auto-lister` appear.

Commit:

```powershell
git add README.md tests/e2e/public-preview.spec.ts
git commit -m "test: verify public product preview"
```

- [ ] **Step 6: Final clean-worktree and release-boundary check**

Run:

```powershell
git status --short --branch
git log --oneline -5
```

Expected: `## master` with no file entries. The five feature commits are present, and the existing `.github/workflows/deploy-pages.yml` remains unchanged because `npm run verify` now covers preview safety and export validation.
