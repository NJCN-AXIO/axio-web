# AXIO Cinematic UI Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace slideshow-like full-page screenshot scenes in both AXIO V2 films with readable, video-native interface choreography derived from the real product, while retaining brief evidence records, current narration timing, and verified authority boundaries.

**Architecture:** Keep the existing Remotion compositions, V2 timelines, audio pipeline, theme, and render verifier. Add a typed demonstration model plus shared cinematic UI primitives, then move shot-specific reconstructed surfaces into focused scene components. Real screenshots remain available only through an explicit evidence-record component; all audience-critical labels render as native React text.

**Tech Stack:** React 19, TypeScript 5.9, Remotion 4.0.499, Vitest 3.2, PowerShell Edge TTS generator, ffmpeg/ffprobe.

## Global Constraints

- Preserve website duration at 2640 frames and WeChat duration at 1500 frames, both at 30 fps.
- Preserve existing BGM, voice, scene order, and approximate per-scene timing; only replace the final brand narration with `这就是 AXIO。让每一次经营决策，都有计划、有边界、有回读。`.
- Use `AI 主管` and `ACCIO 超级主管` in all audience-visible role copy.
- G1 and G2 are deterministic executors dispatched by `AI 主管`; results independently read back under `ACCIO 超级主管` supervision.
- Future capability must remain labeled `规划能力 / 尚未开放` throughout the relevant shot.
- A completed state may appear only after authoritative readback.
- Real screenshots must carry `真实界面记录`; reconstructed UI uses fictional or desensitized data.
- Website and portrait compositions are independent layouts; portrait must not scale the website composition.
- Do not use full-page `objectFit: 'contain'` for audience-critical product explanation.
- Keep deterministic animation; do not use `Date.now()` or `Math.random()`.
- Preserve unrelated worktree changes and reuse the current render and verification pipeline.

---

## File Structure

- Create `src/v2/demo-model.ts`: typed fictional demonstration data, authority labels, capability labels, and readback state helpers.
- Create `src/v2/ui/CinematicConsole.tsx`: shared window chrome, panels, chips, task rows, and camera surface.
- Create `src/v2/ui/EvidenceRecord.tsx`: deliberate real-screenshot crop with the mandatory evidence label.
- Create `src/v2/scenes/WebsiteScenes.tsx`: all nine website scene exports, composed from shared UI primitives.
- Create `src/v2/scenes/PortraitScenes.tsx`: five portrait-specific scene exports.
- Modify `src/v2/WebsiteV2.tsx`: sequence and audio orchestration only.
- Modify `src/v2/WechatV2.tsx`: sequence and audio orchestration only.
- Modify `src/v2/copy.ts`: approved close, Chinese-first labels, capability disclosure.
- Modify `src/v2/timeline.ts`: approved final narration and corrected executor language without changing frame ranges.
- Modify `scripts/generate-v2-audio.ps1`: synchronize changed final narration and regenerate only affected clips.
- Create `src/v2/review-frames.ts`: canonical still frames for all scene phases.
- Create `scripts/render-v2-review-stills.mjs`: deterministic still generation and contact-sheet inputs.
- Modify `scripts/verify-v2-renders.mjs`: reuse canonical review frames and retain current technical checks.
- Add or modify focused Vitest files under `tests/` for each contract.

---

### Task 1: Lock The Demonstration And Authority Contracts

**Files:**
- Create: `src/v2/demo-model.ts`
- Modify: `src/v2/copy.ts`
- Modify: `src/v2/timeline.ts`
- Test: `tests/v2-demo-model.test.ts`
- Test: `tests/v2-continuous-operations-narration.test.ts`

**Interfaces:**
- Produces: `DEMO_STORES`, `DEMO_TASK`, `GOVERNANCE_CHECKS`, `OPERATING_STEPS`, `CAPABILITY_STAGES`, `organizationNodes(layout)`, and `readbackState(frame)`.
- Produces: `FINAL_BRAND_VOICE`, `FINAL_BRAND_PRIMARY`, `FINAL_BRAND_SECONDARY`, `REAL_EVIDENCE_LABEL`, and `FUTURE_CAPABILITY_LABEL`.
- Consumes: existing `websiteV2` and `wechatV2` scene identifiers and frame ranges.

- [ ] **Step 1: Write the failing model and narration tests**

```ts
// tests/v2-demo-model.test.ts
import {describe, expect, it} from 'vitest';
import {
  CAPABILITY_STAGES,
  organizationNodes,
  readbackState,
} from '../src/v2/demo-model';
import {
  FINAL_BRAND_PRIMARY,
  FINAL_BRAND_SECONDARY,
  FINAL_BRAND_VOICE,
  FUTURE_CAPABILITY_LABEL,
  REAL_EVIDENCE_LABEL,
} from '../src/v2/copy';

describe('AXIO cinematic demonstration contract', () => {
  it('uses approved Chinese role names in both layouts', () => {
    for (const layout of ['landscape', 'portrait'] as const) {
      const names = organizationNodes(layout).map((node) => node.name);
      expect(names).toContain('AI 主管');
      expect(names).toContain('ACCIO 超级主管');
      expect(names).not.toContain('AI Supervisor');
    }
  });

  it('labels evidence and unreleased capability explicitly', () => {
    expect(REAL_EVIDENCE_LABEL).toBe('真实界面记录');
    expect(FUTURE_CAPABILITY_LABEL).toBe('规划能力 / 尚未开放');
    expect(CAPABILITY_STAGES.at(-1)?.released).toBe(false);
  });

  it('does not report completion before authoritative readback', () => {
    expect(readbackState(0).status).toBe('pending');
    expect(readbackState(149).status).toBe('verifying');
    expect(readbackState(220)).toEqual({status: 'verified', label: '已验证'});
  });

  it('locks the approved brand close', () => {
    expect(FINAL_BRAND_VOICE).toBe(
      '这就是 AXIO。让每一次经营决策，都有计划、有边界、有回读。',
    );
    expect(FINAL_BRAND_PRIMARY).toBe('这就是 AXIO');
    expect(FINAL_BRAND_SECONDARY).toBe('有计划 · 有边界 · 有回读');
  });
});
```

Update the expected website brand narration in `tests/v2-continuous-operations-narration.test.ts` to `FINAL_BRAND_VOICE`, and replace executor wording with `G1、G2 是受 AI 主管派发的确定性执行器；运行结果独立回读并接受 ACCIO 超级主管监督。` wherever that authority relationship is narrated.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```powershell
rtk npm test -- tests/v2-demo-model.test.ts tests/v2-continuous-operations-narration.test.ts
```

Expected: FAIL because `src/v2/demo-model.ts` and the new copy exports do not exist.

- [ ] **Step 3: Implement the typed contract**

```ts
// src/v2/demo-model.ts
export type Layout = 'landscape' | 'portrait';
export type DemoStatus = 'pending' | 'verifying' | 'verified';

export const DEMO_STORES = [
  {name: 'SG 演示店 A', site: '新加坡', orders: 128, status: '正常'},
  {name: 'MY 演示店 B', site: '马来西亚', orders: 96, status: '正常'},
  {name: 'PH 演示店 C', site: '菲律宾', orders: 73, status: '待复核'},
] as const;

export const DEMO_TASK = {
  product: '轻量收纳架',
  sites: ['新加坡', '马来西亚'],
  quantity: 120,
  targetMargin: '22%',
} as const;

export const GOVERNANCE_CHECKS = [
  ['违禁词', '通过'],
  ['品牌', '通过'],
  ['图片', '通过'],
  ['目标利润', '通过'],
  ['租户权限', '通过'],
  ['脚本能力', '阻断'],
] as const;

export const OPERATING_STEPS = [
  '同步订单', '检查清理', '检查容量', '校验价格', '上新检查', '结果回读',
] as const;

export const CAPABILITY_STAGES = [
  {phase: '当前', title: '受控执行', released: true},
  {phase: '下一步', title: '逐项验收开放', released: false},
  {phase: '规划能力', title: '7×24 受监督运营', released: false},
] as const;

const nodes = [
  {id: 'founder', name: '创始人', role: '最终决策'},
  {id: 'accio', name: 'ACCIO 超级主管', role: '监督 · 纠偏 · 治理'},
  {id: 'supervisor', name: 'AI 主管', role: '唯一正式任务派发者'},
  {id: 'agent', name: '专业智能体', role: '结构化建议'},
  {id: 'g1', name: 'G1 API', role: '确定性执行器'},
  {id: 'g2', name: 'G2 浏览器', role: '确定性执行器'},
] as const;

export const organizationNodes = (layout: Layout) =>
  layout === 'portrait' ? nodes.filter(({id}) => id !== 'agent') : [...nodes];

export const readbackState = (frame: number): {status: DemoStatus; label: string} => {
  if (frame >= 180) return {status: 'verified', label: '已验证'};
  if (frame >= 80) return {status: 'verifying', label: '结果回读中'};
  return {status: 'pending', label: '等待执行'};
};
```

Add the approved exports to `src/v2/copy.ts`, import them into `src/v2/timeline.ts`, preserve all existing `from` and `duration` values, and use `FINAL_BRAND_VOICE` for the website `brand` scene and the WeChat closing scene.

- [ ] **Step 4: Run focused tests and typecheck**

```powershell
rtk npm test -- tests/v2-demo-model.test.ts tests/v2-continuous-operations-narration.test.ts
rtk npm run typecheck
```

Expected: both test files PASS and TypeScript exits 0.

- [ ] **Step 5: Commit the contract**

```powershell
rtk git add src/v2/demo-model.ts src/v2/copy.ts src/v2/timeline.ts tests/v2-demo-model.test.ts tests/v2-continuous-operations-narration.test.ts
rtk git commit -m "feat(video): lock cinematic demo contracts"
```

---

### Task 2: Build Shared Cinematic Console And Evidence Primitives

**Files:**
- Create: `src/v2/ui/CinematicConsole.tsx`
- Create: `src/v2/ui/EvidenceRecord.tsx`
- Modify: `src/v2/theme.ts`
- Test: `tests/v2-cinematic-ui.test.ts`

**Interfaces:**
- Produces: `CinematicConsole`, `ConsolePanel`, `StatusChip`, `TaskRow`, `CameraSurface`, and `EvidenceRecord` React components.
- Produces: `UI_SCALE` and `EVIDENCE_CROPS` exported constants for deterministic layout tests.
- Consumes: `V2`, `range`, Remotion `Img`, `interpolate`, `staticFile`, and `useCurrentFrame`.

- [ ] **Step 1: Write the failing primitive contract test**

```ts
// tests/v2-cinematic-ui.test.ts
import {describe, expect, it} from 'vitest';
import {UI_SCALE} from '../src/v2/ui/CinematicConsole';
import {EVIDENCE_CROPS} from '../src/v2/ui/EvidenceRecord';

describe('cinematic UI readability contract', () => {
  it('keeps critical text readable in both formats', () => {
    expect(UI_SCALE.landscape.title).toBeGreaterThanOrEqual(72);
    expect(UI_SCALE.landscape.body).toBeGreaterThanOrEqual(32);
    expect(UI_SCALE.portrait.title).toBeGreaterThanOrEqual(58);
    expect(UI_SCALE.portrait.body).toBeGreaterThanOrEqual(28);
  });

  it('uses deliberate crops instead of full-page contain', () => {
    for (const crop of Object.values(EVIDENCE_CROPS)) {
      expect(crop.fit).toBe('cover');
      expect(crop.scale).toBeGreaterThanOrEqual(1.25);
    }
  });
});
```

- [ ] **Step 2: Run the primitive test and verify failure**

```powershell
rtk npm test -- tests/v2-cinematic-ui.test.ts
```

Expected: FAIL because both UI modules are missing.

- [ ] **Step 3: Implement reusable console primitives**

`CinematicConsole.tsx` must export these stable values and signatures:

```tsx
export const UI_SCALE = {
  landscape: {title: 88, body: 34, label: 28},
  portrait: {title: 64, body: 30, label: 26},
} as const;

export const CinematicConsole: FC<{
  portrait?: boolean;
  title: string;
  section: string;
  children: ReactNode;
}>;

export const ConsolePanel: FC<{
  title: string;
  active?: boolean;
  children: ReactNode;
}>;

export const StatusChip: FC<{
  status: 'neutral' | 'active' | 'pass' | 'blocked';
  children: ReactNode;
}>;

export const TaskRow: FC<{
  index: number;
  label: string;
  value: string;
  active?: boolean;
}>;

export const CameraSurface: FC<{
  progress: number;
  portrait?: boolean;
  children: ReactNode;
}>;
```

Implement `CameraSurface` with one restrained transform:

```tsx
const scale = interpolate(progress, [0, 1], [1.035, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

return (
  <div style={{
    position: 'absolute',
    inset: portrait ? 36 : 72,
    transform: `perspective(2200px) scale(${scale})`,
    transformOrigin: '50% 50%',
  }}>
    {children}
  </div>
);
```

`EvidenceRecord.tsx` must use Remotion `Img`, not a raw HTML image, and must always render `REAL_EVIDENCE_LABEL`:

```tsx
export const EVIDENCE_CROPS = {
  'matrix-pricing.webp': {fit: 'cover', scale: 1.35, x: '50%', y: '42%'},
  'task-pricing.webp': {fit: 'cover', scale: 1.28, x: '62%', y: '38%'},
  'risk-control.webp': {fit: 'cover', scale: 1.32, x: '58%', y: '45%'},
  'supervisor.webp': {fit: 'cover', scale: 1.3, x: '54%', y: '40%'},
} as const;

export const EvidenceRecord: FC<{
  asset: keyof typeof EVIDENCE_CROPS;
  portrait?: boolean;
}>;
```

Render each crop edge-to-edge inside its allocated shot region. Do not retain the generic `objectFit: 'contain'` behavior from `EvidenceLens`.

- [ ] **Step 4: Run tests and typecheck**

```powershell
rtk npm test -- tests/v2-cinematic-ui.test.ts
rtk npm run typecheck
```

Expected: PASS and TypeScript exits 0.

- [ ] **Step 5: Commit shared UI**

```powershell
rtk git add src/v2/ui/CinematicConsole.tsx src/v2/ui/EvidenceRecord.tsx src/v2/theme.ts tests/v2-cinematic-ui.test.ts
rtk git commit -m "feat(video): add cinematic AXIO console primitives"
```

---

### Task 3: Rebuild Website Command, Organization, Positioning, And Evidence

**Files:**
- Create: `src/v2/scenes/WebsiteScenes.tsx`
- Modify: `src/v2/WebsiteV2.tsx`
- Modify: `src/v2/OrganizationBoot.tsx`
- Test: `tests/v2-website-scenes.test.ts`

**Interfaces:**
- Produces: `WebsiteCommandScene`, `WebsiteOrganizationScene`, `WebsitePositioningScene`, and `WebsiteProofScene`.
- Consumes: shared console primitives, `EvidenceRecord`, `DEMO_STORES`, `organizationNodes('landscape')`, `VoiceCaption`, and the existing timeline.

- [ ] **Step 1: Write the failing website scene structure test**

```ts
// tests/v2-website-scenes.test.ts
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('website cinematic scene structure', () => {
  const source = () => readFileSync('src/v2/scenes/WebsiteScenes.tsx', 'utf8');

  it('exports the first four reconstructed scenes', () => {
    expect(source()).toContain('export const WebsiteCommandScene');
    expect(source()).toContain('export const WebsiteOrganizationScene');
    expect(source()).toContain('export const WebsitePositioningScene');
    expect(source()).toContain('export const WebsiteProofScene');
  });

  it('uses the evidence bridge and not the generic full-page lens', () => {
    expect(source()).toContain('<EvidenceRecord');
    expect(source()).not.toContain('<EvidenceLens');
    expect(source()).not.toContain("objectFit: 'contain'");
  });

  it('renders Chinese-first role copy', () => {
    expect(source()).toContain('ACCIO 超级主管');
    expect(source()).toContain('AI 主管');
    expect(source()).not.toContain('FORMAL DISPATCH');
  });
});
```

- [ ] **Step 2: Run the scene test and verify failure**

```powershell
rtk npm test -- tests/v2-website-scenes.test.ts
```

Expected: FAIL because `WebsiteScenes.tsx` is missing.

- [ ] **Step 3: Implement the first four scenes**

Implement these scene behaviors in `WebsiteScenes.tsx`:

```tsx
export const WebsiteCommandScene: FC = () => {
  const frame = useCurrentFrame();
  const typed = FUTURE_COMMAND.slice(0, Math.floor(range(frame, 8, 72) * FUTURE_COMMAND.length));
  return (
    <Stage>
      <CameraSurface progress={range(frame, 0, 120)}>
        <CinematicConsole section='经营目标' title='新建经营任务'>
          <ConsolePanel title='输入目标' active>
            <div>{typed}<span aria-hidden>|</span></div>
          </ConsolePanel>
          <ConsolePanel title='AXIO 正在形成范围'>
            <TaskRow index={1} label='站点' value='新加坡 · 马来西亚' active={frame >= 54} />
            <TaskRow index={2} label='利润边界' value='目标毛利 22%' active={frame >= 72} />
            <TaskRow index={3} label='执行状态' value='等待治理检查' active={frame >= 92} />
          </ConsolePanel>
        </CinematicConsole>
      </CameraSurface>
      <VoiceCaption>{websiteVoice('command')}</VoiceCaption>
    </Stage>
  );
};
```

Organization must reveal the supervision pair during frames 0-90 and the agent/executor layer after frame 90. Positioning retains the large statement but places an active console surface behind it. Proof must show `EvidenceRecord` for no longer than the first 60 local frames, then transition to a native operating matrix using `DEMO_STORES` and large metric text.

Refactor `WebsiteV2.tsx` so it contains audio sequences plus scene sequences only; remove the old local scene implementations. Retain all existing scene `from` and `duration` values.

- [ ] **Step 4: Run website tests and typecheck**

```powershell
rtk npm test -- tests/v2-website-scenes.test.ts tests/v2-organization.test.ts tests/v2-timeline.test.ts
rtk npm run typecheck
```

Expected: all focused tests PASS and TypeScript exits 0.

- [ ] **Step 5: Render and inspect first-beat stills**

```powershell
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-command.png --frame=90
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-organization-a.png --frame=210
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-organization-b.png --frame=360
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-proof.png --frame=760
```

Expected: product UI fills the useful frame, the organization is split into two readable beats, and proof copy is native text rather than screenshot text.

- [ ] **Step 6: Commit the website opening**

```powershell
rtk git add src/v2/scenes/WebsiteScenes.tsx src/v2/WebsiteV2.tsx src/v2/OrganizationBoot.tsx tests/v2-website-scenes.test.ts
rtk git commit -m "feat(video): rebuild AXIO website opening scenes"
```

---

### Task 4: Rebuild Website Planning, Governance, And Readback

**Files:**
- Modify: `src/v2/scenes/WebsiteScenes.tsx`
- Test: `tests/v2-operating-flow.test.ts`

**Interfaces:**
- Produces: `WebsitePlanScene`, `WebsiteGovernanceScene`, and `WebsiteReadbackScene`.
- Consumes: `DEMO_TASK`, `GOVERNANCE_CHECKS`, `OPERATING_STEPS`, `readbackState`, and shared cinematic UI primitives.

- [ ] **Step 1: Write the failing causal-flow tests**

```ts
// tests/v2-operating-flow.test.ts
import {describe, expect, it} from 'vitest';
import {
  GOVERNANCE_CHECKS,
  OPERATING_STEPS,
  readbackState,
} from '../src/v2/demo-model';

describe('AXIO operating flow', () => {
  it('blocks dispatch when script capability is not verified', () => {
    expect(GOVERNANCE_CHECKS.at(-1)).toEqual(['脚本能力', '阻断']);
  });

  it('places result readback after execution checks', () => {
    expect(OPERATING_STEPS.indexOf('结果回读')).toBeGreaterThan(
      OPERATING_STEPS.indexOf('上新检查'),
    );
  });

  it('exposes verified only after readback completes', () => {
    expect(readbackState(179).status).not.toBe('verified');
    expect(readbackState(180).status).toBe('verified');
  });
});
```

- [ ] **Step 2: Run the flow test and verify the intended red state**

```powershell
rtk npm test -- tests/v2-operating-flow.test.ts
```

Expected: FAIL until the readback threshold and operating order exactly match the contract.

- [ ] **Step 3: Implement the three causal scenes**

Plan scene phases:

```ts
const PLAN_PHASES = [
  {from: 0, title: '目标进入', focus: '商品与站点'},
  {from: 120, title: '成本展开', focus: '采购 · 汇率 · 平台费 · 物流'},
  {from: 260, title: '利润校验', focus: '目标毛利 22%'},
  {from: 400, title: '验收生成', focus: '证据 · 条件 · 回读'},
] as const;
```

Governance must animate checks in order, with the final blocked row occupying the focal panel and the dispatch status remaining `未派发`. Readback must advance one operating step at a time, then switch to `readbackState(frame)`. Do not render `已验证` while `status !== 'verified'`.

Each scene must use the full console canvas. Limit each visible phase to one headline, one active panel, and no more than three supporting facts.

- [ ] **Step 4: Run tests and typecheck**

```powershell
rtk npm test -- tests/v2-operating-flow.test.ts tests/v2-evidence.test.ts tests/v2-film.test.ts
rtk npm run typecheck
```

Expected: PASS and TypeScript exits 0.

- [ ] **Step 5: Render and inspect operating stills**

```powershell
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-plan.png --frame=1160
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-governance.png --frame=1740
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-readback.png --frame=2070
```

Expected: no full-page screenshot treatment; current task, block state, and readback result are readable at embedded playback size.

- [ ] **Step 6: Commit the operating flow**

```powershell
rtk git add src/v2/scenes/WebsiteScenes.tsx src/v2/demo-model.ts tests/v2-operating-flow.test.ts
rtk git commit -m "feat(video): animate governed AXIO operating flow"
```

---

### Task 5: Rebuild Capability Progression And Brand Close

**Files:**
- Modify: `src/v2/scenes/WebsiteScenes.tsx`
- Modify: `src/v2/copy.ts`
- Modify: `src/v2/timeline.ts`
- Modify: `scripts/generate-v2-audio.ps1`
- Test: `tests/v2-closing.test.ts`
- Test: `tests/v2-audio-generator.test.ts`

**Interfaces:**
- Produces: `WebsiteVisionScene` and `WebsiteBrandScene`.
- Consumes: `CAPABILITY_STAGES`, `FUTURE_CAPABILITY_LABEL`, `FINAL_BRAND_*`, and `readbackState`.

- [ ] **Step 1: Write the failing close contract test**

```ts
// tests/v2-closing.test.ts
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {websiteV2} from '../src/v2/timeline';
import {FINAL_BRAND_VOICE, FUTURE_CAPABILITY_LABEL} from '../src/v2/copy';

describe('AXIO capability and brand close', () => {
  it('labels future capability throughout the vision scene', () => {
    const source = readFileSync('src/v2/scenes/WebsiteScenes.tsx', 'utf8');
    expect(source).toContain('{FUTURE_CAPABILITY_LABEL}');
    expect(FUTURE_CAPABILITY_LABEL).toBe('规划能力 / 尚未开放');
  });

  it('ends with the approved AXIO line', () => {
    expect(websiteV2.scenes.at(-1)?.voice).toBe(FINAL_BRAND_VOICE);
    const generator = readFileSync('scripts/generate-v2-audio.ps1', 'utf8');
    expect(generator).toContain(FINAL_BRAND_VOICE);
  });
});
```

- [ ] **Step 2: Run the close tests and verify failure**

```powershell
rtk npm test -- tests/v2-closing.test.ts tests/v2-audio-generator.test.ts
```

Expected: FAIL until the final narration and visible future label are synchronized.

- [ ] **Step 3: Implement capability and closing scenes**

Vision scene must emphasize `当前 / 受控执行`, show `下一步 / 逐项验收开放` secondarily, and keep `规划能力 / 尚未开放` attached to the future surface for its entire visible period. Use `7×24 受监督运营`, never `7×24 无人值守`.

Brand close sequence:

```tsx
const result = readbackState(Math.max(0, frame - 18));
return (
  <Stage orange>
    <CameraSurface progress={range(frame, 0, 150)}>
      <CinematicConsole section='结果回读' title={result.label}>
        <StatusChip status={result.status === 'verified' ? 'pass' : 'active'}>
          {result.label}
        </StatusChip>
      </CinematicConsole>
    </CameraSurface>
    <ImpactText delay={84}>{FINAL_BRAND_PRIMARY}</ImpactText>
    <div>{FINAL_BRAND_SECONDARY}</div>
    <VoiceCaption light>{FINAL_BRAND_VOICE}</VoiceCaption>
  </Stage>
);
```

The AXIO mark must settle by local frame 205 and remain still through frame 239. The current-capability disclosure must use native text at a minimum 30 px in the 4K composition.

- [ ] **Step 4: Synchronize and regenerate changed narration**

Update the website brand entry and corresponding WeChat closing entry in `scripts/generate-v2-audio.ps1`. Retain voice `zh-CN-YunxiNeural`, base rate `-3%`, pitch `-2Hz`, retry behavior, `volume=7.5dB`, and the existing limiter.

Run:

```powershell
rtk powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/generate-v2-audio.ps1
```

Expected: all clips fit their scene durations and the script reports success without raw temporary WAV files remaining.

- [ ] **Step 5: Run tests, typecheck, and render closing stills**

```powershell
rtk npm test -- tests/v2-closing.test.ts tests/v2-audio-generator.test.ts tests/v2-continuous-operations-narration.test.ts
rtk npm run typecheck
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-vision.png --frame=2290
rtk npx remotion still src/index.ts AXIO-Website-V2-4K out/review/website-close.png --frame=2620
```

Expected: tests PASS; future labeling is explicit; the close shows `这就是 AXIO` and `有计划 · 有边界 · 有回读` without competing promotional text.

- [ ] **Step 6: Commit the website close and audio**

```powershell
rtk git add src/v2/scenes/WebsiteScenes.tsx src/v2/copy.ts src/v2/timeline.ts scripts/generate-v2-audio.ps1 public/audio/v2 tests/v2-closing.test.ts tests/v2-audio-generator.test.ts tests/v2-continuous-operations-narration.test.ts
rtk git commit -m "feat(video): add verified AXIO brand close"
```

---

### Task 6: Build The Independent Portrait Composition

**Files:**
- Create: `src/v2/scenes/PortraitScenes.tsx`
- Modify: `src/v2/WechatV2.tsx`
- Test: `tests/v2-portrait-scenes.test.ts`

**Interfaces:**
- Produces: `PortraitOrganizationScene`, `PortraitProofScene`, `PortraitOperatingScene`, `PortraitGovernanceScene`, and `PortraitCloseScene`.
- Consumes: shared console primitives and the same demonstration contracts, but no website scene component.

- [ ] **Step 1: Write the failing portrait independence test**

```ts
// tests/v2-portrait-scenes.test.ts
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('AXIO portrait composition', () => {
  const portrait = () => readFileSync('src/v2/scenes/PortraitScenes.tsx', 'utf8');
  const entry = () => readFileSync('src/v2/WechatV2.tsx', 'utf8');

  it('exports five portrait-specific scenes', () => {
    expect(portrait().match(/export const Portrait\w+Scene/g)).toHaveLength(5);
  });

  it('does not import website scenes or use full-page contain', () => {
    expect(portrait()).not.toContain('WebsiteScenes');
    expect(portrait()).not.toContain("objectFit: 'contain'");
    expect(entry()).toContain("from './scenes/PortraitScenes'");
  });

  it('uses the approved close instead of trial promotion', () => {
    expect(portrait()).toContain('FINAL_BRAND_PRIMARY');
    expect(portrait()).not.toContain('免费试用 7 天');
  });
});
```

- [ ] **Step 2: Run the portrait test and verify failure**

```powershell
rtk npm test -- tests/v2-portrait-scenes.test.ts
```

Expected: FAIL because `PortraitScenes.tsx` is missing.

- [ ] **Step 3: Implement portrait-specific choreography**

- Organization: vertical sequence `创始人 → ACCIO 超级主管 → AI 主管 → G1/G2`, one relationship per beat.
- Proof: evidence crop for at most 45 local frames, then alternate the `116` and `6` metrics with a one-column demo store queue.
- Operating: reveal one step at a time in a full-width task panel; never show a compressed wide table.
- Governance: use a full-screen pass/block state and keep `未派发` visible when the capability check blocks.
- Close: finish readback, then use the same approved AXIO closing line and a readable current-capability disclosure.

Refactor `WechatV2.tsx` to audio and sequence orchestration only. Keep starts `[0, 240, 420, 900, 1200]` and total duration 1500 frames.

- [ ] **Step 4: Run portrait and timeline tests**

```powershell
rtk npm test -- tests/v2-portrait-scenes.test.ts tests/v2-timeline.test.ts tests/v2-organization.test.ts
rtk npm run typecheck
```

Expected: PASS and TypeScript exits 0.

- [ ] **Step 5: Render one still per portrait scene**

```powershell
rtk npx remotion still src/index.ts AXIO-WeChat-V2-Vertical out/review/wechat-organization.png --frame=150
rtk npx remotion still src/index.ts AXIO-WeChat-V2-Vertical out/review/wechat-proof.png --frame=340
rtk npx remotion still src/index.ts AXIO-WeChat-V2-Vertical out/review/wechat-operating.png --frame=700
rtk npx remotion still src/index.ts AXIO-WeChat-V2-Vertical out/review/wechat-governance.png --frame=1060
rtk npx remotion still src/index.ts AXIO-WeChat-V2-Vertical out/review/wechat-close.png --frame=1470
```

Expected: every scene has one visual center; all critical labels are readable at phone size; no horizontal screenshot letterboxing remains.

- [ ] **Step 6: Commit portrait composition**

```powershell
rtk git add src/v2/scenes/PortraitScenes.tsx src/v2/WechatV2.tsx tests/v2-portrait-scenes.test.ts
rtk git commit -m "feat(video): rebuild AXIO portrait choreography"
```

---

### Task 7: Add Deterministic Review Frames And Visual Acceptance

**Files:**
- Create: `src/v2/review-frames.ts`
- Create: `scripts/render-v2-review-stills.mjs`
- Modify: `scripts/verify-v2-renders.mjs`
- Test: `tests/v2-review-frames.test.ts`

**Interfaces:**
- Produces: `WEBSITE_REVIEW_FRAMES` and `WECHAT_REVIEW_FRAMES` as the single source for still review and video sampling.
- Consumes: composition IDs and existing output paths.

- [ ] **Step 1: Write the failing review coverage test**

```ts
// tests/v2-review-frames.test.ts
import {describe, expect, it} from 'vitest';
import {websiteV2, wechatV2} from '../src/v2/timeline';
import {WEBSITE_REVIEW_FRAMES, WECHAT_REVIEW_FRAMES} from '../src/v2/review-frames';

describe('V2 review-frame coverage', () => {
  it('samples every website scene and both organization beats', () => {
    for (const scene of websiteV2.scenes) {
      expect(WEBSITE_REVIEW_FRAMES.some(({frame}) =>
        frame >= scene.from && frame < scene.from + scene.duration,
      )).toBe(true);
    }
    expect(WEBSITE_REVIEW_FRAMES.filter(({id}) => id.startsWith('organization'))).toHaveLength(2);
  });

  it('samples every portrait scene', () => {
    for (const scene of wechatV2.scenes) {
      expect(WECHAT_REVIEW_FRAMES.some(({frame}) =>
        frame >= scene.from && frame < scene.from + scene.duration,
      )).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run review coverage test and verify failure**

```powershell
rtk npm test -- tests/v2-review-frames.test.ts
```

Expected: FAIL because `review-frames.ts` is missing.

- [ ] **Step 3: Implement canonical review frames**

```ts
// src/v2/review-frames.ts
export const WEBSITE_REVIEW_FRAMES = [
  {id: 'command', frame: 90},
  {id: 'organization-supervision', frame: 210},
  {id: 'organization-execution', frame: 360},
  {id: 'positioning', frame: 520},
  {id: 'proof', frame: 760},
  {id: 'plan', frame: 1160},
  {id: 'governance', frame: 1740},
  {id: 'readback', frame: 2070},
  {id: 'vision', frame: 2290},
  {id: 'brand', frame: 2620},
] as const;

export const WECHAT_REVIEW_FRAMES = [
  {id: 'organization', frame: 150},
  {id: 'proof', frame: 340},
  {id: 'operating', frame: 700},
  {id: 'governance', frame: 1060},
  {id: 'close', frame: 1470},
] as const;
```

`render-v2-review-stills.mjs` must iterate these arrays, call Remotion still with the corresponding composition, and write to `out/review/`. Update `verify-v2-renders.mjs` to derive `sampleFrames` from the same arrays rather than duplicate frame numbers.

- [ ] **Step 4: Run tests and generate all review stills**

```powershell
rtk npm test -- tests/v2-review-frames.test.ts tests/v2-timeline.test.ts
rtk node scripts/render-v2-review-stills.mjs
```

Expected: PASS and 15 named PNG files appear under `out/review/`.

- [ ] **Step 5: Perform the visual acceptance pass**

Review all 15 stills and reject any frame with:

- screenshot text required for comprehension;
- unexplained side margins or aspect-ratio gaps;
- role, status, or disclosure text that is unreadable at normal playback size;
- text that exceeds or fails to align with its panel;
- more than one competing visual center;
- future capability missing `规划能力 / 尚未开放`;
- `已验证` shown before an explicit readback.

Fix the responsible scene, regenerate its still, and repeat until every criterion passes.

- [ ] **Step 6: Commit review automation**

```powershell
rtk git add src/v2/review-frames.ts scripts/render-v2-review-stills.mjs scripts/verify-v2-renders.mjs tests/v2-review-frames.test.ts
rtk git commit -m "test(video): add cinematic frame review coverage"
```

---

### Task 8: Render, Verify, And Independently Review Both Deliverables

**Files:**
- Modify only if verification exposes a defect: the scene, test, audio, or verification file that owns that defect.
- Generate: `out/AXIO-website-v2-4k.mp4`
- Generate: `out/AXIO-wechat-v2-vertical.mp4`
- Generate: `out/v2-acceptance-report.json`

**Interfaces:**
- Consumes: both V2 Remotion compositions, final audio, review frames, and the existing verifier.
- Produces: technically verified website and portrait MP4 files plus the acceptance report.

- [ ] **Step 1: Run the complete automated suite**

```powershell
rtk npm test
rtk npm run typecheck
rtk node ../../scripts/check-video-assets.mjs
```

Expected: all tests PASS, TypeScript exits 0, and asset validation reports no missing or invalid media.

- [ ] **Step 2: Render both final films**

```powershell
rtk npm run render:website:v2
rtk npm run render:wechat:v2
```

Expected: both commands exit 0 and replace only the named V2 output files.

- [ ] **Step 3: Run technical render verification**

```powershell
rtk npm run verify:renders:v2
```

Expected:

- Website: 3840×2160, 30 fps, H.264, yuv420p, BT.709, AAC 48 kHz, duration 87.9-88.2 seconds.
- WeChat: 1080×1920, 30 fps, H.264, yuv420p, BT.709, AAC 48 kHz, duration 48-52 seconds.
- Both: faststart, integrated loudness between -17 and -15 LUFS, true peak no higher than -1 dBTP, all review samples nonblank.

- [ ] **Step 4: Decode both files completely**

```powershell
rtk ffmpeg -v error -i out/AXIO-website-v2-4k.mp4 -f null NUL
rtk ffmpeg -v error -i out/AXIO-wechat-v2-vertical.mp4 -f null NUL
```

Expected: no decode errors.

- [ ] **Step 5: Conduct the required independent final review**

Provide the reviewer with both MP4s, all review stills, the approved design, this plan, authority rules, narration, demonstration-data boundary, and final-review criteria. Resolve all Critical and High findings before delivery. Record Medium findings that cannot be independently verified as explicit release caveats.

- [ ] **Step 6: Record reusable lessons**

Append confirmed rules to the existing video manual or regression tests:

- full-page `contain` screenshots are evidence only, not explanatory scenes;
- horizontal and portrait layouts require independent compositions;
- critical copy must be native text at playback-readable scale;
- configured state is not completed state without authoritative readback.

- [ ] **Step 7: Confirm only intended delivery artifacts changed**

`powershell
rtk git status --short
rtk git diff --check
`

Expected: no whitespace errors; any source defect found during final verification was already fixed, retested, and committed with only its exact owning files. Do not add unrelated website files, pre-existing untracked plans, or screen recordings.
