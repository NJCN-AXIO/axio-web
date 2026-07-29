import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {SFX} from '../src/v2/ink/audio';
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
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every(({residualFrames}: {residualFrames: number}) => Math.abs(residualFrames) <= 3)).toBe(true);
    }
  });
  it('pins every SFX to an exported visual action and aligns outro impact and sparkle', async () => {
    const {VISUAL_ACTION_FRAMES} = await import('../src/v2/action-contract');
    for (const format of ['website', 'wechat'] as const) {
      const actionFrames = VISUAL_ACTION_FRAMES[format] as Record<string, number>;
      for (const cue of SFX[format]) {
        expect(cue.action).toBeTypeOf('string');
        expect(cue.from).toBe(actionFrames[cue.action]);
      }
    }
    const cueFrame = (format: 'website' | 'wechat', src: string) => SFX[format].find((cue) => cue.src === src)?.from;
    expect(cueFrame('website', 'impact-deep-whoosh.mp3')).toBe(1497);
    expect(cueFrame('website', 'shimmer-sparkle-sweep.mp3')).toBe(1504);
    expect(cueFrame('wechat', 'impact-deep-whoosh.mp3')).toBe(1137);
    expect(cueFrame('wechat', 'shimmer-sparkle-sweep.mp3')).toBe(1144);
  });
});
