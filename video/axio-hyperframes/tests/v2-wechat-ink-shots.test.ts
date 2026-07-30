import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {wechatV2} from '../src/v2/timeline';
import {dealMotionAt, documentRevealAt, textSizeForFrame} from '../src/v2/ink/InkPrimitives';
const path = 'src/v2/ink/WechatShots.tsx';
const source = () => existsSync(path) ? readFileSync(path, 'utf8') : '';
describe('AXIO portrait Ink Press shots', () => {
  it('provides a dedicated portrait renderer', () => expect(existsSync(path)).toBe(true));
  it('maps all 11 portrait shots exactly once', () => {
    const text = source();
    expect(wechatV2.shots).toHaveLength(11);
    expect(text).toContain('export const WECHAT_SHOT_RECIPES');
    for (const shot of wechatV2.shots) expect(text).toContain(`case '${shot.id}'`);
  });
  it('uses portrait-native cameras and safe-area captions', () => {
    const text = source();
    expect(text).toContain('1080');
    expect(text).toContain('1920');
    expect(text).toContain('left: 70');
    expect(text).toContain('textSizeForFrame(PORTRAIT_HEIGHT');
    expect(textSizeForFrame(1920, 'narrative')).toBeGreaterThanOrEqual(100);
    expect(textSizeForFrame(1920, 'support')).toBeGreaterThanOrEqual(58);
    expect(text).not.toContain('landscape');
  });
  it('renders portrait deal/filter and readback causality', () => {
    expect(dealMotionAt(96, 165, 6, 4).typedChars).toBeGreaterThan(0);
    expect(dealMotionAt(150, 165, 6, 4)).toMatchObject({typedChars: 4, filtered: true, click: 1});
    expect(documentRevealAt(0, 135, 5).verified).toBe(false);
    expect(documentRevealAt(120, 135, 5)).toMatchObject({rowsSettled: 5, verified: true});
    const text = source();
    for (const asset of ['dashboard-goal-card-4x.png', 'matrix-pricing-pricing-row-4x.png', 'accio-governance-governance-row-4x.png', 'supervisor-readback-row-4x.png', 'accio-capabilities-capability-state-4x.png']) expect(text).toContain(asset);
  });
  it('preserves authority and capability boundaries', () => {
    const text = source();
    expect(text).toContain('ROLE_COPY.dispatcher');
    expect(text).toContain('ACCIO 超级主管 / 监督治理');
    expect(text).toContain('G1 / G2 / 确定性执行与独立回读');
    expect(text).toContain('FUTURE_CAPABILITY');
    expect(text).toContain('authoritativeReadback');
  });
  it('uses the short AXIO closing and no trial offer', () => {
    const text = source();
    expect(text).toContain('WECHAT_CLOSING');
    expect(text).not.toContain('free trial');
    expect(text).not.toContain('7 days');
  });
});
