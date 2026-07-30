import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {getOutroLocalActionFrames, VISUAL_ACTION_FRAMES} from '../src/v2/action-contract';
import {SFX} from '../src/v2/ink/audio';
import {outroMotionAt} from '../src/v2/ink/InkPrimitives';
import {websiteV2, wechatV2} from '../src/v2/timeline';

const beatReport = JSON.parse(readFileSync('out/v2-beat-report.json', 'utf8'));

describe('AXIO beat-synced audio layer', () => {
  it('provides deterministic beat analysis and a reusable audio component', () => {
    expect(existsSync('scripts/analyze-v2-beats.mjs')).toBe(true);
    expect(existsSync('src/v2/ink/audio.tsx')).toBe(true);
  });
  it('gates only BGM and retains narration plus SFX', () => {
    const source = existsSync('src/v2/ink/audio.tsx') ? readFileSync('src/v2/ink/audio.tsx','utf8') : '';
    expect(source).toContain('bgm ?');
    expect(source).toContain('NARRATION');
    expect(source).toContain('SFX');
    expect(source).toContain('house-vibez.mp3');
  });
  it('records traceable music attribution and no untraceable riser', () => {
    const path='public/audio/v2/ATTRIBUTION.md';
    const text=existsSync(path)?readFileSync(path,'utf8'):'';
    expect(text).toContain('House Vibez');
    expect(text).toContain('Lily J');
    expect(text).toContain('https://assets.mixkit.co/music/745/745.mp3');
    expect(text).not.toContain('riser-cine.mp3');
  });
  it('proves every real hard cut and primary action is within the beat error gate', () => {
    const timelines = {website: websiteV2, wechat: wechatV2};
    expect(beatReport.beatSubdivision).toBe(4);
    for (const [format, timeline] of Object.entries(timelines)) {
      const cuts = beatReport.cutResiduals[format];
      expect(cuts.map(({frame}: {frame: number}) => frame)).toEqual(timeline.shots.slice(1).map(({from}) => from));
      expect(cuts.every(({residualFrames}: {residualFrames: number}) => Math.abs(residualFrames) <= 3)).toBe(true);
      const actions = beatReport.actionResiduals[format];
      expect(actions.map(({id}: {id: string}) => id)).toEqual(Object.keys(VISUAL_ACTION_FRAMES[format as keyof typeof VISUAL_ACTION_FRAMES]));
      expect(actions.every(({residualFrames}: {residualFrames: number}) => Math.abs(residualFrames) <= 3)).toBe(true);
    }
  });
  it('pins every SFX to an exported visual action and covers each primary visual action', async () => {
    for (const format of ['website', 'wechat'] as const) {
      const actionFrames = VISUAL_ACTION_FRAMES[format] as Record<string, number>;
      for (const cue of SFX[format]) {
        expect(cue.action).toBeTypeOf('string');
        expect(cue.from).toBe(actionFrames[cue.action]);
      }
    }
    expect(Object.keys(VISUAL_ACTION_FRAMES.website)).toEqual(expect.arrayContaining([
      'plan-deal', 'plan-filter', 'pricing-row-embed', 'governance-stack',
      'readback-document', 'readback-verified', 'capability-row-embed',
    ]));
    expect(Object.keys(VISUAL_ACTION_FRAMES.wechat)).toEqual(expect.arrayContaining([
      'plan-deal', 'plan-filter', 'pricing-row-embed', 'governance-stack',
      'readback-document', 'readback-verified', 'capability-row-embed',
    ]));
    for (const format of ['website', 'wechat'] as const) {
      const cueActions = SFX[format].map((cue) => cue.action);
      for (const action of [
        'plan-deal', 'plan-filter', 'pricing-row-embed', 'governance-stack',
        'readback-document', 'readback-verified', 'capability-row-embed',
      ]) {
        expect(cueActions).toContain(action);
      }
    }
  });

  it('aligns the outro sound sentence with the current visual settle and freeze timing', () => {
    const cueFrame = (format: 'website' | 'wechat', src: string) => SFX[format].find((cue) => cue.src === src)?.from;
    expect(cueFrame('website', 'impact-deep-whoosh.mp3')).toBe(1372);
    expect(cueFrame('website', 'shimmer-sparkle-sweep.mp3')).toBe(1386);
    expect(cueFrame('wechat', 'impact-deep-whoosh.mp3')).toBe(1102);
    expect(cueFrame('wechat', 'shimmer-sparkle-sweep.mp3')).toBe(1116);

    const riser = (format: 'website' | 'wechat') => SFX[format].find((cue) => cue.action === 'outro-riser');
    expect(riser('website')?.duration).toBe(112);
    expect(riser('wechat')?.duration).toBe(82);

    for (const [format, duration, holdFrames, shotFrom] of [
      ['website', 270, 120, 1260],
      ['wechat', 150, 30, 1020],
    ] as const) {
      const localActions = getOutroLocalActionFrames(duration, holdFrames, 9);
      const impactLocal = cueFrame(format, 'impact-deep-whoosh.mp3')! - shotFrom;
      const sparkleLocal = cueFrame(format, 'shimmer-sparkle-sweep.mp3')! - shotFrom;
      expect(impactLocal).toBe(localActions.impact);
      expect(sparkleLocal).toBe(localActions.sparkle);
      expect(localActions.impact).toBeLessThan(localActions.stable);
      expect(localActions.sparkle).toBeLessThan(localActions.stable);
      expect(outroMotionAt(impactLocal, duration, 9, holdFrames).brand).toBe(0);
      expect(outroMotionAt(impactLocal + 1, duration, 9, holdFrames).brand).toBeGreaterThan(0);
      expect(outroMotionAt(sparkleLocal, duration, 9, holdFrames).rule).toBe(0);
      expect(outroMotionAt(sparkleLocal + 1, duration, 9, holdFrames).rule).toBeGreaterThan(0);
      const formatRiser = riser(format);
      expect(formatRiser).toBeDefined();
      expect(formatRiser!.from + formatRiser!.duration!).toBe(cueFrame(format, 'impact-deep-whoosh.mp3'));
      expect(formatRiser!.duration).toBe(localActions.impact);
    }
  });
});
