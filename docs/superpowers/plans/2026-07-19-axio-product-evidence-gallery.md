# AXIO Product Evidence Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make real AXIO product interfaces and a static WeChat contact path directly visible across the homepage and demo route.

**Architecture:** Keep product evidence metadata in the existing server component, render responsive Next Image elements through withBasePath(), and add one reusable WeChat contact component. Asset preprocessing uses Sharp at development time; no runtime server dependency is introduced.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS, Sharp, Vitest Testing Library, Playwright

## Clarity Iteration

Owner review replaced image-workspace.webp and matrix-pricing.webp with risk-control.webp and pricing-formula.webp. The approved gallery is now a single wide reading column at every viewport, keeps rendered width at or below intrinsic pixels, links every screenshot to its original asset, and removes decorative hero guide and frame lines. This amendment supersedes the two-column instructions below while preserving the original implementation history.

## Global Constraints

- Preserve GitHub Pages static export and project base paths.
- Preserve navigation, copy order, brand orange, light/dark themes, and reduced motion.
- Optimize for 2048x1024 and 1440x900 before tablet and mobile degradation.
- Never crop or stretch product screenshots.
- Do not publish the WeChat profile header, location, or bottom instructional text.
- Add no API, database, authentication, or server dependency.

---

### Task 1: Lock The New Evidence Contract

**Files:**
- Modify: src/app/page.test.tsx
- Modify: src/app/(marketing)/public-routes.test.tsx

**Interfaces:**
- Consumes: homepage and demo route server-rendered markup
- Produces: assertions for the control-center hero, four gallery images, and WeChat contact

- [ ] **Step 1: Write failing homepage assertions**

Assert that the hero source contains /images/product-evidence/control-center.webp; the evidence section exposes images for AI supervisor, task pricing, image workspace, and matrix pricing; and 微信咨询 · 楠 Nay plus /images/contact/wechat-nay.webp are present.

- [ ] **Step 2: Write the failing demo assertion**

Within the demo booking section, assert that 微信咨询 · 楠 Nay and an image named 楠 Nay 的微信二维码 are visible.

- [ ] **Step 3: Run RED**

Run: npm test -- src/app/page.test.tsx "src/app/(marketing)/public-routes.test.tsx"

Expected: FAIL because the hero still uses task pricing, evidence has no screenshots, and WeChat contact does not exist.

### Task 2: Prepare Public Assets

**Files:**
- Create: public/images/product-evidence/control-center.webp
- Create: public/images/contact/wechat-nay.webp

**Interfaces:**
- Produces: 1543x1258 control-center WebP and 610x610 cropped QR WebP

- [ ] **Step 1: Convert dashboard**

Use Sharp to convert D:\Desktop\719.png to WebP quality 88 without resizing or cropping.

- [ ] **Step 2: Crop QR**

Use Sharp extract left 105, top 345, width 610, height 610, then encode WebP losslessly. This retains a quiet zone while excluding profile and location data.

- [ ] **Step 3: Verify metadata**

Confirm both assets are WebP, dashboard is 1543x1258, and QR is 610x610.

### Task 3: Implement Evidence And Contact Components

**Files:**
- Modify: src/components/home/hero.tsx
- Modify: src/components/home/product-evidence.tsx
- Create: src/components/contact/wechat-contact.tsx
- Modify: src/components/home/final-cta.tsx
- Modify: src/app/(marketing)/demo/page.tsx

**Interfaces:**
- WechatContact accepts optional className and renders the labelled QR figure.
- ProductEvidence renders four base-path-safe evidence images.
- Hero consumes control-center.webp with width 1543 and height 1258.

- [ ] **Step 1: Replace hero asset**

Use withBasePath("/images/product-evidence/control-center.webp"), width 1543, height 1258, and alt AXIO 店群运营控制台全景.

- [ ] **Step 2: Render all evidence images**

Replace the icon map with two evidence columns. Each item renders its label, detail, matching image, intrinsic dimensions, and base-path-safe source.

- [ ] **Step 3: Add WeChat contact**

Create the semantic QR figure and render it in the homepage final CTA and demo booking section.

- [ ] **Step 4: Run GREEN unit tests**

Run the two focused unit-test files. Expected: all pass.

### Task 4: Build The Wide-First Finesse Layout

**Files:**
- Modify: src/app/home.css
- Modify: src/app/(marketing)/marketing.css
- Modify: tests/e2e/home-hero.spec.ts
- Create: tests/e2e/home-evidence.spec.ts

**Interfaces:**
- Produces: wide two-column gallery, intrinsic-ratio hero, contact layouts, and browser geometry checks

- [ ] **Step 1: Write failing browser assertions**

At 2048x1024 assert the dashboard loads uncropped. At 1440x900 assert four images form two columns. At 1024x768 and 390x844 assert no overflow; mobile uses one gallery column and QR width is at least 180 pixels.

- [ ] **Step 2: Implement CSS**

Give the evidence band a maximum width near 1720 pixels, use two natural-height columns, and collapse below 900 pixels. Make hero evidence intrinsic-height. Place QR beside CTA/form content on wide screens and below on mobile.

- [ ] **Step 3: Run browser GREEN**

Run the hero and evidence Playwright specs against http://127.0.0.1:3001. Expected: geometry, image-load, theme, QR-size, and overflow checks pass.

### Task 5: Finesse Pre-Flight And Commit

**Files:**
- Modify only files required by verification findings.

**Interfaces:**
- Produces: a reviewed static-site commit with no generated artifacts staged

- [ ] **Step 1: Capture visual matrix**

Inspect 2048x1024, 1440x900, 1024x768, and 390x844 in light and dark themes for legibility, ratios, fit, QR size, and rhythm.

- [ ] **Step 2: Run repository gates**

Run npm run verify. Expected: zero errors; the known mobile-navigation warning may remain.

- [ ] **Step 3: Check diff**

Run git diff --check and git status --short. Confirm build output, screenshots, and test reports remain ignored.

- [ ] **Step 4: Commit**

Stage the two docs, two assets, contact component, homepage/demo components and CSS, plus unit and E2E tests. Commit with feat: showcase AXIO product evidence.

Expected: one focused implementation commit and a clean worktree.