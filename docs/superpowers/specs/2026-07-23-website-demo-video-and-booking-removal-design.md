# AXIO Website Demo Video And Booking Removal Design

## Goal

Publish the approved AXIO product demonstration on the public website and
remove all product-demo booking workflows. Deploy the resulting static site to
GitHub Pages at `https://njcn-axio.github.io/axio-web/`.

## Approved Approach

The 4K customer delivery file, `AXIO-销售演示-delivery.mp4`, is copied to the
website's committed public media directory and served as a same-origin static
asset. The existing `/demo` route remains public, but becomes a product-demo
watch page: it contains the full video, its existing read-only preview, and no
lead-capture or booking UI.

Every product-demo CTA in the site changes from booking language to
`观看产品演示` and links to `/demo`. No CTA will use `预约`, `预约演示`,
`预约产品演示`, or equivalent booking language.

## Scope

- Add the approved 4K delivery MP4 under `public/media/` with an ASCII filename.
- Add or update the video manifest entry consumed by `DemoVideoPlayer` so the
  website resolves the asset correctly under the GitHub Pages base path.
- Update the homepage demo band, package cards, package-comparison CTA, final
  CTA, pricing CTA, localized content, and footer to link to `/demo` using
  watch-demo copy.
- Simplify `/demo` to a watch-only page. Remove `DemoForm`, its booking layout,
  the booking WeChat contact block, and the follow-up booking CTA from that
  route. Retain the public interactive preview and the read-only core workflow.
- Delete the `/demo` booking-only component if no longer referenced, and update
  the privacy page so it does not claim that the website collects demo-booking
  information.
- Remove unused booking CSS only when it has no remaining consumer.
- Update focused component and route tests to enforce the watch-only demo
  contract and absence of booking language/form controls.

## Non-Goals

- Do not remove purchasing, licensing, or ordinary contact mechanisms.
- Do not add a visitor analytics, upload, lead capture, calendar, or external
  video-hosting integration.
- Do not alter the interactive preview's read-only safety boundary.
- Do not claim that the source screen captures were natively recorded at 4K.

## Deployment

The repository's existing GitHub Actions workflow builds and deploys `master`
to GitHub Pages. The implementation must pass the repository's static-site
verification before a commit is pushed. After the workflow completes, verify
the public route and the deployed video URL both resolve under the repository
base path.

## Acceptance Criteria

1. The public `/demo` page exposes the approved product video as a same-origin
   static asset and has usable native player controls.
2. The home, pricing, package, footer, and reusable marketing CTAs use
   `观看产品演示` linking to `/demo`.
3. The deployed public site contains no appointment form, booking QR block,
   booking submission endpoint, or booking-specific privacy statement.
4. The existing Pages build succeeds and deploys the generated `out/` directory
   to `https://njcn-axio.github.io/axio-web/`.
