# AXIO Product Evidence Gallery Design

Date: 2026-07-19
Status: Approved

## Objective

Replace the icon-only homepage evidence section with direct, complete product screenshots, use the owner-supplied control-center screenshot as hero evidence, and add a scannable WeChat contact fallback for the static website.

## Finesse Design Read

Cross-border automation brand site; industrial editorial plus real product evidence; register=brand; SOUL=6; SPECTACLE=3; DENSITY=7. Wide desktop at 1440 and 2048 pixels is the primary composition. Mobile is a clear single-column degradation.

## Existing-Page Audit And Protection

- Four approved screenshots exist, but the homepage evidence section renders only icons and text.
- The current portrait hero screenshot is too narrow to establish the product as a broad operations system.
- The static demo form can be unconfigured, leaving no direct contact path.
- Preserve the current tokens, navigation, copy order, brand orange, light/dark themes, section narrative, accessibility, and static export.

## Hero Evidence

- Convert D:\Desktop\719.png to public/images/product-evidence/control-center.webp.
- Preserve the complete 1543x1258 frame with no crop or stretch.
- Replace the current hero task-pricing image and route the new source through withBasePath().
- Render at the intrinsic ratio with explicit width and height metadata.

## Four-Image Evidence Gallery

Display all four screenshots directly:

1. supervisor.webp - AI supervisor and task orchestration.
2. task-pricing.webp - new listing task and precise pricing.
3. risk-control.webp - prohibited-brand, keyword, replacement, and style-risk controls.
4. pricing-formula.webp - transparent site-cost and target-profit calculation.

All viewports use one reading column. On 1440px and 2048px wide desktops, each image receives at least 1300 CSS pixels when its source permits and is never enlarged beyond its intrinsic width. Every image remains visible without a click, uncropped, and links to its base-path-safe original for close inspection.

Use thin semantic borders and page rhythm, not nested cards, fake browser chrome, carousel controls, invented application state, or decorative hero guide lines.

## WeChat Contact

- Crop D:\Desktop\微信二维码.png to the QR region with a sufficient white quiet zone.
- Exclude the profile header, location, and bottom instructional text.
- Save as public/images/contact/wechat-nay.webp.
- Label it visibly as 微信咨询 · 楠 Nay.
- Render it in the homepage final CTA and beside the /demo booking form.
- Treat it as a static contact method, not a fake form or account feature.

## Responsive, Theme, Accessibility, Performance

- 2048x1024 and 1440x900: screenshots use available width and remain inspectable.
- 1024x768: preserve the same direct reading order without horizontal overflow.
- 390x844: hero, four images, and QR follow one column without document overflow.
- Existing semantic variables frame screenshots in both themes; screenshot pixels are not recolored.
- Hero evidence loads eagerly. Gallery and QR images lazy-load with fixed dimensions.
- Product images use intrinsic auto height or object-fit contain and never crop.
- QR is at least 180 CSS pixels wide so phone scanning is practical.
- All images have specific Chinese alternative text.

## Acceptance Criteria

- Hero uses control-center.webp rather than task-pricing.webp.
- The evidence section contains supervisor.webp, task-pricing.webp, risk-control.webp, and pricing-formula.webp with no icon-only evidence cards.
- Homepage and /demo both expose 微信咨询 · 楠 Nay and wechat-nay.webp.
- 2048x1024, 1440x900, 1024x768, and 390x844 have no crop, overlap, or overflow.
- Light and dark visual reviews pass.
- Unit tests, Playwright regressions, static export, formatting, TypeScript, and lint complete successfully.
## 2026-07-20 Positioning And Hero Iteration

- The desktop hero is a full-viewport composition with the control-center screenshot as the dominant visual. At 2048px and 1440px widths, the rendered image must be at least 1080px and 900px wide respectively.
- The hero provides a base-path-safe full-resolution link named 全景查看 AXIO 店群运营控制台.
- Public proof copy describes Shopee 店群运营, 妙手 ERP 协同, and 自动化精准控价 instead of private store, site, or market-platform counts.
- AXIO is positioned as primarily serving Shopee and using 妙手 ERP to carry out batch execution.
- The transparent formula evidence explicitly states that site fees, exchange rates, shipping, and target profit are reverse-calculated for automated batch precision pricing.
- Risk-control and pricing-formula media use a light screenshot-matching backdrop so intrinsic-width images do not expose black side bars.
- The /solutions page uses qualitative operating stages and multi-site language instead of fixed store-count ranges.

## 2026-07-20 Operating Loop And Active Navigation

- Expand every operating stage from a short label into a title plus actionable explanation.
- Use a 3x2 process matrix on wide desktop, 2x3 at tablet width, and one column on mobile.
- Preserve real sequence numbering while removing decorative arrows that made borders appear accidental.
- Desktop and mobile navigation share one active-state component.
- Route links use `aria-current="page"`; the homepage capability anchor uses `aria-current="location"`.
- Active state persists after click, reload, and browser navigation instead of depending on hover.
- Keep the top-level demo CTA and remove the duplicate demo item from the primary nav; retain the demo link in the footer.
- Verify light/dark themes, 1440x900 and 390x844 layouts, keyboard focus restoration, and zero document overflow.
