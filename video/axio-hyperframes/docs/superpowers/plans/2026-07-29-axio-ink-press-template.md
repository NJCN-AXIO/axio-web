# AXIO Ink Press Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing AXIO V2 website and WeChat compositions with the validated video-shotcraft Ink Press grammar, real read-only AXIO page captures, independent landscape/portrait framing, natural Chinese narration, beat-synced sound, and four production deliverables.

**Architecture:** Keep the existing Remotion project, V2 composition IDs, render commands, Edge TTS generator, and technical verifier as the single production path. Replace the V2 hand-built slide scenes with one shared Ink Press component layer, a timeline contract containing separate visual shots and narration cues, and real 2x/4x captures produced by an expanded version of the existing GET-only capture script. Landscape and portrait consume the same product facts and shared motion primitives but have separate shot components and camera keys.

**Tech Stack:** TypeScript 5.9, React 19, Remotion 4.0.499, Vitest 3.2, Playwright, Sharp, Edge TTS (`zh-CN-YunxiNeural`), FFmpeg/FFprobe, Mixkit-licensed audio from video-shotcraft.

## Superseded Work

This plan is the only implementation plan for the new visual direction. Do not execute either of these documents:

- `docs/superpowers/specs/2026-07-29-axio-cinematic-ui-rebuild-design.md`
- `docs/superpowers/plans/2026-07-29-axio-cinematic-ui-rebuild.md`

The approved source of truth is `docs/superpowers/specs/2026-07-29-axio-ink-press-template-design.md`.

## Global Constraints

- Website: exactly `1530` frames, `3840x2160`, `30 fps`, about `51s`.
- WeChat: exactly `1170` frames, `1080x1920`, `30 fps`, independent portrait composition.
- Preserve composition IDs `AXIO-Website-V2-4K` and `AXIO-WeChat-V2-Vertical`.
- Do not overwrite `out/AXIO-website-v2-4k.mp4` or `out/AXIO-wechat-v2-vertical.mp4` before the final render task.
- Deliver BGM plus narration plus SFX, and no-BGM variants that retain narration and SFX, for both formats.
- Use `zh-CN-YunxiNeural` at the already approved slightly fast commercial pace; do not use MiniMax.
- Use real AXIO pages as 2x textures, 4x key-element cutouts, empty plates, and `layout.json`; do not shrink full pages into `objectFit: contain` frames.
- Capture only loopback pages with GET requests and DOM navigation. Keep `platformWrite=false`; do not submit, confirm, execute, publish, or upload anything.
- AI 主管 is the only formal task dispatcher. ACCIO 超级主管 supervises authority, risk, correction, memory, and audit and is not a second dispatcher.
- G1/G2 are deterministic executors dispatched by AI 主管; their independent result readback is supervised by ACCIO 超级主管.
- `116 家店 / 6 个站点 / 2 个租户` is founder operating background, never product capacity.
- Current execution remains `released=0` and `unattended=0`. Future capability must always show `规划能力 / 尚未开放`.
- `已验证` may appear only after authoritative result readback. Remove all unverified free-trial copy.
- End the website film with `这就是 AXIO。让每一次经营决策，都有计划、有边界、有回读。`
- End the WeChat film with `这就是 AXIO。有计划，有边界，有回读。`
- Use AXIO colors `#EE4D2D`, `#111111`, `#F4F6F9`, `#FFFFFF`, `#65758B`, and `#0D7657`; do not import the template's amber paper skin.
- Chinese headings use the product's sans-serif family, bold weight, and `letterSpacing: 0`.
- Title cards hold at least `30f`; batch animation settles for at least `15f`; the final brand holds at least `30f`.
- No `Date.now()` or `Math.random()`. All pseudo-random layout is deterministic from stable indices.
- Preserve all existing uncommitted work. Stage only paths named by the current task. Every shell command starts with `rtk`.

## File Map

- `src/v2/types.ts`: timeline, shot, narration cue, recipe, and film-prop contracts.
- `src/v2/timeline.ts`: the only source of frame ranges, copy, camera-independent shot identity, and narration windows.
- `src/v2/copy.ts`: role, capability, status, founder-background, and closing-copy constants.
- `src/v2/ink/PageCam.tsx`: adapted layout-scale 2.5D camera copied from the exact Ink Press template implementation.
- `src/v2/ink/InkPrimitives.tsx`: adapted title card, flash cut, caption, digit roll, brand open, and outro primitives.
- `src/v2/ink/audio.tsx`: BGM gate and absolute-frame SFX sequences shared by both films.
- `src/v2/ink/live-layout.json`: capture-produced page and element coordinates.
- `src/v2/ink/WebsiteShots.tsx`: landscape-only camera keys and shot rendering.
- `src/v2/ink/WechatShots.tsx`: portrait-only crops, camera keys, and shot rendering.
- `src/v2/WebsiteV2.tsx`, `src/v2/WechatV2.tsx`: thin composition assemblers over the shared timeline/audio and format-specific shots.
- `scripts/capture-evidence.mjs`: existing GET-only capture path expanded to 2x pages, 4x cutouts, empty plates, layout JSON, and a safety manifest.
- `scripts/generate-v2-audio.ps1`: approved voice, new narration clips, BGM preparation, and duration checks.
- `scripts/analyze-v2-beats.mjs`: reproducible beat-grid and cut-error report for the selected BGM.
- `scripts/render-v2-stills.mjs`: required ingress/peak/settled stills and contact sheets.
- `scripts/verify-v2-renders.mjs`: four-file decode, metadata, loudness, nonblank-frame, faststart, duration, and platform-write verification.
- `public/evidence/ink/`: real AXIO full-page textures, empty plates, 4x cutouts, manifest, and contact-sheet inputs.
- `public/audio/v2/sfx/`: only selected, source-traceable Mixkit SFX.
- `public/audio/v2/house-vibez.mp3`: Mixkit `House Vibez`, Lily J, about 123 BPM, with the source URL retained in attribution.
- `public/audio/v2/ATTRIBUTION.md`: copied source names, URLs, licenses, and exact files used.
- `props-nobgm.json`: `{ "bgm": false }` for no-BGM renders.

---

### Task 1: Lock the New Timeline, Copy, and Capability Contract

**Files:**
- Modify: `src/v2/types.ts`
- Modify: `src/v2/timeline.ts`
- Modify: `src/v2/copy.ts`
- Modify: `tests/v2-timeline.test.ts`
- Modify: `tests/v2-film.test.ts`
- Modify: `tests/v2-continuous-operations-narration.test.ts`

**Interfaces:**
- Produces: `V2Shot`, `NarrationCue`, `V2Timeline`, `V2FilmProps`, `websiteV2`, and `wechatV2`.
- Produces: exact shot IDs consumed by both shot renderers and exact narration cue IDs consumed by the audio generator.

- [ ] **Step 1: Write the failing timeline and copy tests**

Replace the old nine-beat/five-beat assertions with the exact approved frame table:

```ts
expect(websiteV2.frames).toBe(1530);
expect(websiteV2.shots.map(({id, from, duration}) => ({id, from, duration}))).toEqual([
  {id: 'open', from: 0, duration: 210},
  {id: 'goal-title', from: 210, duration: 54},
  {id: 'plan-deal', from: 264, duration: 180},
  {id: 'pricing-detail', from: 444, duration: 96},
  {id: 'governance-title', from: 540, duration: 54},
  {id: 'governance-stack', from: 594, duration: 120},
  {id: 'authority-map', from: 714, duration: 120},
  {id: 'readback-title', from: 834, duration: 54},
  {id: 'readback', from: 888, duration: 120},
  {id: 'control-title', from: 1008, duration: 54},
  {id: 'capability', from: 1062, duration: 138},
  {id: 'founder-proof', from: 1200, duration: 60},
  {id: 'outro', from: 1260, duration: 270},
]);

expect(wechatV2.frames).toBe(1170);
expect(wechatV2.shots.map(({id, from, duration}) => ({id, from, duration}))).toEqual([
  {id: 'open', from: 0, duration: 180},
  {id: 'goal-title', from: 180, duration: 45},
  {id: 'plan-deal', from: 225, duration: 165},
  {id: 'pricing-detail', from: 390, duration: 90},
  {id: 'governance-title', from: 480, duration: 45},
  {id: 'governance', from: 525, duration: 135},
  {id: 'readback-title', from: 660, duration: 45},
  {id: 'readback', from: 705, duration: 135},
  {id: 'control-title', from: 840, duration: 45},
  {id: 'capability', from: 885, duration: 135},
  {id: 'outro', from: 1020, duration: 150},
]);
```

Add assertions that the combined visible and spoken copy contains the two approved role names and closing lines, labels founder metrics as background, contains `released=0`, `unattended=0`, and `规划能力 / 尚未开放`, and excludes `前 50 位`, `免费试用 7 天`, `无人值守`, and any `已验证` cue that starts before the readback shot.

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `rtk npm test -- tests/v2-timeline.test.ts tests/v2-film.test.ts tests/v2-continuous-operations-narration.test.ts`

Expected: FAIL because the old timeline is `2640/1500` frames, uses `scenes`, and still carries superseded trial/future copy.

- [ ] **Step 3: Implement the timeline types and single source of truth**

Use this contract:

```ts
export type InkRecipe =
  | 'brand-ink-open'
  | 'spotlight-hero-card'
  | 'paper-title-card'
  | 'deck-deal-flyin'
  | 'type-and-filter'
  | 'row-embed'
  | 'list-stack-press'
  | 'document-typewriter-reveal'
  | 'digit-roll'
  | 'outro-group-photo-launch';

export type V2Shot = {
  id: string;
  from: number;
  duration: number;
  recipe: InkRecipe | readonly InkRecipe[];
  headline: string;
};

export type NarrationCue = {
  id: string;
  from: number;
  duration: number;
  text: string;
};

export type V2Timeline = {
  frames: number;
  layout: 'landscape' | 'portrait-independent';
  shots: readonly V2Shot[];
  narration: readonly NarrationCue[];
};

export type V2FilmProps = {bgm?: boolean};
```

Store shot boundaries exactly once in `timeline.ts`. Separate narration cues from visual shots so a sentence can cross a title-card boundary without audio truncation. Each cue must end no later than its declared `from + duration`, and the last website cue must contain the full approved closing sentence.

- [ ] **Step 4: Run the focused tests**

Run: `rtk npm test -- tests/v2-timeline.test.ts tests/v2-film.test.ts tests/v2-continuous-operations-narration.test.ts`

Expected: PASS with `1530` website frames, `1170` WeChat frames, no free-trial claim, and no role/capability boundary violation.

- [ ] **Step 5: Commit only the contract files**

```powershell
rtk git add src/v2/types.ts src/v2/timeline.ts src/v2/copy.ts tests/v2-timeline.test.ts tests/v2-film.test.ts tests/v2-continuous-operations-narration.test.ts
rtk git commit -m "test(video): lock AXIO Ink Press timeline contract"
```

### Task 2: Upgrade the Proven Read-Only Capture Path

**Files:**
- Modify: `scripts/capture-evidence.mjs`
- Create: `tests/v2-capture.test.ts`
- Create: `src/v2/ink/live-layout.json` through the capture script
- Create: `public/evidence/ink/capture-manifest.json` through the capture script
- Modify: `package.json`

**Interfaces:**
- Consumes: loopback AXIO service, normally `http://127.0.0.1:8080`.
- Produces: `captureAxioInkAssets({baseUrl, outputDir, layoutPath}) -> Promise<CaptureManifest>`.
- Produces: full-page PNGs, empty plates, cutout PNGs, `{x,y,w,h}` coordinates, page heights, SHA-256 hashes, and `platform_write: false`.

- [ ] **Step 1: Write failing capture safety and artifact tests**

Assert that the exported URL validator accepts only `http://127.0.0.1:<port>/`, every routed non-GET request is aborted and recorded, cross-origin requests are aborted, the manifest has `platform_write: false`, and the capture configuration contains these pages:

```ts
expect(CAPTURE_PAGES.map(({name, path}) => [name, path])).toEqual([
  ['dashboard', '/'],
  ['supervisor', '/'],
  ['accio-overview', '/accio'],
  ['accio-governance', '/accio?view=supervisor'],
  ['accio-capabilities', '/accio?view=capabilities'],
  ['matrix-pricing', '/static/116shop_dashboard.html'],
]);
```

Assert `deviceScaleFactor: 2`, a second `deviceScaleFactor: 4` context for close-ups, full-page screenshots, empty plates, and `layout.json` entries containing `pageH`, `boxes`, and `cutouts`.

- [ ] **Step 2: Run the capture test and verify it fails**

Run: `rtk npm test -- tests/v2-capture.test.ts`

Expected: FAIL because the current script captures seven framed WebP units from a hard-coded preview port and does not produce Ink Press texture/cutout/layout artifacts.

- [ ] **Step 3: Refactor the existing script instead of adding a parallel capturer**

Keep the current Playwright route gate and expand it. Export pure helpers before the CLI block:

```js
export const assertLoopbackBaseUrl = (value) => {
  const url = new URL(value);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') {
    throw new Error('Capture base must be exact IPv4 loopback HTTP');
  }
  return url;
};

export const CAPTURE_PAGES = [
  {name: 'dashboard', path: '/', activate: '[data-page="dashboard"]'},
  {name: 'supervisor', path: '/', activate: '[data-page="supervisor"]'},
  {name: 'accio-overview', path: '/accio'},
  {name: 'accio-governance', path: '/accio?view=supervisor'},
  {name: 'accio-capabilities', path: '/accio?view=capabilities'},
  {name: 'matrix-pricing', path: '/static/116shop_dashboard.html', activate: '#tabPricing'},
];
```

DOM activation may click only local navigation/tab controls and must wait for the requested panel to become visible. It must never click submit, confirm, execute, release, publish, or task-run controls. Freeze inputs and selectors to approved fictional or redacted display values before screenshots. Capture full pages at 2x; capture goal cards, task rows, pricing rows, authority rows, readback rows, metric cards, and capability-state labels at 4x; hide those same nodes to produce empty plates. Write exact element coordinates in the full-page CSS coordinate system.

Before writing the manifest, scan HTML text and screenshot OCR sidecar text for credential labels, customer names, internal paths, real order identifiers, and tenant-private values. Fail closed when any forbidden pattern is present. Record all attempted writes and require the array to remain empty.

- [ ] **Step 4: Use the existing server without taking over a user process**

Run: `rtk powershell -NoProfile -Command "Invoke-WebRequest 'http://127.0.0.1:8080/api/health' -UseBasicParsing"`

Expected: HTTP 200 from the existing AXIO process. If it is unavailable, inspect port ownership first. Start `D:\shopee-auto-lister\.venv\Scripts\python.exe -B app.py` only on an unused port through the repository's established `PORT` configuration; never stop an existing listener.

- [ ] **Step 5: Capture and validate assets**

Run: `rtk npm run capture:v2`

Expected: the script reports all six page states, at least one 4x cutout per narrative feature, `blocked write attempts: 0`, and `platform_write=false`.

Run: `rtk npm test -- tests/v2-capture.test.ts`

Expected: PASS, including file dimensions, nonblank pixels, layout-coordinate containment, hashes, and the sensitive-data scan.

- [ ] **Step 6: Commit only the capture implementation, tests, manifest, layout, and approved assets**

```powershell
rtk git add scripts/capture-evidence.mjs tests/v2-capture.test.ts package.json src/v2/ink/live-layout.json public/evidence/ink
rtk git commit -m "feat(video): capture read-only AXIO Ink Press assets"
```

### Task 3: Adapt the Exact Ink Press Camera and Shared Primitives

**Files:**
- Create: `src/v2/ink/PageCam.tsx`
- Create: `src/v2/ink/InkPrimitives.tsx`
- Create: `tests/v2-ink-primitives.test.ts`

**Interfaces:**
- Produces: `CamKey`, `PageCam`, `InkTitleCard`, `FlashCut`, `InkCaption`, `DigitRoll`, `BrandInkOpen`, and `InkOutro`.
- Consumes: capture-generated 2x page textures and page-space cutout coordinates.

- [ ] **Step 1: Write failing static and render-contract tests**

Assert that `PageCam` exposes `frame/cx/cy/zoom/rotX/rotY/rotZ/persp`, uses CSS `zoom` in 3D mode, keeps page-space children in the same coordinate system, and never uses `objectFit: 'contain'`. Assert that the shared primitives use AXIO tokens, Chinese sans-serif, `letterSpacing: 0`, title-card hold `>=30f`, batch settle `>=15f`, and brand hold `>=30f`. Assert that the source contains neither `Math.random()` nor `Date.now()`.

- [ ] **Step 2: Run the test and verify it fails**

Run: `rtk npm test -- tests/v2-ink-primitives.test.ts`

Expected: FAIL because the shared Ink Press files do not exist.

- [ ] **Step 3: Copy and adapt the validated implementations**

Read these exact sources before editing:

```text
C:\Users\PC-20260522\.codex\skills\video-shotcraft\template\src\aifl\live\PageCam.tsx
C:\Users\PC-20260522\.codex\skills\video-shotcraft\template\src\aifl\PaperTitleCard.tsx
C:\Users\PC-20260522\.codex\skills\video-shotcraft\template\src\aifl\FlashCut.tsx
C:\Users\PC-20260522\.codex\skills\video-shotcraft\template\src\aifl\Caption.tsx
C:\Users\PC-20260522\.codex\skills\video-shotcraft\template\src\aifl\DigitRoll.tsx
C:\Users\PC-20260522\.codex\skills\video-shotcraft\template\src\aifl\live\SceneOpen.tsx
C:\Users\PC-20260522\.codex\skills\video-shotcraft\template\src\aifl\live\SceneOutroLive.tsx
```

Preserve the calibrated easing, layout-scale `zoom`, perspective math, 10f flash-cut envelope, word-by-word scale/blur entrance, digit roll, brand-open 30f settled hold, and outro `riser -> impact -> sparkle -> hold` action arc. Replace amber/paper styling with the AXIO token object:

```ts
export const INK = {
  accent: '#EE4D2D', ink: '#111111', page: '#F4F6F9',
  surface: '#FFFFFF', muted: '#65758B', verified: '#0D7657',
} as const;
```

`InkTitleCard` must wrap Chinese phrases by semantic segments rather than single Latin words and must use `fontFamily: 'Inter, "Microsoft YaHei", "PingFang SC", sans-serif'`, bold weight, and zero letter spacing.

- [ ] **Step 4: Render primitive stills and run tests**

Run: `rtk npm test -- tests/v2-ink-primitives.test.ts`

Expected: PASS.

Run: `rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/qa/ink-primitives-f150.png --frame=150`

Expected: a nonblank 4K frame with sharp page text and no boxed full-page screenshot.

- [ ] **Step 5: Commit the shared layer**

```powershell
rtk git add src/v2/ink/PageCam.tsx src/v2/ink/InkPrimitives.tsx tests/v2-ink-primitives.test.ts
rtk git commit -m "feat(video): adapt Ink Press camera primitives for AXIO"
```

### Task 4: Build the Website Ink Press Shots

**Files:**
- Create: `src/v2/ink/WebsiteShots.tsx`
- Modify: `src/v2/WebsiteV2.tsx`
- Create: `tests/v2-website-ink-shots.test.ts`

**Interfaces:**
- Consumes: `websiteV2.shots`, `PageCam`, shared primitives, `live-layout.json`, and `public/evidence/ink`.
- Produces: `WebsiteShot({id}: {id: string})` and a thin `WebsiteV2({bgm = true}: V2FilmProps)` assembler.

- [ ] **Step 1: Write failing website shot mapping tests**

Require every website shot ID to map exactly once and assert these recipe/source pairs:

```ts
expect(WEBSITE_SHOT_RECIPES).toEqual({
  open: ['brand-ink-open', 'spotlight-hero-card'],
  'goal-title': ['paper-title-card'],
  'plan-deal': ['deck-deal-flyin', 'type-and-filter'],
  'pricing-detail': ['row-embed'],
  'governance-title': ['paper-title-card'],
  'governance-stack': ['list-stack-press'],
  'authority-map': ['spotlight-hero-card'],
  'readback-title': ['paper-title-card'],
  readback: ['document-typewriter-reveal'],
  'control-title': ['paper-title-card'],
  capability: ['row-embed'],
  'founder-proof': ['digit-roll'],
  outro: ['outro-group-photo-launch'],
});
```

Add static assertions that the authority shot says `AI 主管 / 唯一正式派发`, `ACCIO 超级主管 / 监督治理`, and `G1 / G2 / 确定性执行与独立回读`; the capability shot always displays `规划能力 / 尚未开放`; the readback shot places `已验证` after the authoritative readback rows have settled.

- [ ] **Step 2: Run the website shot test and verify it fails**

Run: `rtk npm test -- tests/v2-website-ink-shots.test.ts`

Expected: FAIL because the website shot renderer does not exist and the old component is a hand-built slide sequence.

- [ ] **Step 3: Implement the 13-shot landscape renderer from exact template sources**

Before each adaptation, read the full selected card and exact implementation named below:

```text
brand-ink-open + spotlight-hero-card -> template/src/aifl/live/SceneOpen.tsx
deck-deal-flyin + type-and-filter    -> template/src/aifl/live/SceneFlyIn.tsx
row-embed                             -> template/src/aifl/live/SceneDetail.tsx
list-stack-press                      -> template/src/aifl/live/ScenePapers.tsx
document-typewriter-reveal            -> template/src/aifl/live/SceneWbr.tsx
outro-group-photo-launch              -> template/src/aifl/live/SceneOutroLive.tsx
```

Use full-frame `PageCam` framing. In the open shot, move from the 2x dashboard overview to a 4x goal-input cutout and return it to its actual slot. In `plan-deal`, use real goal/task cutouts, one 10f segment-level anticipation, hard-accelerating deterministic deal cues, actual layout destinations, human-paced 3f-per-character input, at least 11f of causal rest, and a 15f settled grid. In pricing, embed real cost/profit rows into their captured destinations. In governance, press the six approved checks into the real list. The authority map is the only abstract relationship graphic and must remain visually derived from AXIO tokens. The readback shot must finish authoritative rows before the verified marker. The last 120 frames of the outro must be stable brand/disclosure hold.

- [ ] **Step 4: Render ingress, peak, and settled stills for every website shot**

Use frames `0/120/195`, `210/234/258`, `264/350/429`, `444/486/531`, `540/566/588`, `594/650/699`, `714/770/819`, `834/860/882`, `888/942/993`, `1008/1034/1056`, `1062/1125/1185`, `1200/1228/1252`, and `1260/1365/1500`.

Run: `rtk npm run stills:v2:website`

Expected: 39 nonblank PNGs. Every key label is readable at actual webpage embed size; no full page sits inside a small frame; flying cutouts land in their real slots; no side gutters appear without narrative purpose.

- [ ] **Step 5: Run tests and commit**

Run: `rtk npm test -- tests/v2-website-ink-shots.test.ts tests/v2-timeline.test.ts`

Expected: PASS.

```powershell
rtk git add src/v2/ink/WebsiteShots.tsx src/v2/WebsiteV2.tsx tests/v2-website-ink-shots.test.ts
rtk git commit -m "feat(video): build AXIO website Ink Press shots"
```

### Task 5: Build the Independent WeChat Portrait Shots

**Files:**
- Create: `src/v2/ink/WechatShots.tsx`
- Modify: `src/v2/WechatV2.tsx`
- Create: `tests/v2-wechat-ink-shots.test.ts`

**Interfaces:**
- Consumes: `wechatV2.shots`, shared primitives, portrait camera keys, and the same source captures.
- Produces: `WechatShot({id}: {id: string})` and `WechatV2({bgm = true}: V2FilmProps)`.

- [ ] **Step 1: Write failing portrait composition tests**

Assert all 11 portrait shots map once, use portrait-specific camera keys, never apply a whole-film landscape scale, keep all native captions inside `x=70..1010`, and use a portrait title size no larger than `84px`. Require the exact role/capability/readback assertions from Task 4 and the shorter approved closing line.

- [ ] **Step 2: Run the test and verify it fails**

Run: `rtk npm test -- tests/v2-wechat-ink-shots.test.ts`

Expected: FAIL because the old WeChat component has five card-like scenes and unverified trial messaging.

- [ ] **Step 3: Implement portrait-native crops and choreography**

Use vertical strips and close-ups from the real full-page captures; do not scale a 16:9 stage into 9:16. Keep the brand open low-energy, the deal shot as the only batch-card hero, pricing as a single readable close-up, governance as one stacked relationship/check shot, readback as one typewriter reveal, capability as a status-boundary close-up, and outro as the only assembly climax. Preserve the same calibrated motion ratios but recompute `cx/cy/zoom` for 1080x1920 and keep at least 70px safe-area margins.

- [ ] **Step 4: Render three stills per portrait shot and inspect at phone size**

Run: `rtk npm run stills:v2:wechat`

Expected: 33 nonblank PNGs plus a portrait contact sheet. At `390x844` display size, role names, title cards, current/future labels, readback state, and closing line remain readable without overlap.

- [ ] **Step 5: Run tests and commit**

Run: `rtk npm test -- tests/v2-wechat-ink-shots.test.ts tests/v2-timeline.test.ts`

Expected: PASS.

```powershell
rtk git add src/v2/ink/WechatShots.tsx src/v2/WechatV2.tsx tests/v2-wechat-ink-shots.test.ts
rtk git commit -m "feat(video): build portrait-native AXIO Ink Press shots"
```

### Task 6: Regenerate Natural Narration and Add Beat-Synced BGM/SFX

**Files:**
- Modify: `scripts/generate-v2-audio.ps1`
- Create: `scripts/analyze-v2-beats.mjs`
- Create: `src/v2/ink/audio.tsx`
- Modify: `tests/v2-audio-generator.test.ts`
- Modify: `tests/audio-validation.test.ts`
- Create: `tests/v2-beat-sync.test.ts`
- Create: `public/audio/v2/ATTRIBUTION.md`
- Create: `props-nobgm.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `websiteV2.narration`, `wechatV2.narration`, `house-vibez.mp3`, and traceable SFX.
- Produces: `InkAudio({format, bgm}: {format: 'website' | 'wechat'; bgm: boolean})`.
- Produces: `out/v2-beat-report.json` with BPM, phase, grid residual, and per-cut frame error.

- [ ] **Step 1: Write failing voice, attribution, BGM-gate, and beat tests**

Keep assertions for `zh-CN-YunxiNeural`, retry count `3`, 48 kHz stereo WAV, natural dynamics, and a slightly fast base rate. Replace the old fourteen-track count with the exact cue counts from `timeline.ts`; assert generator text equals timeline cue text. Assert each cue's measured duration is at least `8f` shorter than its declared window. Assert the audio component includes narration and SFX regardless of `bgm`, and wraps only the BGM `<Audio>` in the prop gate.

Require attribution for `house-vibez.mp3` as `House Vibez / Lily J / Mixkit Stock Music Free License / https://assets.mixkit.co/music/745/745.mp3`. Use only traceable SFX: `transition-soft`, `sweep-fast-small`, `swoosh-quick`, `camera-shutter-hard`, `paper-slide`, `paper-staple`, `typewriter-digital`, `impact-deep-whoosh`, `shimmer-sparkle-sweep`, and `air-whoosh-powerful`. Do not use `riser-cine.mp3` because its source cannot currently be independently traced.

- [ ] **Step 2: Run the audio tests and verify they fail**

Run: `rtk npm test -- tests/v2-audio-generator.test.ts tests/audio-validation.test.ts tests/v2-beat-sync.test.ts`

Expected: FAIL because narration still reflects the 88s/50s films, current beds are generated ambience rather than the selected BGM, and there is no BGM prop or cut-error report.

- [ ] **Step 3: Generate the approved narration without mechanical post-processing**

Retain Edge TTS and the current limiter chain. Use base rate `+5%` and pitch `-1Hz`, then accelerate only a cue that fails its declared duration check, never beyond `+12%`. Do not use coarse pitch shifting, denoising, or hard loudness normalization on individual voice clips. Fail the script if any final WAV exceeds its cue window minus 8 frames.

- [ ] **Step 4: Copy and analyze the licensed BGM before pinning actions**

Copy `house-vibez.mp3` and its attribution into `public/audio/v2`. Analyze the exact shipped file using the video-shotcraft least-squares beat-grid method. Record true BPM, phase, period, residual, strongest kick beats, selected trim offset, and any approved `atempo` adjustment between `0.98` and `1.02`. Keep the exact `1530/1170` film lengths and approved narrative ranges; align hard cuts and primary actions through the BGM trim/phase and local action frames.

Run: `rtk npm run analyze:beats:v2`

Expected: grid residual no more than 15ms and every declared hard cut/primary action no more than 1 frame from its assigned beat.

- [ ] **Step 5: Add the absolute-frame SFX tables and BGM gate**

Use `beatF(n)` for transition and action anchors. Each visual action receives at most one intentional SFX; dense deal landings collapse into two alternating impacts with descending volume plus one whoosh. The outro is `air-whoosh-powerful -> impact-deep-whoosh -> shimmer-sparkle-sweep -> >=30f hold`. `InkAudio` must render the same narration/SFX sequences for both BGM modes.

- [ ] **Step 6: Add all four render commands**

Keep the existing BGM output paths and add:

```json
{
  "render:website:v2:nobgm": "remotion render src/index.ts AXIO-Website-V2-4K out/AXIO-website-v2-4k-nobgm.mp4 --props=props-nobgm.json --pixel-format=yuv420p --color-space=bt709",
  "render:wechat:v2:nobgm": "remotion render src/index.ts AXIO-WeChat-V2-Vertical out/AXIO-wechat-v2-vertical-nobgm.mp4 --props=props-nobgm.json --pixel-format=yuv420p --color-space=bt709"
}
```

- [ ] **Step 7: Run audio tests and commit**

Run: `rtk npm test -- tests/v2-audio-generator.test.ts tests/audio-validation.test.ts tests/v2-beat-sync.test.ts tests/v2-continuous-operations-narration.test.ts`

Expected: PASS, with natural-duration voice, full attribution, identical narration/SFX in both modes, and all measured action/cut errors `<=1f`.

```powershell
rtk git add scripts/generate-v2-audio.ps1 scripts/analyze-v2-beats.mjs src/v2/ink/audio.tsx tests/v2-audio-generator.test.ts tests/audio-validation.test.ts tests/v2-beat-sync.test.ts public/audio/v2 props-nobgm.json package.json
rtk git commit -m "feat(video): add natural voice and beat-synced Ink Press audio"
```

### Task 7: Automate Stills, Contact Sheets, and Visual Acceptance

**Files:**
- Create: `scripts/render-v2-stills.mjs`
- Create: `tests/v2-visual-acceptance.test.ts`
- Modify: `package.json`
- Create: `out/qa/website-contact-sheet.jpg` through the script
- Create: `out/qa/wechat-contact-sheet.jpg` through the script

**Interfaces:**
- Consumes: both compositions and the timeline shot tables.
- Produces: ingress/peak/settled stills, contact sheets, pixel-stat reports, and an exact frame manifest.

- [ ] **Step 1: Write the failing QA script tests**

Assert three still frames per shot, unique output names, nonblank pixel variance, no frame beyond composition duration, and contact-sheet output for both formats. Add OCR/text-bound checks for title-card copy, role names, capability labels, readback verification, and closing lines. Add a layout check that no key text box exceeds its viewport or overlaps the caption safe area.

- [ ] **Step 2: Run the test and verify it fails**

Run: `rtk npm test -- tests/v2-visual-acceptance.test.ts`

Expected: FAIL because the still/contact-sheet pipeline does not exist.

- [ ] **Step 3: Implement deterministic still and contact-sheet generation**

Drive all frame selection from `websiteV2.shots` and `wechatV2.shots`; for each shot calculate ingress at `from`, peak at `from + floor(duration * 0.55)`, and settled at `from + duration - 8`, except use the explicit frames from Tasks 4 and 5 where specified. Invoke Remotion still, verify dimensions and variance with Sharp, and build contact sheets with fixed columns and filename/frame captions outside the video pixels.

- [ ] **Step 4: Run visual QA at delivery embed sizes**

Run: `rtk npm run stills:v2`

Expected: 39 website stills, 33 WeChat stills, two contact sheets, no blank/flat image, no clipped text, no incoherent overlap, no full-page screenshot reduced to a small framed slide, and no unexplained side gutters.

- [ ] **Step 5: Run all static checks and commit**

Run: `rtk npm test`

Expected: all tests PASS.

Run: `rtk npm run typecheck`

Expected: exit code 0.

```powershell
rtk git add scripts/render-v2-stills.mjs tests/v2-visual-acceptance.test.ts package.json
rtk git commit -m "test(video): automate Ink Press visual acceptance"
```

### Task 8: Render Four Deliverables, Verify Decode, and Complete Independent Final Review

**Files:**
- Modify: `scripts/verify-v2-renders.mjs`
- Modify: `tests/v2-timeline.test.ts`
- Create: `out/v2-acceptance-report.json` through verification
- Create: `out/v2-final-review.md` through independent review

**Interfaces:**
- Consumes: four final MP4s, capture manifest, timeline, beat report, contact sheets, selected shot cards, exact template TSX, and approved design.
- Produces: authoritative technical acceptance plus an independent frame-referenced review with zero Critical/High findings.

- [ ] **Step 1: Update failing render-verifier tests for four outputs**

Require these files and exact duration windows:

```js
[
  ['AXIO-website-v2-4k.mp4', 3840, 2160, 50.9, 51.1, true],
  ['AXIO-website-v2-4k-nobgm.mp4', 3840, 2160, 50.9, 51.1, false],
  ['AXIO-wechat-v2-vertical.mp4', 1080, 1920, 38.9, 39.1, true],
  ['AXIO-wechat-v2-vertical-nobgm.mp4', 1080, 1920, 38.9, 39.1, false],
]
```

Retain H.264, yuv420p, BT.709, 30fps, AAC 48kHz, faststart, full decode, frame-variance, and loudness checks. Require capture manifest `platform_write=false`. Compare paired audio: narration/SFX windows must match, while the no-BGM version must lack the BGM spectral/energy bed.

- [ ] **Step 2: Run the verifier test and verify it fails before final renders**

Run: `rtk npm test -- tests/v2-timeline.test.ts`

Expected: FAIL because the old verifier still expects 88s/50s and only two files.

- [ ] **Step 3: Render temporary candidates first**

Render the four compositions to `out/candidates/` with yuv420p and BT.709. Run full tests, typecheck, still/contact-sheet QA, beat report, and candidate verification. Do not replace the current named deliverables until all candidate checks pass.

- [ ] **Step 4: Render the four final named files**

Run:

```powershell
rtk npm run render:website:v2
rtk npm run render:website:v2:nobgm
rtk npm run render:wechat:v2
rtk npm run render:wechat:v2:nobgm
```

Expected: four complete MP4 files at the exact names in Step 1.

- [ ] **Step 5: Run technical verification and decode every frame**

Run: `rtk npm run verify:renders:v2`

Expected: four accepted files, exact dimensions/durations, H.264 yuv420p BT.709 at 30fps, AAC 48kHz, faststart, loudness within contract, no blank sampled frame, complete decode, BGM/no-BGM distinction proven, and `platformWrite=false`.

- [ ] **Step 6: Run the mandatory independent final review**

Provide the reviewer with both reference videos, the approved design, final four MP4s, both contact sheets, product brief, timeline/copy contract, capture manifest, role/capability rules, selected shot-card names and variants, exact template TSX paths, beat report, and technical report. The reviewer must inspect frame-referenced evidence for design consistency, feature completeness, recipe fidelity, text clarity, portrait independence, audio quality, data safety, and technical quality.

Expected: `out/v2-final-review.md` reports zero Critical and zero High findings. Any Critical/High finding returns to its owning task, requires a new render, and repeats technical plus independent review.

- [ ] **Step 7: Record durable operating knowledge and commit the verifier only**

Add the confirmed reusable rules to the existing video tests or this plan's acceptance section: GET-only capture with authoritative manifest readback, 2x page plus 4x cutout plus layout coordinates, CSS layout zoom for sharp 3D text, independent portrait keys, and paired BGM/no-BGM renders from one timeline.

```powershell
rtk git add scripts/verify-v2-renders.mjs tests/v2-timeline.test.ts
rtk git commit -m "test(video): verify four AXIO Ink Press deliverables"
```

Do not commit generated MP4s, QA stills, contact sheets, acceptance JSON, or review output unless the repository's existing ignore/asset policy explicitly tracks those paths.

#### Confirmed Task 8 operating rules

- Treat encoder flags as configured state, not delivery proof. Remotion's `--color-space=bt709` may emit `color_space=bt709` without `color_transfer` and `color_primaries`; require ffprobe readback of all three fields and add them during the final faststart remux when absent.
- Independent H.264 encodes can decode to different pixels even when they render the same deterministic composition. For strict BGM/no-BGM frame identity, render both audio states from the shared timeline, then mux both deliveries with the same accepted video stream and their respective audio streams before running `framemd5`.
- Master the four final mixes to the retained `-17..-15 LUFS` and `<= -1 dBTP` contract before pairing analysis. Keep `platform_write=false`, full decode, nonblank settled-frame samples, PCM narration/SFX retention, and the extra BGM energy bed as authoritative readbacks.

## Final Acceptance Commands

```powershell
rtk npm test
rtk npm run typecheck
rtk npm run stills:v2
rtk npm run analyze:beats:v2
rtk npm run verify:renders:v2
rtk git diff --check
rtk git status --short
```

Expected: tests and typecheck pass; 72 shot stills and two contact sheets pass visual checks; every declared cut/action is within 1 frame of its assigned beat; all four MP4s pass decode/metadata/audio/safety verification; diff check is clean; status contains no accidentally staged or reverted user files.
