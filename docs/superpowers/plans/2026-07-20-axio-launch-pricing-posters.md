# AXIO Launch Pricing And WeChat Posters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Publish the approved launch pricing and produce two reusable 1080 × 1440 WeChat posters plus Moments copy.

**Architecture:** Typed static pricing feeds the home and pricing pages. A Node/Sharp renderer composes the real product screenshot, exact copy, and existing QR code; jsQR verifies the result.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest, Sharp, jsQR.

## Global Constraints

- Keep GitHub Pages compatibility; add no payment, database, registration, or license server.
- Launch prices: Starter ¥399/year, Professional ¥699/year, Team ¥1,999/year.
- Formal prices: Starter ¥999/year, Professional ¥1,999/year, Team ¥4,999/year.
- Professional is the only featured package and has 20 launch seats.
- Custom deployment is ¥6,800+; source delivery is quoted separately.
- Posters use task-pricing.webp and wechat-nay.webp at 1080 × 1440.
- The capabilities poster contains no price.
- Do not modify the AXIO product repository.

## File Map

- Pricing contract: src/content/types.ts, src/content/zh-cn.ts, src/content/zh-cn.test.ts.
- Pricing UI: package-band.tsx, package-comparison.tsx, pricing/page.tsx, related CSS and tests.
- Posters: scripts/render-campaign-posters.mjs and its test; four outputs under public/images/campaigns/.
- Campaign docs: docs/marketing/, pricing research, and docs index.

---

### Task 1: Centralize The Pricing Contract

**Files:**
- Modify: src/content/types.ts
- Modify: src/content/zh-cn.ts
- Test: src/content/zh-cn.test.ts

**Interfaces:**
- Produces: PackageOption pricing fields used by both pricing views.
- Consumes: no new runtime dependency.

- [ ] **Step 1: Write the failing content test**

~~~ts
expect(zhCN.packages.map((item) => ({
  name: item.name,
  regularPrice: item.regularPrice,
  launchPrice: item.launchPrice,
  featured: item.featured,
}))).toEqual([
  { name: 'Starter', regularPrice: '¥999', launchPrice: '¥399', featured: false },
  { name: 'Professional', regularPrice: '¥1,999', launchPrice: '¥699', featured: true },
  { name: 'Team', regularPrice: '¥4,999', launchPrice: '¥1,999', featured: false },
]);
~~~

- [ ] **Step 2: Verify RED**

Run npx vitest run src/content/zh-cn.test.ts.

Expected: FAIL because Enterprise remains and pricing fields are absent.

- [ ] **Step 3: Extend PackageOption and update zhCN**

~~~ts
export type PackageOption = {
  readonly name: 'Starter' | 'Professional' | 'Team';
  readonly audience: string;
  readonly description: string;
  readonly regularPrice: string;
  readonly launchPrice: string;
  readonly launchLabel: string;
  readonly delivery: string;
  readonly featured: boolean;
};
~~~

Use:

- Starter: ¥999 formal, ¥399 launch, “首发价”, self-service delivery.
- Professional: ¥1,999 formal, ¥699 launch, “首发 20 席”, standard support, featured.
- Team: ¥4,999 formal, ¥1,999 launch, “首发价”, priority support and limited rules.
- packagesTitle: “首发版本方案”.

- [ ] **Step 4: Verify GREEN**

Run npx vitest run src/content/zh-cn.test.ts. Expected: all tests pass.

- [ ] **Step 5: Commit**

Stage the three Task 1 files and commit with message: feat: define AXIO launch pricing.

### Task 2: Publish Pricing On Home And Pricing Pages

**Files:**
- Modify: src/components/home/package-band.tsx
- Modify: src/components/marketing/package-comparison.tsx
- Modify: src/app/(marketing)/pricing/page.tsx
- Modify: src/app/(marketing)/public-routes.test.tsx
- Modify: src/app/home.css
- Modify: src/app/(marketing)/marketing.css

**Interfaces:**
- Consumes: PackageOption from Task 1.
- Produces: formal/launch price cards, one featured state, and /demo CTAs.

- [ ] **Step 1: Write the failing route test**

For every package, locate data-testid “package-” plus its lower-case name and assert regularPrice and launchPrice. Assert “首发仅限 20 席”, “定制部署 ¥6,800 起”, “源码交付单独报价”, and “不支持在线付款”. Assert no purchase/payment/checkout button. Change the expected pricing H1 to “首发版本方案”.

- [ ] **Step 2: Verify RED**

Run npx vitest run src/app/(marketing)/public-routes.test.tsx.

Expected: FAIL because the old page has no prices or new heading.

- [ ] **Step 3: Implement card markup**

Each article gets data-featured and data-testid. Render the option name, audience, “正式售价 {regularPrice} / 年”, a prominent launchPrice, “/ 年 · {launchLabel}”, description, delivery, and a /demo “预约演示” link. Remove deliveryByPackage.

- [ ] **Step 4: Update page copy**

Use eyebrow “LAUNCH / 20 SEATS”, H1 “首发版本方案”, and state that Professional has 20 launch seats. Add a two-item custom-delivery section for “定制部署 ¥6,800 起” and “源码交付单独报价”. Keep the no-payment message and list excluded third-party costs.

- [ ] **Step 5: Update home preview**

Render formal price, launch price, and launchLabel in each card. Change the CTA to “查看方案”.

- [ ] **Step 6: Add responsive styles**

Use 42px launch prices on desktop and 36px narrow. Only the featured card gets an orange top border and restrained tint. Keep three desktop columns and narrow horizontal scrolling. Use two custom-delivery columns, collapsing below 760px.

- [ ] **Step 7: Verify GREEN**

Run the content test, public-routes test, page test, and npm run typecheck. Expected: all pass.

- [ ] **Step 8: Commit**

Stage the six Task 2 files and commit with message: feat: publish launch pricing.

### Task 3: Generate And Verify Two Campaign Posters

**Files:**
- Modify: package.json
- Modify: package-lock.json
- Create: scripts/render-campaign-posters.test.mjs
- Create: scripts/render-campaign-posters.mjs
- Create: four PNG/JPEG files under public/images/campaigns/

**Interfaces:**
- Produces: campaigns, renderCampaignPosters(), assertCampaignAssets(), POSTER_WIDTH, POSTER_HEIGHT.
- Consumes: Sharp, jsQR, task-pricing.webp, and wechat-nay.webp.

- [ ] **Step 1: Install QR verification**

Run npm install --save-dev jsqr. Add campaign:posters mapped to node scripts/render-campaign-posters.mjs.

- [ ] **Step 2: Write the failing poster test**

First assert scripts/render-campaign-posters.mjs exists, then dynamically import it. Assert campaign keys and showPrice values equal launch-price/true and capabilities/false. Call renderCampaignPosters(), assert four non-empty outputs, and verify every image is 1080 × 1440. Decode each poster QR through Sharp raw RGBA plus jsQR and compare the payload with the decoded source QR.

- [ ] **Step 3: Verify RED**

Run npx vitest run scripts/render-campaign-posters.test.mjs.

Expected: FAIL because the renderer does not exist.

- [ ] **Step 4: Implement the deterministic renderer**

Export POSTER_WIDTH=1080, POSTER_HEIGHT=1440, and:

- launch-price: showPrice true, title “让重复运营，交给系统执行”.
- capabilities: showPrice false, title “从经营意图，到业务回读”.

Render a solid #0b0d10 background, warm-white text, #ff5a36 accents, and #56b98a safety accents. Use Microsoft YaHei/PingFang/Noto Sans CJK/Arial fallbacks in an SVG text layer. Composite a pricing-focused crop of task-pricing.webp into a 920px framed surface. Composite the QR unrotated on a 176 × 176 white square.

Render six indexed capabilities: Shopee 店群运营, 自然语言任务编排, 透明公式精准控价, 妙手 ERP 批量执行, 违禁与图片风险管控, 结果回读与矩阵经营.

The price poster prominently shows Professional ¥699, formal ¥1,999, 20 seats, Starter ¥399, Team ¥1,999, custom deployment ¥6,800+, and source delivery quoted separately. The capabilities poster shows the six operating stages and no currency. Strip metadata; write PNG and JPEG quality 92.

- [ ] **Step 5: Verify GREEN**

Run npm run campaign:posters and the poster test. Expected: four outputs and matching QR payloads.

- [ ] **Step 6: Inspect at full size and 360px preview**

Check clipping, screenshot legibility, QR quiet zone, three-second price scan, no price on the capability poster, and no TikTok visual assets.

- [ ] **Step 7: Commit**

Stage package files, renderer, test, and public/images/campaigns. Commit with message: feat: create AXIO launch posters.

### Task 4: Align Campaign Documentation

**Files:**
- Create: docs/marketing/2026-07-20-wechat-launch-copy.md
- Modify: docs/research/2026-07-20-axio-pricing-research.md
- Modify: docs/README.md

**Interfaces:**
- Consumes: approved prices and copy.
- Produces: canonical Moments copy and an explicit pricing-decision notice.

- [ ] **Step 1: Create the copy document**

Include both poster paths, the approved five-paragraph Moments copy, and this short version: “Shopee 店群自动化，从任务编排、透明公式精准控价到妙手 ERP 批量执行。AXIO Professional 首发 20 席，¥699/年。扫码看实机演示。”

State that “首发限量价” must not be replaced with “历史原价” and the static site cannot claim online purchase.

- [ ] **Step 2: Update the research report**

Add “当前首发决策” at the top with all formal/launch prices, custom deployment ¥6,800+, and source delivery separately quoted. State that higher enterprise-led research suggestions are value anchors, not current public prices.

- [ ] **Step 3: Update the docs index**

Add the marketing copy document with purpose “首发价格、海报路径和朋友圈宣传文案”.

- [ ] **Step 4: Verify and commit**

Run Prettier check on the three docs and git diff --check. Commit with message: docs: publish AXIO launch campaign copy.

### Task 5: Full Verification And Preview

**Files:** Verify only unless a check exposes a defect.

**Interfaces:**
- Consumes: Tasks 1-4 outputs.
- Produces: clean static build, verified posters, and local preview URL.

- [ ] **Step 1: Run full verification**

Run lint, typecheck, format:check, unit tests, build, e2e, and git diff --check. Report any unchanged existing warning.

- [ ] **Step 2: Regenerate and reverify posters**

Run npm run campaign:posters and the poster test. Expected: dimensions and QR checks pass after regeneration.

- [ ] **Step 3: Start local preview**

Start npm run dev on the first available loopback port. Inspect /pricing at desktop and mobile widths for clipping, featured state, and correct boundaries.

- [ ] **Step 4: Final repository check**

Run git status --short --branch and git log -6 --oneline. Expected: clean master and separate content, UI, poster, and docs commits.
