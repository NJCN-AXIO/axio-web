import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {websiteV2} from '../src/v2/timeline';
import {WEBSITE_SHOT_RECIPES} from '../src/v2/ink/WebsiteShots';
import {dealMotionAt, documentRevealAt, outroMotionAt, rowEmbedAt, stackPressAt, textSizeForFrame} from '../src/v2/ink/InkPrimitives';

const websiteShotsPath = 'src/v2/ink/WebsiteShots.tsx';
const source = () => existsSync(websiteShotsPath) ? readFileSync(websiteShotsPath, 'utf8') : '';

describe('AXIO website Ink Press shots', () => {
  it('provides the dedicated landscape shot renderer', () => {
    expect(existsSync(websiteShotsPath)).toBe(true);
  });

  it('maps every website timeline shot exactly once to its approved recipes', () => {
    expect(WEBSITE_SHOT_RECIPES).toEqual(Object.fromEntries(websiteV2.shots.map(({id, recipe}) => [id, Array.isArray(recipe) ? recipe : [recipe]])));
    expect(Object.keys(WEBSITE_SHOT_RECIPES)).toEqual(websiteV2.shots.map(({id}) => id));
    expect(new Set(Object.keys(WEBSITE_SHOT_RECIPES)).size).toBe(13);
    const cases = [...source().matchAll(/case '([^']+)'/g)].map((match) => match[1]);
    expect(cases).toEqual(websiteV2.shots.map(({id}) => id));
  });

  it('uses real AXIO evidence pages, live coordinates, and 4x cutouts', () => {
    const text = source();
    for (const asset of [
      'dashboard-page.png', 'dashboard-goal-card-4x.png',
      'supervisor-page.png', 'supervisor-readback-row-4x.png',
      'accio-overview-page.png', 'accio-overview-authority-row-4x.png',
      'accio-governance-page.png', 'accio-capabilities-capability-state-4x.png',
      'matrix-pricing-page.png', 'matrix-pricing-pricing-row-4x.png',
    ]) expect(text).toContain(asset);
    expect(text).toContain('InkHeroSpotlight');
    expect(text).toContain("import liveLayout from './live-layout.json'");
    expect(text).not.toContain("objectFit: 'contain'");
  });

  it('renders calibrated deal, embed, stack, and document actions', () => {
    const early = dealMotionAt(18, 180, 6, 4);
    const late = dealMotionAt(165, 180, 6, 4);
    expect(early.cardProgress.some((progress) => progress > 0 && progress < 1)).toBe(true);
    expect(late.cardProgress).toEqual(Array(6).fill(1));
    expect(late).toMatchObject({typedChars: 4, filtered: true, click: 1});
    const gaps = late.cardCues.slice(1).map((cue, index) => cue - late.cardCues[index]);
    expect(gaps.every((gap, index) => index === 0 || gap <= gaps[index - 1])).toBe(true);
    expect(rowEmbedAt(0, 96, 5).filter((value) => value > 0)).toHaveLength(0);
    expect(rowEmbedAt(81, 96, 5)).toEqual(Array(5).fill(1));
    expect(stackPressAt(18, 120, 6).some((entry) => entry.progress > 0)).toBe(true);
    expect(stackPressAt(105, 120, 6).every((entry) => entry.progress === 1 && entry.press === 0)).toBe(true);
    expect(documentRevealAt(54, 120, 5).verified).toBe(false);
    expect(documentRevealAt(105, 120, 5)).toMatchObject({rowsSettled: 5, verified: true});
  });

  it('meets text-height contracts and freezes the final website hold', () => {
    expect(textSizeForFrame(2160, 'narrative')).toBeGreaterThanOrEqual(113);
    expect(textSizeForFrame(2160, 'support')).toBeGreaterThanOrEqual(65);
    const holdStart = outroMotionAt(150, 270, 9, 120);
    expect(holdStart.stable).toBe(true);
    expect(outroMotionAt(210, 270, 9, 120)).toEqual(holdStart);
    expect(outroMotionAt(269, 270, 9, 120)).toEqual(holdStart);
    expect(holdStart.itemProgress).toEqual(Array(9).fill(1));
    expect(holdStart.brand).toBe(1);
  });

  it('keeps authority, capability, and readback claims in their approved order', () => {
    const text = source();
    expect(text).toContain('ROLE_COPY.dispatcher');
    expect(text).toContain('ROLE_COPY.governor');
    expect(text).toContain('G1 / G2');
    expect(text).toContain('确定性执行 · 独立回读');
    expect(text).toContain('FUTURE_CAPABILITY');
    expect(text.indexOf('authoritativeReadback')).toBeLessThan(text.indexOf('verified'));
  });

  it('holds the outro brand and disclosure for the final 120 frames', () => {
    const text = source();
    expect(text).toContain('OUTRO_HOLD_FROM = 150');
    expect(text).toContain('holdFrames={120}');
    expect(text).toContain('WEBSITE_EXPERIENCE_DISCLOSURE');
  });
});
