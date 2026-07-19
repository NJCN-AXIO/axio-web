# AXIO Official Website Design

Date: 2026-07-19
Status: Historical approved plan; superseded for the static master release on 2026-07-20

> This document records the original full-stack direction. Registration, login, member-center, database, and client-launch sections are not part of the current GitHub Pages release. Use `docs/architecture.md`, `docs/operations/github-pages-deployment.md`, and `docs/operations/server-features-todo.md` as the current source of truth.

## 1. Objective

Build the public official website for AXIO 智核, a local Windows product for cross-border e-commerce store-group operations.

The website has four jobs:

1. Explain the product to cross-border sellers managing 1-200 stores, with the strongest emphasis on 10-200-store teams.
2. Convert qualified visitors through demo bookings and contact requests.
3. Support public email registration and a member center.
4. Provide the future download and browser-to-client launch entry for the local AXIO application.

The first release does not collect online payment. Pricing is presented as packages with demo or sales contact as the next action.

## 2. Product Positioning

- Brand: AXIO 智核
- Subtitle: 跨境电商店群全自动化运营系统
- Primary audience: growing cross-border teams, store-group companies, and operation agencies
- Primary CTA: 预约产品演示
- Secondary CTA: 查看产品能力
- Existing-user CTA: 登录
- Delivery model: cloud website plus local Windows client
- First-release language: Simplified Chinese, with routing and content structure prepared for English

The public promise is controlled, verifiable automation. The website must not describe AXIO as an unbounded black-box executor. High-risk writes are presented as preview, confirmation, execution, and business readback.

## 3. Brand And Visual Direction

Design Read: cross-border e-commerce automation, Shopee orange operational command center, brand register, SOUL 7, SPECTACLE 5, DENSITY 6, GSAP plus Canvas operational data flow.

### 3.1 Layout

- The browser viewport is the canvas. Do not place the site inside a centered preview card.
- Use a fixed full-width navigation bar.
- The hero occupies one full viewport and leaves a small visual hint of the next section where the viewport permits.
- Major story sections use full-width bands and near-full-screen pacing.
- A restrained right-side progress rail may appear on desktop and disappears on mobile.
- Real product screenshots are framed as product evidence, not decorative cards.

### 3.2 Theme System

The default is light mode. A user can switch to dark mode from a familiar sun/moon icon button in the navigation.

Both modes are complete theme registers. Backgrounds, surfaces, text, muted text, borders, actions, charts, and Canvas colors switch together through semantic CSS variables.

Light register:

- AXIO Mist (#F6F7F9): page background
- Control White (#FFFFFF): product surfaces
- Graphite (#1B2027): primary text
- Slate Copy (#525D69): secondary text
- Shopee Signal (#EE4D2D): brand emphasis
- Action Orange (#C43B20): accessible filled CTA surface

Dark register:

- Command Black (#08090C): page background
- Console Surface (#11141A): product surfaces
- Signal White (#EEF0F3): primary text
- Alloy Copy (#ABB2BC): secondary text
- Shopee Signal Dark (#FF6A4D): brand emphasis
- Action Orange (#C43B20): filled CTA surface

Theme behavior:

- First visit starts in light mode.
- A manual selection is persisted in local storage.
- Canvas reads live CSS variables after every theme change.
- Every theme is independently checked for contrast and visual artifacts.

### 3.3 Typography And Readability

- Font stack: system-ui, Segoe UI, PingFang SC, Microsoft YaHei, Arial, sans-serif.
- Marketing and product copy never renders below 12px.
- Body copy targets 15-17px with a readable line height.
- Large type is reserved for the true hero and major full-screen section leads.
- Letter spacing remains zero for normal text. Monospace labels are used sparingly for operational metadata.

### 3.4 Motion

- One hero Canvas engine visualizes market signals, task flow, store matrix, pricing, and risk gates.
- GSAP or an equivalent lightweight scroll system handles motivated section reveals and product screenshot focus changes.
- Motion never carries required content.
- Reduced-motion mode freezes Canvas to a composed still and disables scroll choreography.

## 4. Information Architecture

Public routes:

- `/` - homepage
- `/product` - product capability overview
- `/solutions` - solutions by team and store-group size
- `/pricing` - package comparison without online payment
- `/demo` - two-video demo center and booking form
- `/login` - sign in
- `/register` - email registration
- `/verify-email` - verification result
- `/privacy` - privacy policy
- `/terms` - service terms

Member routes:

- `/account` - account overview
- `/account/license` - authorization status
- `/account/downloads` - approved client releases
- `/account/launch` - browser-to-client launch flow
- `/account/support` - demo and support requests

The existing Flask operations interface is never exposed through the public website.

## 5. Homepage Framework

1. Fixed navigation: brand, product, solutions, capability matrix, pricing, demo, login, theme toggle, and demo CTA.
2. Full-screen hero: AXIO 智核 as H1, the approved subtitle, short value proposition, two CTAs, and a live operations visual.
3. Proof strip: 116 stores, six Shopee sites, four market-signal platforms, and controlled task monitoring.
4. Operating loop: market signals, keywords and products, tasks and pricing, preview and confirmation, script execution, and result readback.
5. Core workflow video: the completed new-task collection and publishing flow appears immediately after the operating loop as real operation evidence.
6. Real product evidence: anonymized AXIO screenshots focusing on AI Supervisor, tasks, store matrix, pricing, and risk evidence.
7. Capability system: six approved feature groups from the video script.
8. Safety and deployment: deterministic scripts, human confirmation, business readback, local client, source delivery, and private deployment.
9. Full-product demo: the reserved overview-video position appears after capability and safety context, followed by the demo-booking action.
10. Package section: Starter, Professional, and Enterprise positioning with contact-led conversion and no invented prices.
11. Final CTA and legal footer.

### 5.1 Video Narrative And States

The two videos have separate jobs and do not compete inside one side-by-side gallery.

Core workflow video:

- Public title: `核心功能：新建任务采集上架流程`.
- Source evidence is the completed 56.7-second local recording supplied by the owner.
- Homepage position is directly after the operating loop, before the broader screenshot and capability evidence.
- The player uses native controls, `playsInline`, `preload="metadata"`, no autoplay, a stable aspect-ratio shell, and `object-fit: contain` so the 1920x1044 source is never cropped or stretched.
- A dedicated WebP poster loads before video metadata. Required surrounding copy summarizes the workflow without inventing results.

Full-product overview video:

- Public title: `AXIO 全局功能演示`.
- Homepage position is after capability, safety, and deployment context, where it leads into demo booking.
- Until the final overview video exists, the reserved media region uses a real anonymized AXIO screenshot cover and a clear production state. It does not render a broken video source or a fake play button.
- The final video replaces the cover in the same stable region without changing page rhythm.

Demo route:

- `/demo` presents the full-product overview position first, the completed core workflow video second, and the booking form after the media evidence.
- Both positions use the same typed video-content registry as the homepage, so titles, status, poster, and media URL cannot drift between routes.

### 5.2 Video Responsive Behavior

- Wide desktop (`>=1200px`): each video keeps its own full-width narrative band; the player is the dominant visual and never shares a side-by-side gallery with the other video.
- Narrow desktop and tablet (`768-1199px`): copy, media, and CTA collapse to one column. Video bands use content-driven height instead of a forced full viewport so 1024x768 and other low-height laptop screens never clip native controls.
- Mobile (`<768px`): media uses the full available content width, preserves the source frame with contained letterboxing, and places title, summary, status, and CTA in a single reading order. No video label or control causes document-level horizontal scrolling.
- Video typography changes only at explicit breakpoints and never scales with viewport width. All custom actions retain 44px touch targets; native player controls remain unobstructed.
- `/demo` keeps overview, core workflow, and booking as a vertical sequence at every width. Wide screens may increase media width but do not reorder the three stages.

## 6. Public Capability Map

### 6.1 AI Supervisor And Orchestration

Current public capabilities:

- capacity, data freshness, and risk analysis with evidence
- objective decomposition into store, site, quantity, prerequisites, execution steps, and acceptance criteria
- independent scripts, AI Supervisor orchestration, and external Agent orchestration

Future capability:

- separately released controlled execution authority for each high-risk capability

### 6.2 Product Discovery And Keyword Growth

Current public capabilities:

- Shopee, Temu, TikTok, and Amazon hot-market entry points
- AI buyer-keyword and sourcing-keyword enrichment
- blue-ocean scoring and keyword health states
- order feedback, candidate pools, title learning, and reviewed keyword reuse
- four-platform concrete-product selection preview with evidence gates

The site explicitly distinguishes direction discovery from concrete product selection.

### 6.3 Natural-Language Tasks And Precise Pricing

Current public capabilities:

- natural-language task creation
- 1688, Shopee competitor, Pinduoduo, collection-box continuation, full-store collection, and exact-product sources
- editable category, discount, profit, store scope, site, grade, and review mode
- loss-leader, traffic, sales, profit, and manual target-profit controls
- automatic store matching, exact store selection, and P0/P1/P2 filtering
- one-time or batched publishing in site golden hours
- six-site precise pricing with cost, exchange rate, fees, logistics, packaging, discount, profit, and site-tail rules

### 6.4 Publishing And Existing-Listing Operations

Current public capabilities:

- multi-site publishing and store-capacity allocation
- batch repricing and completed-order loss preview
- Listing optimization and product categorization
- unsalable-listing cleanup previews with locked and engaged-product protection
- marketing combination suggestions gated by verified relationship and margin evidence

### 6.5 Image Identity And Risk Evidence

Current public capabilities:

- main-image and SKU-image preview
- deterministic 1024-square PNG output without stretching
- product and SKU identity binding, input hashes, order checks, and batch blocking
- brand, dangerous-word, style, and image-risk checks
- preview, confirmation, execution ownership, and independent readback concepts

Future capabilities:

- AI marketing scene images
- production platform image writeback when separately released

### 6.6 Matrix Operations And Private Delivery

Current public capabilities:

- G1/G2 separation and six-site operations
- 116-store matrix evidence
- local Windows client
- source delivery and private deployment

Future capability:

- website launch of the installed AXIO client

Public pages label current and future capabilities clearly. Sensitive accounts, API keys, signatures, store legal entities, and complete product details are never shown.

## 7. Technical Architecture

### 7.1 Web Application

- Next.js App Router with TypeScript
- server-rendered marketing routes for SEO
- client components only for theme switching, Canvas, forms, and authenticated interactions
- semantic CSS variables and scoped CSS for the design system
- Chinese content as the default locale, with locale-aware routing prepared for English

### 7.2 Cloud Services

- PostgreSQL for account, verification, demo request, license, and client release records
- Prisma for typed database access and migrations
- Auth.js for credentials-based sign-in and signed JWT sessions
- standard SMTP transport configured by environment variables for verification and notifications
- S3-compatible object storage with stable HTTPS URLs for screenshots, video, and client installers

### 7.3 Local Client Boundary

- The website never receives platform credentials or local browser profiles.
- The installed client continues to execute automation in the customer's Windows environment.
- Future launch uses `axio://launch?code=<one-time-code>`.
- The code expires quickly, is single-use, and contains no license, email, credential, or platform secret.
- If the protocol handler is unavailable, the member center falls back to the approved installer download.

## 8. Core Data Model

- User: id, email, password hash, email verification time, locale, theme preference metadata, created time
- Session: encrypted, HTTP-only Auth.js JWT cookie with bounded expiry; no Session table in V1
- EmailVerificationToken: hashed token, user, expiry, used time
- DemoRequest: user or visitor identity, company, store count band, contact preference, message, status, created time
- License: user, product edition, status, seats or store band, issue time, expiry
- ClientRelease: version, platform, installer URL, checksum, release notes, minimum supported version, published state
- LaunchCode: hashed one-time code, user, license, release, expiry, used time

No table stores Shopee, Miaoshou, 1688, marketplace, browser-profile, or AI-provider credentials.

## 9. Registration And Member Flows

Registration:

1. User submits email and password.
2. Server normalizes the email, rate-limits the request, hashes the password, and creates an unverified account.
3. Server sends a single-use verification link.
4. Verification marks the account verified and invalidates the token.
5. User signs in and reaches the member center.

Member center:

1. Account overview shows verification and license state.
2. Downloads lists only published and authorized client releases.
3. Launch requests create a short-lived single-use code.
4. Browser invokes the local protocol or shows the installer fallback.
5. Demo and support requests remain visible to the user.

## 10. Error Handling And Security

- Registration returns non-enumerating responses for existing and unknown emails.
- Passwords use an established adaptive hash implementation.
- Verification and launch tokens are stored hashed, expire, and are single-use.
- Authentication, registration, verification, demo, and launch routes are rate-limited.
- Forms use server-side schema validation and safe error messages.
- Sessions use secure, HTTP-only, same-site cookies in production.
- State-changing requests enforce CSRF protection through the selected session framework.
- Demo submission succeeds independently of optional notification-email delivery; failed notifications are logged for retry without duplicating the request.
- Expired verification links offer a bounded resend path.
- Missing or inactive licenses block downloads and launch with a contact-support action.
- A failed deep-link launch never loops automatically.
- The website does not proxy into the local Flask service.

## 11. Accessibility, Responsive Behavior, And Performance

- WCAG AA contrast is verified separately in light and dark modes.
- All interactive elements have visible keyboard focus and labels.
- Touch targets are at least 44px.
- Text is at least 12px, with normal marketing copy at least 15px.
- Product tables scroll inside bounded shells on narrow screens.
- Multi-column sections collapse to a single-column reading order on mobile.
- Canvas caps device pixel ratio, pauses off-screen, and freezes for reduced motion.
- Images use AVIF/WebP where practical, responsive sizing, fixed dimensions, and lazy loading.
- Videos never autoplay, use metadata-only preload, reserve their intrinsic aspect ratio before loading, and use poster images to avoid layout shifts.
- Responsive verification includes wide desktop at 1440x900, narrow desktop at 1024x768, and mobile at 390x844.
- The initial page remains readable with JavaScript disabled; interactive enhancements degrade gracefully.
- Target CLS is below 0.1.

## 12. Testing Strategy

Unit tests:

- theme selection and persistence
- registration validation and email normalization
- verification and launch-code expiry and single-use behavior
- license authorization rules
- demo request validation

Integration tests:

- registration through verified login
- duplicate registration privacy behavior
- demo request persistence when notification delivery fails
- authorized and unauthorized download access
- launch-code creation, exchange, expiry, and replay rejection

Playwright tests:

- homepage, registration, login, member center, and demo flow
- wide-desktop, narrow-desktop, and mobile viewports
- light default and dark-mode toggle
- no visible text below 12px
- no horizontal document overflow or overlapping text
- keyboard navigation and focus visibility
- reduced-motion terminal state
- nonblank Canvas pixel variance and correct theme recoloring
- completed core-workflow video metadata loads without autoplay, preserves the source frame, and exposes native controls
- pending overview-video position renders its real screenshot cover without a broken media request or fake play control
- homepage and `/demo` consume identical video titles, statuses, posters, and media URLs
- video bands do not clip controls or create document overflow at 1440x900, 1024x768, or 390x844

Static checks:

- TypeScript, lint, formatting, and production build
- broken internal links
- metadata and structured-data presence
- accidental secrets and sensitive product data

## 13. Content And Assets

- Use anonymized screenshots from the existing AXIO product.
- Hide shop names, account identifiers, orders, margins, credentials, signatures, and complete product records.
- Use the approved video script as the source for feature claims and section order.
- The private source path `D:\文件传输助手\lv_0_20260703211804.mp4` is an ingestion input only and never appears in public code, HTML, metadata, logs, or URLs.
- Encode the completed core workflow recording as `public/videos/axio-core-task-workflow.mp4`: 1280x696, H.264, yuv420p, AAC audio, original frame preserved, and MP4 faststart enabled. Do not crop or stretch it.
- Generate `public/images/video-posters/axio-core-task-workflow.webp` from a representative safe frame after checking it for account, store, order, margin, credential, and signature exposure.
- Until the final overview video exists, use a real anonymized AXIO screenshot as `public/images/video-posters/axio-overview-cover.webp`; the cover is not presented as a playable video.
- If the completed core video contains meaningful speech, publish synchronized Simplified Chinese WebVTT captions before production. If it has no meaningful speech, provide a nearby textual workflow summary and do not add an empty caption track.
- Production may move video binaries to the configured S3-compatible origin; the typed content registry changes the stable HTTPS URL without changing components.
- Use AXIO 智核 as a wordmark for the first release. A future logo can replace the wordmark without changing layout.
- Do not publish fake precision metrics, invented testimonials, or invented prices.

## 14. Release Scope

First implementation milestone:

- full public marketing site
- responsive light and dark modes
- anonymized product evidence slots
- completed core workflow video plus the reserved full-product overview position
- demo booking form
- email registration, verification, login, and member center
- license, download, and future launch-entry UI
- Chinese content and English-ready routing

Explicitly deferred:

- online payment
- cloud execution of AXIO tasks
- storage of marketplace credentials
- production deep-link exchange with an unreleased client
- production AI marketing images and platform image writeback
- complete English translation

## 15. Git Workflow

`D:\Desktop\AXIO web` is an independent Git repository.

Automatic atomic commits are required after:

1. approved design specification
2. project scaffold and quality gates
3. public marketing pages
4. registration and verification
5. member center, license, downloads, and launch entry
6. final accessibility, responsive, and production verification

Generated previews, secrets, build output, test reports, and dependencies are ignored. The product repository at `D:\shopee-auto-lister` is never modified or committed as part of website work.

## 16. Acceptance Criteria

- The homepage is full-screen and follows the approved reference layout language without copying its content or branding.
- AXIO 智核 is the H1 and the approved subtitle is visible in the first viewport.
- Light mode is the first-visit default; dark mode switches the complete theme and persists.
- The six approved feature groups from the demo script appear with current and future boundaries.
- 116 stores, six Shopee sites, and four signal platforms are presented as real, anonymized proof.
- The completed core workflow video appears after the operating loop, loads only metadata before user action, uses native controls, and is not cropped or stretched.
- The pending full-product overview position appears after capability and safety context and never produces a broken media request or fake play state.
- `/demo` presents the overview position first, the core workflow video second, and the booking form after both.
- Both video positions remain usable without clipped controls, overlapping copy, or document overflow on wide desktop, narrow desktop, and mobile viewports.
- Email registration, verification, login, and member center work end to end in a configured environment.
- Demo requests persist without online payment.
- The website stores no platform credentials and exposes no local Flask route.
- Wide-desktop, narrow-desktop, and mobile Playwright checks pass without overlap, overflow, blank Canvas, clipped video controls, console errors, or unreadable text.
- Every implementation milestone is committed automatically to the independent website repository.
