# AXIO Cinematic UI Rebuild Design

## Goal

Rebuild the website and WeChat videos so they feel like a cinematic product demonstration instead of a slideshow of webpage screenshots. Keep the existing narration, approximate duration, music, governance boundaries, and Chinese role names. Replace most full-page screenshot presentation with video-native AXIO interface scenes derived from the real product's structure and visual language.

## Approved Direction

Use a hybrid of real evidence and reconstructed interface scenes:

- Real screenshots establish that the product and workflow exist.
- Reconstructed interfaces explain the workflow at a readable scale.
- Demonstration data is fictional or desensitized.
- Website and portrait cuts use independent compositions.
- Each shot communicates one action or decision.

The reconstructed interface is not a second product design. It is a video-specific representation of the existing AXIO product, using the same business concepts, color system, hierarchy, and operating model.

## Visual Language

Create a coherent AXIO operating console around five recurring surfaces:

1. Command input
2. Operating plan
3. Governance and approval
4. Deterministic execution
5. Authoritative readback

Interface motion must show a causal sequence: a command enters, AXIO forms a plan, governance gates check it, an authorized executor runs it, and the result is read back. Avoid full-page fade-ins, repeated card fly-ins, and motion without a business meaning.

Product UI should occupy the useful frame instead of sitting inside a small centered container. Empty space must carry a headline, current task state, metric, or next action. No scene may use decorative side margins that weaken the focal subject.

## Readability Rules

- Do not rely on text embedded in a scaled full-page screenshot.
- Rebuild all audience-critical labels as native Remotion text.
- Show one primary message and no more than three supporting facts at once.
- Split the organization view into two beats instead of displaying all eight nodes at once.
- Verify website frames at normal embedded playback size and portrait frames at phone size.
- Disclosures and capability labels must remain readable without pausing or zooming.
- Text must fit its panel without truncation, crowding, or mismatched borders.

## Evidence And Data Boundaries

- Real screenshots appear briefly and carry the label `真实界面记录`.
- Reconstructed surfaces carry fictional or desensitized demonstration data.
- Do not reproduce customer names, credentials, private tenant data, or live operational state.
- Do not imply that a configured action completed. A completion state appears only after an explicit result readback.
- Future capability remains labeled `规划能力 / 尚未开放` throughout the relevant shot.
- G1 and G2 are deterministic executors dispatched by `AI 主管`; their results are independently read back and remain under `ACCIO 超级主管` supervision.

## Website Shot Design

### 1. Command

Open inside a full-frame AXIO command console. The user enters an operating objective. A structured scope begins forming beside it while the camera advances into the interface. The visual must make clear that this is an advanced future vision where applicable.

### 2. Organization Boot

First reveal `ACCIO 超级主管` and `AI 主管`, including the supervision and dispatch relationship. In the second beat, reveal specialist agents and deterministic executors. Replace small English authority labels with Chinese-first labels.

### 3. Positioning

Retain the strong positioning statement, but place a working control surface behind or around it. This prevents the scene from becoming a standalone title slide.

### 4. Operating Evidence

Briefly show the real interface with the evidence label. Then extract the relevant shop, site, and tenant concepts into a full-frame operating matrix. Present metrics as large native text rather than text inside the screenshot.

### 5. Plan Formation

Transform the objective into product, site, quantity, cost, profit, evidence, and acceptance steps. Follow the active step with the camera. Do not display the entire source page at once.

### 6. Governance

Use a reconstructed risk-control center. Prohibited terms, brand, image, profit, tenant permissions, and script capability are checked in sequence. A blocked condition takes over the focal area and prevents dispatch.

### 7. Execution Readback

Show order synchronization, cleanup checks, capacity checks, price checks, listing checks, and result readback as a continuous operating loop. State changes must be driven by authoritative results rather than decorative progress.

### 8. Current And Future Capability

Use a capability progression track. Current controlled execution receives the strongest emphasis. Future capability is visibly marked `规划能力 / 尚未开放`; do not describe it as currently unattended or released.

### 9. Brand Close

Complete a final result readback, show `已验证`, then pull the camera back as the console resolves into the AXIO mark. Use the closing voiceover:

> 这就是 AXIO。让每一次经营决策，都有计划、有边界、有回读。

On-screen copy:

- Primary: `这就是 AXIO`
- Secondary: `有计划 · 有边界 · 有回读`

Hold the resolved mark for approximately one second after the final spoken line. Keep the current-capability disclosure readable and remove competing promotional copy.

## WeChat Portrait Design

The portrait cut is an independent composition, not a scaled website layout.

- Organization becomes a vertical supervision and dispatch sequence.
- Evidence alternates between large metrics and close interface details.
- Plan formation advances one step at a time down the screen.
- Governance uses full-screen pass, block, and readback states.
- Wide tables become focused task panels, steppers, or single-column queues.
- The close uses the same AXIO line and current-capability disclosure.

## Audio And Timing

- Keep the current narration structure, approximate total duration, voice, BGM, and sound-design bed.
- Update only the final sentence to the approved AXIO closing line.
- Preserve beat synchronization where possible.
- Retiming should come from redistributing action within existing scenes rather than extending the full film.
- UI sounds must correspond to visible input, approval, block, execution, or readback events.

## Implementation Boundaries

- Replace the generic `EvidenceLens` full-page `contain` treatment with shot-specific reconstructed surfaces and deliberate evidence crops.
- Reuse the existing timeline, authority model, theme tokens, audio generator, render scripts, and verification workflow.
- Do not create a parallel video pipeline.
- Keep deterministic animation and avoid time-based randomness.
- Preserve unrelated worktree changes.

## Verification

For both website and WeChat outputs:

1. Render a still from every shot before the full render.
2. Review contact sheets at realistic display sizes.
3. Confirm critical labels are readable without zooming.
4. Confirm there are no unexplained side margins or aspect-ratio gaps.
5. Confirm text fits panels and borders align with their contents.
6. Confirm real screenshots and reconstructed scenes are distinguishable.
7. Confirm fictional or desensitized data is used in reconstructed scenes.
8. Confirm future capabilities remain labeled as unreleased.
9. Confirm completion follows authoritative readback.
10. Run timeline tests, TypeScript checks, render verification, full decode checks, and independent final review.

## Success Criteria

The result should feel like the viewer entered a working AXIO operating system. The audience can understand the command, planning, governance, execution, and readback loop without reading a full webpage. Real evidence preserves credibility, while reconstructed scenes provide clear, cinematic communication in both horizontal and vertical formats.
