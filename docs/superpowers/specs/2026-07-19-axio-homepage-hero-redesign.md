# AXIO Homepage Hero Redesign

Date: 2026-07-19
Status: Approved

## Objective

Replace the wide-screen homepage hero that reads as an unfinished wireframe with a compact, product-led first viewport. The redesign must make AXIO look like a working cross-border operations product while preserving the approved copy, calls to action, themes, accessibility, and GitHub Pages static deployment.

## Design Read

AXIO is a B2B operations product for cross-border sellers. The hero uses a restrained industrial-editorial language: strong type, precise rules, real operational evidence, and Shopee orange only where attention or action is required.

Design dials:

- Design variance: 6/10
- Motion: 4/10
- Information density: 5/10

## Composition

### Wide desktop

- Use a centered content width near 1400px rather than stretching content to 1600px.
- Use an asymmetric two-column grid: concise product promise on the left and a real AXIO task workspace on the right.
- Place the H1 in the upper third of the viewport. At 2048x1024 its top must be below 32% of viewport height.
- Keep the hero shorter than the viewport where height permits so the proof strip is visibly entering the first viewport.
- Remove the full-viewport operations Canvas and diagnostic lane labels from the hero.

### Narrow desktop and tablet

- Keep two columns while both columns remain readable, then collapse to one column below 960px.
- Let content determine height on low-height screens. Do not vertically center a tall stack inside 100svh.
- Preserve the complete product screenshot without cropping.

### Mobile

- Present copy, actions, then product evidence in one reading order.
- Keep both calls to action at full available width and at least 44px high.
- Bound the evidence frame to the viewport and prevent document-level horizontal overflow.

## Product Evidence

Use `public/images/product-evidence/task-pricing.webp` as the primary hero visual. It is the strongest safe artifact because it shows the real new-listing task workflow and pricing controls without an empty workspace or error state.

The screenshot must:

- use its intrinsic 1600x1823 aspect ratio;
- render with fixed width and height metadata to avoid layout shift;
- use `object-fit: contain` and never crop;
- have meaningful Chinese alternative text;
- load eagerly because it is first-viewport content;
- sit in a genuine product frame, not a decorative marketing card.

## Visual System

- Preserve semantic theme variables for complete light and dark support.
- Use a subtle grid or rule texture in CSS only as secondary structure, never as the main visual.
- Keep orange concentrated in the primary CTA, active status, and one structural rule.
- Use stable dimensions and explicit breakpoints; do not scale font size continuously with viewport width.
- Avoid gradients, decorative blobs, excessive shadows, nested cards, and fake application controls.

## Motion And Accessibility

- Existing reveal motion may enhance the copy and product frame but cannot carry required information.
- Reduced-motion behavior remains governed by the existing reveal controller.
