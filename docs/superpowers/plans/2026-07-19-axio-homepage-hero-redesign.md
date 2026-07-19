# AXIO Homepage Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage wireframe hero with a compact, responsive first viewport led by a real AXIO task-pricing interface.

**Architecture:** Keep the redesign inside the existing `Hero` component and homepage stylesheet. The server-rendered component uses Next Image with a static public asset; Playwright covers geometry that DOM unit tests cannot verify.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS, Vitest Testing Library, Playwright

## Global Constraints

- Preserve static `output: "export"` deployment and GitHub Pages base-path support.
- Add no server, database, API, authentication, or runtime dependency.
- Preserve the approved Chinese copy and both CTA destinations.
- Use `task-pricing.webp` uncropped with its intrinsic 1600x1823 ratio.
- Preserve light/dark themes, reduced motion, keyboard access, and no-JavaScript readability.

## File Map

- `src/components/home/hero.tsx`: owns semantic hero content and the real product evidence image.
- `src/app/home.css`: owns wide, tablet, low-height, and mobile hero composition.
- `src/app/page.test.tsx`: protects server-rendered hero identity and evidence structure.
- `tests/e2e/home-hero.spec.ts`: protects wide and mobile geometry in a real browser.
- `playwright.config.ts`: accepts an external preview URL so tests never attach to an unrelated local server.

---

### Task 1: Lock The Product-Led Component Contract

**Files:**
- Modify: `src/app/page.test.tsx`
- Modify: `src/components/home/hero.tsx`

**Interfaces:**
- Consumes: `getSiteContent().hero` and `/images/product-evidence/task-pricing.webp`
- Produces: `data-testid="hero-product-evidence"` on the first-viewport image

- [ ] **Step 1: Write the failing unit assertions**

Add assertions that the hero contains an image named `AXIO 新建上架任务与精准定价工作台`, uses `/images/product-evidence/task-pricing.webp`, and contains no mocked Canvas.

- [ ] **Step 2: Run the focused unit test and verify RED**

Run: `npm test -- src/app/page.test.tsx`

Expected: FAIL because the image is absent and the Canvas is still rendered.

- [ ] **Step 3: Replace the operations visualization**

Remove the `OperationsCanvas` import and markup. Add a semantic `figure` containing `Image` with width `1600`, height `1823`, `priority`, `sizes="(max-width: 960px) 100vw, 46vw"`, the approved alt text, and `data-testid="hero-product-evidence"`. Keep copy and links unchanged.

- [ ] **Step 4: Run the focused unit test and verify GREEN**

Run: `npm test -- src/app/page.test.tsx`

Expected: both homepage tests pass.

### Task 2: Make First-Viewport Geometry Verifiable

**Files:**
- Create: `tests/e2e/home-hero.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `src/app/home.css`

**Interfaces:**
- Consumes: `PLAYWRIGHT_BASE_URL` when a known preview already exists
- Produces: browser checks for H1 position, next-band visibility, loaded evidence, and overflow

- [ ] **Step 1: Write the failing browser regression**

At `2048x1024`, assert the image natural width is nonzero, the H1 top divided by viewport height is below `0.32`, the proof strip top is below viewport height, and `scrollWidth <= clientWidth`. At `390x844`, assert the same image is visible, both CTA links meet 44px height, and the document has no horizontal overflow.

- [ ] **Step 2: Run the browser regression and verify RED**

Run: `$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3001'; npx playwright test tests/e2e/home-hero.spec.ts --project=desktop-chromium`

Expected: FAIL because the old hero has no evidence image and centers the H1 too low.

- [ ] **Step 3: Implement the responsive composition**

Set the hero to content-led height, use a maximum inner width near 1400px, align the two-column grid to the start, and size the product frame with a stable maximum height. Replace Canvas and operations-list rules with evidence-frame, evidence-image, and status-caption rules. At `max-width: 960px` collapse to one column; at `max-width: 767px` use compact spacing and full-width CTAs; add a low-height desktop query so content is never vertically centered off-screen.

- [ ] **Step 4: Run unit and browser tests and verify GREEN**

Run: `npm test -- src/app/page.test.tsx`

Run: `$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3001'; npx playwright test tests/e2e/home-hero.spec.ts --project=desktop-chromium`

Expected: all focused assertions pass.

### Task 3: Verify Themes, Static Export, And Quality Gates

**Files:**
- Modify only files required to fix findings from this verification.

**Interfaces:**
- Consumes: existing theme toggle, build scripts, and local preview
- Produces: a reviewable committed redesign with no regressions

- [ ] **Step 1: Capture the responsive matrix**

Capture light and dark screenshots at `2048x1024`, `1440x900`, `1024x768`, and `390x844`. Check product-image loading, first-viewport hierarchy, next-band hint where height permits, text fit, focus visibility, and document overflow.

- [ ] **Step 2: Run all repository gates**

Run: `npm run verify`

Expected: lint, typecheck, formatting, unit tests, and static production build pass.
