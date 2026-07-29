import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {websiteV2, wechatV2} from '../src/v2/timeline';
import {WEBSITE_FRAMES, buildStillPlan, validateFramePlan, validateTextBounds} from '../scripts/render-v2-stills.mjs';

const timelines = {
  website: {frames: websiteV2.frames, shots: websiteV2.shots},
  wechat: {frames: wechatV2.frames, shots: wechatV2.shots},
};

describe('AXIO V2 visual acceptance pipeline', () => {
  const plan = buildStillPlan(timelines);

  it('uses the explicit website frames and formula-driven portrait frames', () => {
    expect(plan.filter((entry) => entry.format === 'website').map((entry) => entry.frame)).toEqual(WEBSITE_FRAMES.flat());
    expect(plan.filter((entry) => entry.format === 'wechat').map((entry) => entry.frame)).toEqual(
      wechatV2.shots.flatMap((shot) => [shot.from, shot.from + Math.floor(shot.duration * 0.55), shot.from + shot.duration - 8]),
    );
  });

  it('builds 72 auditable, unique, in-range still entries', () => {
    expect(plan).toHaveLength(72);
    expect(new Set(plan.map((entry) => entry.filename)).size).toBe(72);
    expect(plan.every((entry) => entry.filename.includes(entry.shotId) && entry.filename.includes(entry.phase) && entry.filename.includes('f' + String(entry.frame).padStart(4, '0')))).toBe(true);
    expect(() => validateFramePlan(plan, timelines)).not.toThrow();
    expect(plan.filter((entry) => entry.format === 'website').every((entry) => entry.width === 3840 && entry.height === 2160)).toBe(true);
    expect(plan.filter((entry) => entry.format === 'wechat').every((entry) => entry.width === 1080 && entry.height === 1920)).toBe(true);
  });

  it('rejects out-of-range frames and text outside the safe viewport', () => {
    expect(() => validateFramePlan([{...plan[0], frame: websiteV2.frames}], timelines)).toThrow(/out of range/);
    expect(validateTextBounds([{id: 'ok', x: 70, y: 70, width: 400, height: 80}], {width: 1080, height: 1920}, 1700)).toBe(true);
    expect(() => validateTextBounds([{id: 'bad', x: 900, y: 70, width: 400, height: 80}], {width: 1080, height: 1920}, 1700)).toThrow(/outside viewport/);
    expect(() => validateTextBounds([{id: 'caption', x: 70, y: 1650, width: 400, height: 80}], {width: 1080, height: 1920}, 1700)).toThrow(/caption safe area/);
  });

  it('exposes all three deterministic still workflows and contact-sheet outputs', () => {
    const packageJson = readFileSync('package.json', 'utf8');
    expect(packageJson).toContain('\"stills:v2\": \"node scripts/render-v2-stills.mjs\"');
    expect(packageJson).toContain('\"stills:v2:website\"');
    expect(packageJson).toContain('\"stills:v2:wechat\"');
    const source = readFileSync('scripts/render-v2-stills.mjs', 'utf8');
    expect(source).toContain('website-contact-sheet.jpg');
    expect(source).toContain('wechat-contact-sheet.jpg');
    expect(source).toContain('v2-still-manifest.json');
  });
});
