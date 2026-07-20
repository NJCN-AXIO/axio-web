# AXIO Public Product Preview Design

**Date:** 2026-07-20
**Status:** Approved for implementation planning
**Website repository:** `D:/Desktop/AXIO web`
**Product source repository:** `D:/shopee-auto-lister`

## Goal

Add a public, interactive AXIO product preview to the existing official website without redesigning the website or exposing the production application. The preview must be deployable with the website's existing static GitHub Pages build.

## Context

The existing static package at `D:/shopee-auto-lister/ui-preview` was created at commit `51e5af4` on 2026-07-09. It predates major product work including the selection workspace, precise-pricing shadow approval, supervisor authority modes, multi-platform New Task sources, image processing, and controlled write workflows.

The current product source is `D:/shopee-auto-lister` on `master`. The implementation baseline is the committed product state at `aa70853`; runtime-modified or untracked files are not preview inputs. The public preview must therefore be newly derived from the current committed product UI and terminology and must not be implemented as incremental patches to the old preview package.

## Placement

The official website remains structurally unchanged.

- Keep the homepage, global navigation, pricing pages, and existing visual system intact.
- Use the existing `/demo/` page as the sole marketing entry point.
- Replace the pending full-product-demo position on `/demo/` with a concise interactive-preview introduction and an `Enter interactive preview` action.
- Open the preview at `/preview/` as a full-page experience rather than embedding the application UI in an iframe inside the marketing page.
- Preserve the existing recorded core-workflow video, booking form, WeChat contact, and conversion content on `/demo/`.

## Preview Scope

The public preview is a curated product tour, not a full clone of the production application.

Include these representative workspaces:

1. Operations dashboard and supervised operating plan.
2. Product selection and evidence-backed candidate review.
3. New Task setup with a simulated controlled workflow.
4. Precise-pricing calculation and shadow comparison.
5. Smart Optimization, including image-preview states without uploads.
6. Risk controls and execution confirmation/readback.

Exclude these production or internal surfaces:

- AI provider configuration, base URLs, API keys, health routing, and usage details.
- License import, signing, operator-console, and device-bound activation flows.
- Real store lists, merchant identities, account counts, capacity evidence, credentials, cookies, browser profiles, and operational history.
- Real task IDs, product IDs, SKU IDs, URLs, prices, order data, source evidence, and runtime logs.
- Live write actions, uploads, external network calls, backend endpoints, and browser automation.

## Interaction Model

The preview uses deterministic, in-memory fixtures. It performs no persistence beyond optional page-local UI state and makes no network request for product behavior.

- Navigation between included workspaces remains interactive.
- Important buttons advance a predefined demonstration state, such as `draft -> preview -> confirmed -> verified`.
- Actions that would mutate a real system display a clear simulated result and never call a backend.
- A persistent, restrained notice identifies the environment as a public preview that is not connected to stores.
- A slim AXIO preview bar provides `Back to AXIO website` and `Book a real demo` actions.
- Direct visits to `/preview/` start at the preview dashboard and require no prior state.

## Data And Safety

All preview data is purpose-built and fictional. Production data must never be copied and then redacted.

- Use invented store names, products, sites, quantities, prices, task identities, and timestamps.
- Avoid claims tied to internal fleet size or unverified performance outcomes.
- Do not include source configuration files, databases, JSONL history, screenshots containing real identities, environment files, or generated runtime artifacts.
- The preview contains no form fields that resemble secret or credential collection.
- Add an automated scan that fails on `/api/`, credential terminology, known provider hosts, real merchant identifiers, and other prohibited strings.
- Add a browser assertion that preview interactions issue no fetch, XHR, WebSocket, beacon, or form-submission requests.

## Static Architecture

The website remains the deployment owner.

- Store the generated public preview under the website repository so `next build` copies it into the static export.
- Serve it at the relative, trailing-slash-safe `/preview/` path.
- Use only relative preview asset paths so the existing `NEXT_PUBLIC_BASE_PATH` GitHub Pages configuration continues to work under a repository subpath.
- Keep preview styles and scripts isolated from the website's Next.js styles and runtime.
- Do not add a second hosting service, API, database, authentication layer, or deployment pipeline.

The product repository remains the source of truth for product terminology and visible workflow structure. The website repository owns only the reviewed public artifact and its marketing entry point. Updating the production product does not automatically publish a new preview; preview refreshes are deliberate, reviewed releases.

## Responsive Behavior

Desktop and tablet receive the complete interactive workspace. The preview must not shrink a desktop application into unreadable controls.

- At narrow widths, use a compact navigation drawer and single-column summaries.
- Dense tables may use bounded horizontal scrolling within their own workspace.
- Hide nonessential secondary columns before reducing type size.
- Preserve stable button, toolbar, and status dimensions.
- No page-level horizontal overflow or nested viewport scrolling is permitted.

## Failure Behavior

Because the preview is static, missing or invalid fixture data must fail visibly and locally.

- Show a bounded `Preview data unavailable` state instead of blank content.
- Disable the affected simulated action and keep navigation usable.
- Never fall back to a production endpoint.
- Direct and refreshed routes must resolve correctly under the configured GitHub Pages base path.

## Verification

Implementation is complete only when all of the following pass:

1. Existing website unit, component, lint, type, format, and static-build checks remain green.
2. Existing public pages and navigation retain their current structure and conversion actions.
3. `/demo/` exposes the preview entry while retaining the core video and booking sections.
4. `/preview/` works from a clean static export with and without a repository base path.
5. Desktop and mobile Playwright checks cover navigation, the simulated workflow, return-to-site actions, overflow, and text fitting.
6. Network interception proves that the preview performs no product network calls.
7. A prohibited-content scan proves that no production identifiers, provider endpoints, secrets, or backend routes are shipped.
8. The final Git worktree contains only reviewed website and preview-source changes, not runtime data copied from the product repository.

## Non-Goals

- Redesigning the official website.
- Hosting or exposing the production AXIO application.
- Reproducing every production page or edge case.
- Providing real authentication, persistence, uploads, AI calls, ERP access, or platform writes.
- Automatically syncing every product commit into the public preview.

## Release Boundary

The first release is one curated, static preview shipped with the website. Future product updates may refresh it through the same deliberate extraction, fixture, safety-scan, and review process. This keeps the public demo credible without coupling website availability to the production system.
