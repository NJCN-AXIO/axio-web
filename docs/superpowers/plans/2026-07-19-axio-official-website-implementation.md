# AXIO Official Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the public AXIO 智核 website, demo conversion flow, email registration, signed-JWT login, and license-aware member entry described in the approved design specification.

**Architecture:** A Next.js App Router application server-renders marketing content and limits client components to theme state, Canvas motion, forms, and authenticated interactions. Domain services depend on narrow repository and mailer interfaces; Prisma/PostgreSQL, SMTP, and Auth.js are adapters, so the public site and unit suite run without a database while database integration is gated by an externally supplied `TEST_DATABASE_URL`.

**Tech Stack:** Node.js 24, npm 11, Next.js 16, React 19, TypeScript 5, semantic CSS, GSAP, Canvas 2D, Lucide React, Auth.js 5, PostgreSQL, Prisma 6, Zod, Node-RS Argon2, Nodemailer, Vitest, Testing Library, and Playwright.

## Global Constraints

- Work only in `D:\Desktop\AXIO web`; read `D:\shopee-auto-lister` only for approved copy and local evidence capture.
- Create an atomic commit after every task. Never add `.superpowers/`, secrets, build output, reports, dependencies, or product-repository changes.
- H1 is `AXIO 智核`; subtitle is `跨境电商店群全自动化运营系统`; primary CTA is `预约产品演示`.
- Optimize for cross-border sellers managing 10-200 stores. Show packages without prices and do not take online payment in V1.
- Use viewport-filling, full-width bands inspired by the reference site's pacing without copying its content or identity. Do not frame the site in a centered shell or nest cards.
- First visit is light mode. Persist the complete dark register. Use semantic CSS variables, Shopee orange, and `#C43B20` for accessible filled CTAs.
- Use system-ui, Segoe UI, PingFang SC, Microsoft YaHei, Arial, sans-serif. Visible text is at least 12px, body copy is 15-17px, and letter spacing is zero.
- Render exactly six capability groups with 21 `NOW` items and 3 `NEXT` items. Controlled execution, marketing-image generation, platform image writeback, and production browser-to-client exchange are not current capabilities.
- Never expose the Flask operations UI publicly or store marketplace credentials, API keys, browser profiles, signatures, or local AXIO secrets.
- Use Node-RS Argon2 hashes, verified-email credentials login, Auth.js signed JWT sessions, secure HTTP-only same-site cookies in production, and no `Session` table in V1.
- Use an externally supplied PostgreSQL URL. Docker is not a prerequisite and database commands must never target an unconfirmed production URL.
- Meet WCAG AA, visible focus, 44px touch targets, reduced-motion behavior, keyboard operation, no document overflow, target CLS below 0.1, and a nonblank theme-aware Canvas.
- Publish only anonymized real AXIO UI captures. Hide account identifiers, shop names, complete product records, orders, margins, credentials, and signatures.
- Treat `docs/superpowers/specs/2026-07-19-axio-official-website-design.md` as the source of truth.

## File Map

- Foundation: `package.json`, `.nvmrc`, `.env.example`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `vitest.db.config.ts`, `vitest.setup.ts`, `playwright.config.ts`.
- Root UI: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/not-found.tsx`, `src/components/site/{site-header,mobile-navigation,site-footer}.tsx`.
- Theme: `src/components/theme/{theme-script,theme-provider,theme-toggle}.tsx`.
- Content: `src/content/types.ts`, `src/content/zh-cn.ts`, `src/content/index.ts`.
- Homepage: `src/app/page.tsx`, `src/components/home/{hero,operations-canvas,proof-strip,operating-loop,product-evidence,capability-system,safety-deployment,demo-band,package-band,final-cta,progress-rail}.tsx`.
- Public routes: `src/app/(marketing)/{product,solutions,pricing,demo,privacy,terms}/page.tsx`, `src/components/marketing/{capability-list,package-comparison,demo-form}.tsx`.
- Evidence: `scripts/capture-product-evidence.mjs`, `public/images/product-evidence/{supervisor,task-pricing,image-workspace,matrix-pricing}.webp`.
- Data: `prisma/schema.prisma`, `prisma/migrations/*/migration.sql`, `src/server/db.ts`.
- Shared server controls: `src/server/http/origin.ts`, `src/server/security/{rate-limit,tokens,password}.ts`, `src/server/email/{mailer,templates}.ts`.
- Demo domain: `src/server/demo/{schema,repository,service,prisma-repository}.ts`, `src/app/api/demo-requests/route.ts`.
- Registration domain: `src/server/registration/{schema,repository,service,prisma-repository}.ts`, `src/app/api/register/route.ts`, `src/app/api/verify-email/route.ts`, `src/app/api/verify-email/resend/route.ts`.
- Auth UI: `src/auth.ts`, `src/types/next-auth.d.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/(auth)/{login,register,verify-email}/`.
- Member domain: `src/server/member/{authorization,repository,prisma-repository}.ts`, `src/server/launch/{service,repository,prisma-repository}.ts`, `src/app/(member)/account/`, `src/app/api/launch-codes/route.ts`, `src/app/api/support-requests/route.ts`.
- Verification: colocated `*.test.ts(x)`, `tests/db/*.test.ts`, `tests/e2e/{public-site,auth-member,visual-integrity}.spec.ts`, `tests/e2e/helpers/visual-audit.ts`, `scripts/check-{content-boundaries,sensitive-content,internal-links}.mjs`.
- Operations: `README.md`, `docs/operations/deployment.md`.

---

### Task 1: Scaffold The Application And Quality Gates

**Files:** Create `package.json`, `package-lock.json`, `.nvmrc`, `.env.example`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `vitest.db.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`; test `src/app/page.test.tsx`.

**Interfaces:** Produces npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `format:check`, `test`, `test:db`, `test:e2e`, and `verify`. This task consumes no database.

- [ ] **Step 1: Initialize metadata and dependencies**

```powershell
npm init -y
npm pkg set name=axio-official-website private=true engines.node=">=24 <25"
npm install next@16 react@19 react-dom@19 gsap@3 lucide-react zod@3 next-auth@5.0.0-beta.30 @prisma/client@6 @node-rs/argon2@2 nodemailer@6
npm install -D typescript@5 @types/node@24 @types/react@19 @types/react-dom@19 @types/nodemailer@6 eslint@9 eslint-config-next@16 eslint-config-prettier@10 prettier@3 vitest@3 @vitejs/plugin-react@4 jsdom@26 @testing-library/react@16 @testing-library/jest-dom@6 @playwright/test@1 prisma@6 sharp@0.34
```

Expected: `npm ls --depth=0` exits 0 and `package-lock.json` is created.

- [ ] **Step 2: Write the failing brand test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("renders the approved first-viewport identity", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: "AXIO 智核" })).toBeVisible();
  expect(screen.getByText("跨境电商店群全自动化运营系统")).toBeVisible();
});
```

- [ ] **Step 3: Configure Vitest, ESLint, TypeScript, Next.js, and Playwright, then verify RED**

Use `jsdom`, global test APIs, `@testing-library/jest-dom/vitest`, alias `@` to `src`, strict TypeScript, Next core-web-vitals flat ESLint config, and Playwright desktop/mobile Chromium projects. The default Vitest configuration excludes `tests/db/**` and `tests/e2e/**`; `vitest.db.config.ts` uses Node environment and includes only `tests/db/**/*.test.ts`. Set `.nvmrc` to `24`. Configure Next image formats as AVIF/WebP and response headers `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "format:check": "prettier --check .",
  "test": "vitest run",
  "test:db": "vitest run --config vitest.db.config.ts",
  "test:e2e": "playwright test",
  "verify": "npm run lint && npm run typecheck && npm run format:check && npm run test && npm run build"
}
```

Run: `npm test -- src/app/page.test.tsx`

Expected: FAIL because the page module does not exist.

- [ ] **Step 4: Add the minimal server-rendered page**

```tsx
// src/app/page.tsx
export default function HomePage() {
  return <main><h1>AXIO 智核</h1><p>跨境电商店群全自动化运营系统</p></main>;
}
```

Root metadata uses title template `%s | AXIO 智核` and the approved subtitle as description. Global CSS sets border-box sizing, zero body margin, the approved font stack, `letter-spacing: 0`, 15px minimum body text, and `min-height: 100%` for `html` and `body`.

- [ ] **Step 5: Verify GREEN and commit**

```powershell
npm test -- src/app/page.test.tsx
npm run lint
npm run typecheck
npm run build
git add package.json package-lock.json .nvmrc .env.example next.config.ts tsconfig.json eslint.config.mjs vitest.config.ts vitest.setup.ts playwright.config.ts src
git commit -m "chore: scaffold AXIO website quality gates"
```

Expected: every command exits 0; the build statically renders `/` without connecting to PostgreSQL.

### Task 2: Build The Theme, Site Shell, And Typed Content Boundary

**Files:** Modify `src/app/layout.tsx`, `src/app/globals.css`; create `src/components/theme/theme-script.tsx`, `src/components/theme/theme-provider.tsx`, `src/components/theme/theme-toggle.tsx`, `src/components/site/site-header.tsx`, `src/components/site/mobile-navigation.tsx`, `src/components/site/site-footer.tsx`, `src/content/types.ts`, `src/content/zh-cn.ts`, `src/content/index.ts`; test `src/components/theme/theme-provider.test.tsx`, `src/components/site/site-header.test.tsx`, `src/components/site/mobile-navigation.test.tsx`, `src/content/zh-cn.test.ts`.

**Interfaces:** Produces `type Theme = "light" | "dark"`, `useTheme(): { theme: Theme; setTheme(theme: Theme): void; toggleTheme(): void }`, `type CapabilityStatus = "NOW" | "NEXT"`, and `getSiteContent(locale?: Locale): SiteContent`. Locale is `"zh-CN"` in V1.

- [ ] **Step 1: Write failing theme, navigation, and capability-count tests**

```tsx
it("persists a complete dark-mode selection", () => {
  localStorage.clear();
  document.documentElement.dataset.theme = "light";
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "切换到深色模式" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("axio-theme")).toBe("dark");
});

it("exposes public navigation and conversion", () => {
  render(<ThemeProvider><SiteHeader /></ThemeProvider>);
  expect(screen.getByRole("link", { name: "产品能力" })).toHaveAttribute("href", "/product");
  expect(screen.getByRole("link", { name: "解决方案" })).toHaveAttribute("href", "/solutions");
  expect(screen.getByRole("link", { name: "版本方案" })).toHaveAttribute("href", "/pricing");
  expect(screen.getByRole("link", { name: "预约产品演示" })).toHaveAttribute("href", "/demo");
});
```

```ts
const items = zhCN.capabilityGroups.flatMap((group) => group.items);
expect(zhCN.capabilityGroups).toHaveLength(6);
expect(items.filter((item) => item.status === "NOW")).toHaveLength(21);
expect(items.filter((item) => item.status === "NEXT")).toHaveLength(3);
```

Run: `npm test -- src/components/theme src/components/site src/content`

Expected: FAIL with unresolved modules.

- [ ] **Step 2: Implement the no-flash theme and semantic tokens**

`ThemeScript` reads only `axio-theme`, accepts only `dark`, otherwise writes `data-theme="light"`, and synchronizes `color-scheme` before hydration. `ThemeProvider` mirrors that state; `ThemeToggle` uses Lucide `Moon`/`Sun`, a tooltip, and the tested accessible names.

```css
:root,[data-theme="light"]{--page:#f6f7f9;--surface:#fff;--raised:#fff;--text:#1b2027;--muted:#525d69;--border:#d9dde3;--brand:#ee4d2d;--action:#c43b20;--on-action:#fff;--success:#157a52;--warning:#9a5b00;--danger:#b42318;--header:rgba(246,247,249,.92)}
[data-theme="dark"]{--page:#08090c;--surface:#11141a;--raised:#171b22;--text:#eef0f3;--muted:#abb2bc;--border:#303640;--brand:#ff6a4d;--action:#c43b20;--on-action:#fff;--success:#5cc69a;--warning:#f3b45b;--danger:#ff7b70;--header:rgba(8,9,12,.9)}
```

Use variables for every component color, 44px minimum controls, 6px control radius, 8px maximum genuine-card radius, a 3px `:focus-visible` outline, and reduced-motion rules that remove transitions and smooth scrolling.

- [ ] **Step 3: Implement the content registry with these exact groups**

```ts
export const capabilityGroups = [
  { id: "supervisor", title: "AI 主管与执行编排", items: [
    ["容量、数据新鲜度与风险证据分析", "NOW"], ["目标拆解、前置条件与验收标准", "NOW"], ["独立脚本、AI 主管与外部 Agent 三种编排", "NOW"], ["逐项开放高风险受控执行权限", "NEXT"]] },
  { id: "discovery", title: "四平台选品与关键词增长", items: [
    ["Shopee、Temu、TikTok、Amazon 市场信号入口", "NOW"], ["买家搜索词与供应链找品词双向补全", "NOW"], ["蓝海评分、健康状态与审核复用", "NOW"], ["四平台具体商品预览、证据门与精确货源", "NOW"]] },
  { id: "tasks", title: "自然语言任务与精准定价", items: [
    ["一句话拆解商品、数量、站点、店群与策略", "NOW"], ["多来源采集与可编辑任务参数", "NOW"], ["自动匹配、指定店铺与 P0/P1/P2 筛选", "NOW"], ["六站点成本、费率、物流、折扣与利润反算", "NOW"]] },
  { id: "operations", title: "上架与存量 Listing 经营", items: [
    ["多站点上架、容量分配与黄金时段批次", "NOW"], ["批量改价、亏损预览与 Listing 优化", "NOW"], ["滞销清理保护、商品分类与营销证据门", "NOW"]] },
  { id: "identity", title: "图片、SKU 身份与风险证据", items: [
    ["主图与 SKU 图安全预览", "NOW"], ["1024 方图、身份绑定、哈希与顺序校验", "NOW"], ["品牌、危险词、款式、图片风险与业务回读", "NOW"], ["AI 营销场景图", "NEXT"], ["生产平台图片写回", "NEXT"]] },
  { id: "matrix", title: "矩阵运营与私有化交付", items: [
    ["G1/G2 分组与六站点运营", "NOW"], ["116 店矩阵经营证据", "NOW"], ["本地 Windows 客户端", "NOW"], ["源码交付与私有化部署", "NOW"]] },
] as const;
```

`SiteContent` also owns hero copy, proof values `116 家店铺`, `6 个 Shopee 站点`, `4 个市场信号平台`, operating-loop labels, package copy for `Starter`, `Professional`, `Enterprise`, and all navigation/footer strings. `getSiteContent` rejects unsupported locales rather than silently mixing languages.

- [ ] **Step 4: Build the fixed header, accessible mobile dialog, and footer**

Desktop links are `/product`, `/solutions`, `/#capabilities`, `/pricing`, `/demo`, `/login`; the mobile dialog uses the same array, closes on Escape and route activation, traps focus, and restores focus. Footer links are `/privacy`, `/terms`, `/demo` and states `本地 Windows 客户端执行，敏感凭证留在客户环境`.

- [ ] **Step 5: Verify and commit**

```powershell
npm test -- src/components/theme src/components/site src/content
npm run lint
npm run typecheck
git add src/app src/components/theme src/components/site src/content
git commit -m "feat: add AXIO theme shell and verified content"
```

Expected: tests pass with six groups, 21 `NOW`, 3 `NEXT`, and light mode as the deterministic first-visit state.

### Task 3: Build The Full-Screen Homepage And Canvas Engine

**Files:** Modify `src/app/page.tsx`, `src/app/page.test.tsx`; create `src/components/home/hero.tsx`, `src/components/home/operations-canvas.tsx`, `src/components/home/proof-strip.tsx`, `src/components/home/operating-loop.tsx`, `src/components/home/product-evidence.tsx`, `src/components/home/capability-system.tsx`, `src/components/home/safety-deployment.tsx`, `src/components/home/demo-band.tsx`, `src/components/home/package-band.tsx`, `src/components/home/final-cta.tsx`, `src/components/home/progress-rail.tsx`; test `src/components/home/operations-canvas.test.tsx`.

**Interfaces:** `OperationsCanvas({ reducedMotion?: boolean }): JSX.Element`; canvas reads `--brand`, `--text`, `--muted`, `--border`, and `--surface` after every theme mutation. `CapabilitySystem({ groups }: { groups: CapabilityGroup[] })` renders status labels verbatim.

- [ ] **Step 1: Write the failing homepage contract**

```tsx
render(<HomePage />);
expect(screen.getByRole("heading", { level: 1, name: "AXIO 智核" })).toBeVisible();
expect(screen.getByText("跨境电商店群全自动化运营系统")).toBeVisible();
expect(screen.getByRole("link", { name: "预约产品演示" })).toHaveAttribute("href", "/demo");
expect(screen.getByRole("link", { name: "查看产品能力" })).toHaveAttribute("href", "#capabilities");
expect(screen.getAllByText("NOW")).toHaveLength(21);
expect(screen.getAllByText("NEXT")).toHaveLength(3);
expect(screen.getByText("116 家店铺")).toBeVisible();
expect(screen.getByText("6 个 Shopee 站点")).toBeVisible();
expect(screen.getByText("4 个市场信号平台")).toBeVisible();
```

Run: `npm test -- src/app/page.test.tsx src/components/home/operations-canvas.test.tsx`

Expected: FAIL because the homepage bands do not exist.

- [ ] **Step 2: Implement the Canvas lifecycle**

Use one full-bleed `<canvas aria-hidden="true">`. Cap device pixel ratio at 2, size from `ResizeObserver`, draw a deterministic six-column operations field with signal nodes, store lanes, task packets, price readouts, and red/amber/green risk gates, and expose `data-canvas-ready="true"` after the first nonblank frame. A `MutationObserver` on root `data-theme` refreshes computed CSS colors. `IntersectionObserver` pauses off-screen. Reduced motion draws the composed frame once. Cleanup cancels animation, observers, and listeners.

The unit test stubs Canvas 2D methods and asserts `fillRect`, `arc`, and `stroke` are called, animation is canceled on unmount, and a theme mutation triggers another frame.

- [ ] **Step 3: Compose the exact homepage order**

```tsx
export default function HomePage() {
  return <main>
    <Hero />
    <ProofStrip />
    <OperatingLoop />
    <ProductEvidence />
    <CapabilitySystem groups={getSiteContent().capabilityGroups} />
    <SafetyDeployment />
    <DemoBand />
    <PackageBand />
    <FinalCta />
    <ProgressRail />
  </main>;
}
```

Hero height is `min-height: 100svh` with 72px reserved for the fixed header and a visible 32px cue for the next band. Major bands use `min-height: min(900px, 92svh)` on desktop, full-width backgrounds, and constrained inner content. Mobile uses normal document flow and one-column reading order. GSAP reveals only opacity/translate of supporting elements; required content is present before animation and reduced motion calls `gsap.set` to final states.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/app/page.test.tsx src/components/home
npm run lint
npm run typecheck
git add src/app src/components/home
git commit -m "feat: build full-screen AXIO homepage"
```

Expected: all homepage assertions pass and no database is accessed.

### Task 4: Add Public Routes And Real Anonymized Product Evidence

**Files:** Create `src/app/(marketing)/product/page.tsx`, `src/app/(marketing)/solutions/page.tsx`, `src/app/(marketing)/pricing/page.tsx`, `src/app/(marketing)/demo/page.tsx`, `src/app/(marketing)/privacy/page.tsx`, `src/app/(marketing)/terms/page.tsx`, `src/components/marketing/capability-list.tsx`, `src/components/marketing/package-comparison.tsx`, `src/components/marketing/demo-form.tsx`, `scripts/capture-product-evidence.mjs`, `public/images/product-evidence/supervisor.webp`, `public/images/product-evidence/task-pricing.webp`, `public/images/product-evidence/image-workspace.webp`, `public/images/product-evidence/matrix-pricing.webp`; test `src/app/(marketing)/public-routes.test.tsx`.

**Interfaces:** `PackageComparison` receives three packages and never renders currency; `DemoForm` initially posts to `/api/demo-requests`; `capture-product-evidence.mjs --base-url http://127.0.0.1:8080 --out public/images/product-evidence` produces exactly four WebP files.

- [ ] **Step 1: Write route-content tests**

Use a table test that imports each page and checks:

| Route | Required heading | Required boundary |
|---|---|---|
| `/product` | `一套可验证的店群经营系统` | six capability headings and status labels |
| `/solutions` | `从 1 家店到 200 家店` | `起步卖家`, `成长团队`, `店群与服务商` |
| `/pricing` | `按经营规模选择交付方式` | Starter, Professional, Enterprise, `不支持在线付款` |
| `/demo` | `预约 AXIO 产品演示` | form and demo-cover region |
| `/privacy` | `隐私政策` | no marketplace credential collection |
| `/terms` | `服务条款` | local-client responsibility and no payment claim |

Run: `npm test -- "src/app/(marketing)/public-routes.test.tsx"`

Expected: FAIL because route modules do not exist.

- [ ] **Step 2: Implement server-rendered public routes**

Each route exports unique title/description metadata, one H1, breadcrumb-free direct content, final demo CTA, and shared footer. `/demo` reserves a 16:9 stable media region; until `NEXT_PUBLIC_DEMO_VIDEO_URL` is a valid HTTPS URL, it renders `supervisor.webp` with play controls absent. Pricing has feature comparison and contact CTAs but no numeric price, checkout, cart, or payment language.

- [ ] **Step 3: Capture product evidence from the local-only Flask UI**

Start the product UI in a separate terminal:

```powershell
Set-Location D:\shopee-auto-lister
.\.venv\Scripts\python.exe -B app.py
```

The capture script connects only to the passed local URL, never copies HTML/API data into the website, and performs these captures:

1. `#dashboard-supervisor-report` after replacing transcript and evidence text with approved non-sensitive demo copy.
2. `#page-task` after replacing every store option with `示例店铺` and clipping the natural-language/pricing controls.
3. `.image-workspace` after invoking `showPage('optimize')` and `selectOptType('image')`, with empty identities.
4. The pricing calculator inside `#shopboard-frame`, with store/company filters hidden and neutral numeric inputs.

Before each screenshot, walk visible text nodes and reject the capture if text matches email, phone, `http`, `api_key`, `token`, `cookie`, `signature`, or a configured sensitive-name list. Capture PNG to a temporary ignored directory, convert with Sharp to 1600px-wide quality-82 WebP, strip metadata, and delete the PNG. The script exits nonzero if any output is missing, below 40KB, or has an unexpected dimension.

Run:

```powershell
node scripts/capture-product-evidence.mjs --base-url http://127.0.0.1:8080 --out public/images/product-evidence
Get-ChildItem public\images\product-evidence\*.webp | Select-Object Name,Length
```

Expected: four named files, each above 40KB, with no product write action triggered.

- [ ] **Step 4: Verify assets and commit the public-site milestone**

Visually inspect all four files before staging. Run:

```powershell
npm test -- "src/app/(marketing)"
npm run build
git add src/app src/components/marketing scripts/capture-product-evidence.mjs public/images/product-evidence
git commit -m "feat: add public pages and product evidence"
```

Expected: build lists `/product`, `/solutions`, `/pricing`, `/demo`, `/privacy`, and `/terms`; the commit contains no files from `D:\shopee-auto-lister`.

### Task 5: Add PostgreSQL Schema And Shared Security Adapters

**Files:** Create `prisma/schema.prisma`, `prisma/migrations/20260719_initial_account_and_conversion/migration.sql`, `src/server/db.ts`, `src/server/http/origin.ts`, `src/server/security/rate-limit.ts`, `src/server/security/tokens.ts`, `src/server/security/password.ts`, `src/server/security/normalize-email.ts`, `src/server/email/mailer.ts`, `src/server/email/templates.ts`; test `src/server/http/origin.test.ts`, `src/server/security/rate-limit.test.ts`, `src/server/security/tokens.test.ts`, `src/server/security/password.test.ts`, `src/server/security/normalize-email.test.ts`, `tests/db/schema.test.ts`.

**Interfaces:** `normalizeEmail(string): string`; `hashPassword(string): Promise<string>`; `verifyPassword(hash,string): Promise<boolean>`; `issueOpaqueToken(): { raw: string; hash: string }`; `assertSameOrigin(request: Request): void`; `consumeRateLimit(input: { scope: string; key: string; limit: number; windowMs: number }): Promise<boolean>`.

- [ ] **Step 1: Write failing security tests**

```ts
expect(normalizeEmail("  Seller@Example.COM ")).toBe("seller@example.com");
const encoded = await hashPassword("correct horse battery staple");
expect(encoded).not.toContain("correct horse battery staple");
expect(await verifyPassword(encoded, "correct horse battery staple")).toBe(true);
expect(await verifyPassword(encoded, "wrong password")).toBe(false);
const token = issueOpaqueToken();
expect(token.raw).toMatch(/^[A-Za-z0-9_-]{43}$/);
expect(token.hash).toMatch(/^[a-f0-9]{64}$/);
```

Run: `npm test -- src/server/security`

Expected: FAIL with unresolved modules.

- [ ] **Step 2: Define the Prisma schema without a Session model**

Models and required fields:

- `User`: cuid id, unique normalized email, passwordHash, emailVerifiedAt, locale default `zh-CN`, createdAt, updatedAt.
- `EmailVerificationToken`: cuid id, unique tokenHash, userId cascade, expiresAt, usedAt, createdAt; indexes on `(userId, usedAt)` and `expiresAt`.
- `DemoRequest`: cuid id, optional userId set-null, type enum `DEMO|SUPPORT`, name, email, company, storeCountBand, contactMethod, contactValue, message, status enum `NEW|CONTACTED|CLOSED`, notificationStatus enum `PENDING|SENT|FAILED`, notificationAttempts, notificationError, createdAt, updatedAt.
- `License`: cuid id, userId cascade, edition enum `STARTER|PROFESSIONAL|ENTERPRISE`, status enum `PENDING|ACTIVE|EXPIRED|REVOKED`, storeBand, seats, issuedAt, expiresAt, createdAt, updatedAt.
- `ClientRelease`: cuid id, unique version, platform default `windows-x64`, installerUrl, checksum, releaseNotes, minimumSupportedVersion, isPublished, publishedAt, createdAt.
- `LaunchCode`: cuid id, unique codeHash, userId cascade, licenseId cascade, optional clientReleaseId set-null, expiresAt, usedAt, createdAt; indexes on `(userId, usedAt)` and `expiresAt`.
- `RateLimitEvent`: cuid id, scope, keyHash, createdAt; composite index `(scope, keyHash, createdAt)`.

No model contains marketplace, browser-profile, AI-provider, API-key, cookie, or signature fields.

- [ ] **Step 3: Implement adapters and environment contract**

`.env.example` contains syntactically valid keys only: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `APP_BASE_URL`, SMTP host/port/secure/user/password/from, `SALES_NOTIFICATION_EMAIL`, `CLIENT_STORAGE_BASE_URL`, `AXIO_PROTOCOL_ENABLED=false`, and `NEXT_PUBLIC_DEMO_VIDEO_URL`. `getServerEnv()` validates server-only variables when a server feature is invoked, not during static marketing builds.

Rate limiting hashes the supplied key with SHA-256, deletes expired events for that scope/key in a transaction, counts the remaining window, and creates one event only when below the limit. SMTP uses pooled Nodemailer transport and never logs credentials or raw verification tokens.

- [ ] **Step 4: Validate locally, then migrate only against an explicit external test database**

```powershell
$env:DATABASE_URL='postgresql://schema:validation@127.0.0.1:5432/axio_schema_validation'
npx prisma format
npx prisma validate
npx prisma generate
New-Item -ItemType Directory -Force prisma\migrations\20260719_initial_account_and_conversion | Out-Null
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script --output prisma/migrations/20260719_initial_account_and_conversion/migration.sql
$env:DATABASE_URL=$env:TEST_DATABASE_URL
npx prisma migrate deploy
npm run test:db -- tests/db/schema.test.ts
```

Expected: format, validate, generate, and deterministic SQL generation succeed without connecting; deploy and DB test run only when `TEST_DATABASE_URL` is nonempty and point at a disposable external PostgreSQL database. The schema test confirms all seven models exist and no `Session` table exists.

- [ ] **Step 5: Verify and commit**

```powershell
npm test -- src/server/security
npm run typecheck
git add .env.example prisma src/server/db.ts src/server/http src/server/security src/server/email tests/db/schema.test.ts
git commit -m "feat: add account data and security foundation"
```

### Task 6: Persist Demo And Support Requests Without Duplicating On Mail Failure

**Files:** Create `src/server/demo/schema.ts`, `src/server/demo/repository.ts`, `src/server/demo/service.ts`, `src/server/demo/prisma-repository.ts`, `src/app/api/demo-requests/route.ts`; modify `src/components/marketing/demo-form.tsx`; test `src/server/demo/schema.test.ts`, `src/server/demo/service.test.ts`, `src/app/api/demo-requests/route.test.ts`, `src/components/marketing/demo-form.test.tsx`.

**Interfaces:** `DemoInput` fields are `type`, `name`, `email`, `company`, `storeCountBand`, `contactMethod`, `contactValue`, `message`; `submitRequest(input,deps): Promise<{ id: string }>` persists before notification; POST `/api/demo-requests` returns 201 `{ ok: true, requestId }` or safe 400/429 responses.

- [ ] **Step 1: Write failing service tests**

```ts
it("keeps one persisted request when notification fails", async () => {
  const repo = makeDemoRepo();
  const mailer = { notifySales: vi.fn().mockRejectedValue(new Error("smtp unavailable")) };
  const result = await submitRequest(validDemoInput, { repo, mailer, now: () => fixedNow });
  expect(result.id).toBe("request-1");
  expect(repo.created).toHaveLength(1);
  expect(repo.created[0].notificationStatus).toBe("PENDING");
  expect(repo.notificationUpdates).toEqual([{ id: "request-1", status: "FAILED" }]);
});
```

Also test email normalization, all store-count bands, missing contact value, message maximum length, same-origin rejection, and the 5-per-hour IP/email rate limits.

Run: `npm test -- src/server/demo src/app/api/demo-requests`

Expected: FAIL with unresolved service and route.

- [ ] **Step 2: Implement the domain and route**

The Zod schema accepts store bands `1`, `2-9`, `10-50`, `51-100`, `101-200`, `200+`; contact methods `email`, `wechat`, `phone`; trims all strings; uses the normalized email when contact method is email. The service creates exactly one record, attempts sales notification, and updates notification state without retrying the insert. Route order is same-origin check, JSON size guard, schema parse, rate limit, service call, response.

- [ ] **Step 3: Wire the form and verify**

`DemoForm` has labels, inline errors, pending state, a stable success region, and preserves values on network failure. It sends no analytics payload and never treats notification failure as form failure after persistence.

```powershell
npm test -- src/server/demo src/app/api/demo-requests src/components/marketing/demo-form.test.tsx
npm run typecheck
git add src/server/demo src/app/api/demo-requests src/components/marketing/demo-form.tsx src/components/marketing/demo-form.test.tsx
git commit -m "feat: persist AXIO demo requests"
```

Expected: service tests prove one insert on SMTP failure and the form announces success only for HTTP 201.

### Task 7: Implement Registration And Single-Use Email Verification

**Files:** Create `src/server/registration/schema.ts`, `src/server/registration/repository.ts`, `src/server/registration/service.ts`, `src/server/registration/prisma-repository.ts`, `src/app/api/register/route.ts`, `src/app/api/verify-email/route.ts`, `src/app/api/verify-email/resend/route.ts`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/register/register-form.tsx`, `src/app/(auth)/verify-email/page.tsx`; test `src/server/registration/schema.test.ts`, `src/server/registration/service.test.ts`, `src/app/api/register/route.test.ts`, `src/app/api/verify-email/route.test.ts`, `src/app/api/verify-email/resend/route.test.ts`, `src/app/(auth)/register/register-form.test.tsx`, `src/app/(auth)/verify-email/page.test.tsx`.

**Interfaces:** `registerAccount(input,deps): Promise<{ accepted: true }>` is non-enumerating; `verifyEmail(rawToken,deps): Promise<"verified"|"invalid"|"expired"|"used">`; verification token lifetime is 60 minutes; resend minimum interval is 10 minutes and maximum is 3 per 24 hours.

- [ ] **Step 1: Write failing privacy and token tests**

```ts
it.each(["new@example.com", "existing@example.com"])("returns the same accepted result for %s", async (email) => {
  expect(await registerAccount({ email, password: strongPassword }, depsFor(email))).toEqual({ accepted: true });
});

it("consumes a verification token once", async () => {
  const first = await verifyEmail(rawToken, deps);
  const replay = await verifyEmail(rawToken, deps);
  expect(first).toBe("verified");
  expect(replay).toBe("used");
});
```

Also test password length 12-128, normalized email, 60-minute expiry boundary, resend bounds, and that only token hashes reach the repository.

Run: `npm test -- src/server/registration src/app/api/register src/app/api/verify-email`

Expected: FAIL with unresolved registration modules.

- [ ] **Step 2: Implement registration transaction and email**

For a new email, hash the password, create the unverified user and hashed verification token in one transaction, then send `APP_BASE_URL/verify-email?token=<raw>`. For an existing verified email, return the identical accepted response without mail. For an existing unverified email, apply resend bounds, replace unused tokens, and send a new link. Do not log raw password/token or reveal which branch ran in the HTTP response.

- [ ] **Step 3: Implement APIs and screens**

POST `/api/register` returns 202 and the same Chinese message for new/existing accounts. GET `/api/verify-email?token=` returns a typed status; the page maps it to verified, invalid, expired with bounded resend, or already-used views. Registration UI includes password requirements before submit and links to terms/privacy.

- [ ] **Step 4: Verify and commit the registration milestone**

```powershell
npm test -- src/server/registration src/app/api/register src/app/api/verify-email "src/app/(auth)/register" "src/app/(auth)/verify-email"
npm run typecheck
git add src/server/registration src/app/api/register src/app/api/verify-email "src/app/(auth)/register" "src/app/(auth)/verify-email"
git commit -m "feat: add verified email registration"
```

Expected: duplicate responses are byte-equivalent, expired/replayed tokens cannot verify, and raw tokens are absent from database test records.

### Task 8: Add Auth.js Credentials Login With Signed JWT Sessions

**Files:** Create `src/auth.ts`, `src/types/next-auth.d.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/login/login-form.tsx`; test `src/auth.test.ts`, `src/app/(auth)/login/login-form.test.tsx`.

**Interfaces:** `authorize(credentials): Promise<{ id: string; email: string } | null>` accepts only verified users; session strategy is `jwt`, maximum age is 30 days; `session.user.id` is always defined for authenticated sessions.

- [ ] **Step 1: Write failing authorization tests**

```ts
expect(await authorizeUser({ email: "seller@example.com", password: correct }, verifiedDeps)).toEqual({ id: "u1", email: "seller@example.com" });
expect(await authorizeUser({ email: "seller@example.com", password: wrong }, verifiedDeps)).toBeNull();
expect(await authorizeUser({ email: "pending@example.com", password: correct }, unverifiedDeps)).toBeNull();
```

Also assert JWT callback copies `user.id` to `token.sub`, session callback copies `token.sub` to `session.user.id`, and errors do not distinguish unknown email from wrong password.

Run: `npm test -- src/auth.test.ts "src/app/(auth)/login"`

Expected: FAIL before Auth.js configuration exists.

- [ ] **Step 2: Configure Auth.js**

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  providers: [Credentials({ credentials: { email: {}, password: {} }, authorize })],
  callbacks: {
    jwt({ token, user }) { if (user?.id) token.sub = user.id; return token; },
    session({ session, token }) { if (session.user && token.sub) session.user.id = token.sub; return session; },
  },
});
```

Use Auth.js CSRF handling, `AUTH_SECRET`, trusted production host, secure-cookie defaults in HTTPS, and database rate limiting before password verification. Do not add a Prisma adapter or session table.

- [ ] **Step 3: Implement login UI and verify**

`LoginForm` calls `signIn("credentials", { email, password, redirect: false })`, shows one generic invalid-credentials message, links to register and resend verification, and redirects success to `/account`.

```powershell
npm test -- src/auth.test.ts "src/app/(auth)/login"
npm run typecheck
git add src/auth.ts src/types/next-auth.d.ts src/app/api/auth "src/app/(auth)/login"
git commit -m "feat: add signed JWT account login"
```

Expected: tests pass, generated Prisma schema still has no `Session`, and login UI has no email-enumeration branch.

### Task 9: Build Protected Member Center, License, And Downloads

**Files:** Create `src/server/member/authorization.ts`, `src/server/member/repository.ts`, `src/server/member/prisma-repository.ts`, `src/app/(member)/account/layout.tsx`, `src/app/(member)/account/page.tsx`, `src/app/(member)/account/license/page.tsx`, `src/app/(member)/account/downloads/page.tsx`; test `src/server/member/authorization.test.ts`, `src/app/(member)/account/layout.test.tsx`, `src/app/(member)/account/downloads/page.test.tsx`.

**Interfaces:** `getMemberAccess(userId): Promise<{ user; license: LicenseView | null; releases: ReleaseView[] }>`; releases are returned only when license status is `ACTIVE`, expiry is future/null, and release is published; unauthenticated member routes redirect to `/login?callbackUrl=<path>`.

- [ ] **Step 1: Write failing authorization tests**

```ts
expect(await listAuthorizedReleases("u1", activeLicenseDeps)).toEqual([publishedRelease]);
expect(await listAuthorizedReleases("u1", pendingLicenseDeps)).toEqual([]);
expect(await listAuthorizedReleases("u1", expiredLicenseDeps)).toEqual([]);
expect(await listAuthorizedReleases("u1", unpublishedReleaseDeps)).toEqual([]);
```

Page tests assert account navigation includes overview, authorization, downloads, launch, and support; blocked download states show `联系咨询` and never render installer URLs.

Run: `npm test -- src/server/member "src/app/(member)"`

Expected: FAIL with unresolved modules.

- [ ] **Step 2: Implement the policy and protected layout**

Call `auth()` in the member layout and redirect before rendering child content. The overview shows verification/license state and recent demo/support requests. License page shows edition, store band, issued/expiry dates. Downloads render checksum, release notes, minimum supported version, and HTTPS installer link only after server authorization. URLs must start with `CLIENT_STORAGE_BASE_URL`; reject any other origin.

- [ ] **Step 3: Verify and commit**

```powershell
npm test -- src/server/member "src/app/(member)"
npm run typecheck
git add src/server/member "src/app/(member)"
git commit -m "feat: add licensed AXIO member center"
```

Expected: no unauthorized render contains a release URL and all member routes share the same server-side guard.

### Task 10: Add Feature-Flagged Client Launch And Account Support

**Files:** Create `src/server/launch/service.ts`, `src/server/launch/repository.ts`, `src/server/launch/prisma-repository.ts`, `src/app/api/launch-codes/route.ts`, `src/app/api/support-requests/route.ts`, `src/app/(member)/account/launch/page.tsx`, `src/app/(member)/account/support/page.tsx`; test `src/server/launch/service.test.ts`, `src/app/api/launch-codes/route.test.ts`, `src/app/api/support-requests/route.test.ts`, `src/app/(member)/account/launch/page.test.tsx`, `src/app/(member)/account/support/page.test.tsx`.

**Interfaces:** `createLaunchCode(input,deps): Promise<{ launchUrl: string; fallbackUrl: string; expiresAt: Date }>` creates a 5-minute hashed single-use code for an active license; `consumeLaunchCode(rawCode,deps): Promise<{ userId: string; licenseId: string; releaseId: string | null }>` atomically marks one valid code used for service-level tests; API issuance is unavailable unless `AXIO_PROTOCOL_ENABLED=true`; no HTTP exchange endpoint is shipped in V1.

- [ ] **Step 1: Write failing launch-policy tests**

```ts
const result = await createLaunchCode({ userId: "u1", releaseId: "r1" }, activeDeps);
expect(result.launchUrl).toMatch(/^axio:\/\/launch\?code=[A-Za-z0-9_-]{43}$/);
expect(result.launchUrl).not.toContain("u1");
expect(activeDeps.repo.saved.codeHash).toMatch(/^[a-f0-9]{64}$/);
await expect(createLaunchCode({ userId: "u1", releaseId: "r1" }, inactiveDeps)).rejects.toThrow("LICENSE_REQUIRED");
const rawCode = result.launchUrl.split("code=")[1];
expect(await consumeLaunchCode(rawCode, activeDeps)).toEqual({ userId: "u1", licenseId: "l1", releaseId: "r1" });
await expect(consumeLaunchCode(rawCode, activeDeps)).rejects.toThrow("CODE_USED");
```

Also test five-minute expiry, atomic expiry/use conditions, HTTPS fallback, one issuance per minute, and `AXIO_PROTOCOL_ENABLED=false` returning 404 without creating a code.

Run: `npm test -- src/server/launch src/app/api/launch-codes src/app/api/support-requests`

Expected: FAIL before launch/support modules exist.

- [ ] **Step 2: Implement launch and support boundaries**

Launch creation authorizes user/license/release server-side, stores only SHA-256 hash, and returns raw code once. The service-level consumer hashes the presented code and updates `usedAt` only when `usedAt` is null and `expiresAt` is future, so concurrent or replayed consumption fails. It is not exposed as an HTTP route in V1. The page opens the protocol only after an explicit `启动 AXIO` click, waits 1500ms, then reveals one installer fallback; it never loops. With the flag off it displays `NEXT` and the authorized download/contact path. Support reuses `DemoRequest` with type `SUPPORT`, authenticated user identity, and the same persist-before-notify behavior.

- [ ] **Step 3: Verify and commit the member milestone**

```powershell
npm test -- src/server/launch src/app/api/launch-codes src/app/api/support-requests "src/app/(member)/account/launch" "src/app/(member)/account/support"
npm run typecheck
git add src/server/launch src/app/api/launch-codes src/app/api/support-requests "src/app/(member)/account/launch" "src/app/(member)/account/support"
git commit -m "feat: add controlled client entry and support"
```

Expected: feature-off tests create no code; generated links contain only the opaque code; no production exchange route exists.

### Task 11: Add Static Safety, SEO, Accessibility, And Browser Tests

**Files:** Create `scripts/check-content-boundaries.mjs`, `scripts/check-sensitive-content.mjs`, `scripts/check-internal-links.mjs`, `tests/e2e/helpers/visual-audit.ts`, `tests/e2e/public-site.spec.ts`, `tests/e2e/auth-member.spec.ts`, `tests/e2e/visual-integrity.spec.ts`, `src/app/not-found.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`; modify `src/app/layout.tsx`, `src/app/globals.css`, `src/components/home/operations-canvas.tsx`, `src/components/site/site-header.tsx`, `src/components/site/mobile-navigation.tsx`.

**Interfaces:** `auditPage(page): Promise<{ smallText: string[]; overflow: string[]; overlaps: string[] }>`; `canvasVariance(locator): Promise<number>` must exceed 8; static checks exit nonzero on content/status drift, public sensitive strings, broken links, or missing metadata.

- [ ] **Step 1: Write public browser tests**

```ts
test("light default, dark persistence, full-screen hero, and working routes", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("heading", { level: 1, name: "AXIO 智核" })).toBeInViewport();
  await expect(page.locator("[data-testid=hero]")).toHaveCSS("min-height", /.+/);
  await page.getByRole("button", { name: "切换到深色模式" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  for (const path of ["/product", "/solutions", "/pricing", "/demo", "/login", "/register", "/privacy", "/terms"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
  }
});
```

Visual tests run desktop 1440x900, mobile 390x844, and wide 1920x1080 in light/dark/reduced-motion. They assert font size at least 12px, no document horizontal overflow, no intersecting visible text/control boxes, stable media dimensions, zero console/page errors, Canvas variance above 8, theme recoloring, and a frozen reduced-motion frame.

- [ ] **Step 2: Write authenticated DB E2E fixture**

Against only `TEST_DATABASE_URL`, seed one verified user, one active Professional license, one published release, and one expired license user. Test registration to verification using a captured mailer, credentials login, member redirect, authorized download, denied download, support persistence, feature-off launch, feature-on launch, and replay-safe opaque code storage. Delete seeded records after the suite.

- [ ] **Step 3: Implement static release gates**

`check-content-boundaries` imports content and enforces six/21/3 plus a denylist for deferred claims without `NEXT`. `check-sensitive-content` scans tracked text/metadata, excluding the local capture script's base URL argument, for credentials, real emails/phones, `localhost:8080`, Flask API paths, and forbidden secret field names. `check-internal-links` extracts internal hrefs from the route registry and verifies they map to files. Add Organization and SoftwareApplication JSON-LD without ratings, prices, or invented claims; add canonical metadata, `robots.ts`, and `sitemap.ts` for public routes only.

- [ ] **Step 4: Run RED, fix each reported UI defect, then verify GREEN**

```powershell
npx playwright install chromium
npm run dev -- --hostname 127.0.0.1
npm run test:e2e -- tests/e2e/public-site.spec.ts tests/e2e/visual-integrity.spec.ts
$env:DATABASE_URL=$env:TEST_DATABASE_URL
npm run test:e2e -- tests/e2e/auth-member.spec.ts
node scripts/check-content-boundaries.mjs
node scripts/check-sensitive-content.mjs
node scripts/check-internal-links.mjs
```

Expected: all checks pass; screenshots show a nonblank correctly framed Canvas and no overlap on all three viewports. Auth E2E runs only with a disposable external database.

- [ ] **Step 5: Commit**

```powershell
git add src tests scripts package.json package-lock.json
git commit -m "test: harden AXIO website release quality"
```

### Task 12: Document Deployment And Run Final Production Verification

**Files:** Create `README.md`, `docs/operations/deployment.md`.

**Interfaces:** Runbook separates public-only startup from configured account services and documents every environment key, migration, SMTP check, S3-compatible release URL rule, rollback, and secret boundary.

- [ ] **Step 1: Write the operations checklist as an executable runbook**

`README.md` includes Node 24 setup, install, public dev/build commands, external PostgreSQL requirement, and route map. Deployment documentation uses this sequence: provision PostgreSQL, configure HTTPS origin and Auth secret, run `prisma migrate deploy`, configure SMTP, publish installers in S3-compatible storage, insert only approved HTTPS release metadata, run verification, start Next.js, then smoke-test registration and member access. Rollback reverts application release while retaining forward-compatible migrations; secrets never enter Git.

- [ ] **Step 2: Run the complete non-database gate**

```powershell
npm ci
npm run lint
npm run typecheck
npm run format:check
npm test
node scripts/check-content-boundaries.mjs
node scripts/check-sensitive-content.mjs
node scripts/check-internal-links.mjs
npm run build
npm run test:e2e -- tests/e2e/public-site.spec.ts tests/e2e/visual-integrity.spec.ts
git diff --check
```

Expected: every command exits 0; marketing routes build and run without a database connection.

- [ ] **Step 3: Run the configured-database gate**

```powershell
$env:DATABASE_URL=$env:TEST_DATABASE_URL
npx prisma migrate deploy
npm run test:db
npm run test:e2e -- tests/e2e/auth-member.spec.ts
```

Expected: migration reports database up to date; DB and authenticated browser suites pass against the disposable external PostgreSQL database.

- [ ] **Step 4: Inspect production output and final Git scope**

Start `npm run start` after build and inspect desktop/mobile light/dark screenshots, Canvas pixels, all four evidence images, registration, login, member states, and demo submission. Run `git status --short`, `git diff --stat HEAD`, and `git ls-files`; confirm `.env*` except `.env.example`, `.superpowers/`, `.next/`, reports, and product-repository files are absent.

- [ ] **Step 5: Commit final documentation and verified fixes**

```powershell
git add README.md docs/operations/deployment.md
git add src tests scripts package.json package-lock.json
git commit -m "docs: finalize AXIO website operations"
git status --short --branch
```

Expected: final commit succeeds and the worktree is clean.

## Self-Review Record

- Spec coverage: objectives, positioning, full-screen layout, light/dark theme, typography, motion, all public/member routes, homepage order, six capability groups, cloud/local boundary, data model, registration, error/security rules, accessibility, assets, release scope, Git workflow, and acceptance criteria map to Tasks 1-12.
- Environment coverage: Tasks 1-4 and non-database gates run on Node 24 without Docker or PostgreSQL; Tasks 5-12 clearly gate database mutation behind a supplied disposable `TEST_DATABASE_URL`.
- Interface consistency: `DemoRequest` serves demo/support; launch uses active `License` and published `ClientRelease`; verification and launch store token hashes; Auth.js uses JWT and `session.user.id`; there is no `Session` model or Prisma adapter.
- Content consistency: the registry has six groups, 21 `NOW`, 3 `NEXT`; pricing has no invented amount; deferred deep-link exchange and AI/platform image writes remain marked as future.
- Security consistency: public code never links to Flask, sensitive local/product values remain outside the website, and download URLs are server-authorized against the configured storage origin.
- Git consistency: every task ends with a scoped atomic commit and no command stages the product repository.
