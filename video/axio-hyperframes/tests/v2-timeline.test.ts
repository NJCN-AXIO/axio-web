import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {FOUNDER_BACKGROUND} from '../src/v2/copy';
import {websiteV2, wechatV2} from '../src/v2/timeline';

const ranges = (timeline: typeof websiteV2 | typeof wechatV2) =>
  timeline.shots.map(({id, from, duration}) => ({id, from, duration}));

describe('AXIO V2 Ink Press timeline', () => {
  it('uses the approved 51-second website shot table', () => {
    expect(websiteV2.frames).toBe(1530);
    expect(ranges(websiteV2)).toEqual([
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
  });

  it('uses the approved independent 39-second portrait shot table', () => {
    expect(wechatV2.frames).toBe(1170);
    expect(wechatV2.layout).toBe('portrait-independent');
    expect(ranges(wechatV2)).toEqual([
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
  });

  it.each([websiteV2, wechatV2])('keeps shots contiguous and narration inside the film', (timeline) => {
    expect(timeline.shots[0]?.from).toBe(0);
    for (let index = 1; index < timeline.shots.length; index += 1) {
      const previous = timeline.shots[index - 1];
      expect(timeline.shots[index]?.from).toBe(previous.from + previous.duration);
    }
    const finalShot = timeline.shots.at(-1);
    expect(finalShot && finalShot.from + finalShot.duration).toBe(timeline.frames);
    for (const cue of timeline.narration) {
      expect(cue.from).toBeGreaterThanOrEqual(0);
      expect(cue.duration).toBeGreaterThan(0);
      expect(cue.from + cue.duration).toBeLessThanOrEqual(timeline.frames);
    }
  });

  it('gives founder context and capability boundaries one speakable website window', () => {
    expect(websiteV2.narration.map((cue) => cue.id)).toEqual([
      'website-open',
      'website-goal-plan',
      'website-governance',
      'website-readback',
      'website-control-founder',
      'website-outro',
    ]);
    const boundary = websiteV2.narration.find((cue) => cue.id === 'website-control-founder');
    expect(boundary).toMatchObject({from: 1008, duration: 252});
    expect(boundary?.text).toContain(FOUNDER_BACKGROUND);
    expect(websiteV2.narration.some((cue) => cue.id === 'website-founder-proof')).toBe(false);
    expect(wechatV2.narration.find((cue) => cue.id === 'wechat-open')?.text).not.toContain(FOUNDER_BACKGROUND);
  });

  it('keeps a temporary legacy scene view for the old renderers', () => {
    expect(websiteV2.scenes.map((scene) => scene.id)).toEqual([
      'command', 'organization-boot', 'positioning', 'proof', 'plan',
      'governance', 'readback', 'vision', 'brand',
    ]);
    expect(wechatV2.scenes.map((scene) => scene.id)).toEqual([
      'organization', 'proof', 'operating', 'governance', 'trial',
    ]);
  });

  it('keeps Remotion V2 composition durations synchronized with their timelines', () => {
    const root = readFileSync('src/Root.tsx', 'utf8');
    expect(root).toContain('durationInFrames={websiteV2.frames}');
    expect(root).toContain('durationInFrames={wechatV2.frames}');
  });

  it('renders both delivery formats with the required pixel format and color space', () => {
    const packageJson = readFileSync('package.json', 'utf8');
    expect(packageJson.match(/render:(website|wechat):v2[^\n]+--pixel-format=yuv420p/g) ?? []).toHaveLength(4);
    expect(packageJson.match(/render:(website|wechat):v2[^\n]+--color-space=bt709/g) ?? []).toHaveLength(4);
    expect(packageJson).toContain('render:website:v2:nobgm');
    expect(packageJson).toContain('render:wechat:v2:nobgm');
  });
});
