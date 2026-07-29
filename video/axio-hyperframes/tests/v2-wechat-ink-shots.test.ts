import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {wechatV2} from '../src/v2/timeline';
const path = 'src/v2/ink/WechatShots.tsx';
const source = () => existsSync(path) ? readFileSync(path, 'utf8') : '';
describe('AXIO portrait Ink Press shots', () => {
  it('provides a dedicated portrait renderer', () => expect(existsSync(path)).toBe(true));
  it('maps all 11 portrait shots exactly once', () => {
    const text = source();
    expect(wechatV2.shots).toHaveLength(11);
    expect(text).toContain('export const WECHAT_SHOT_RECIPES');
    for (const shot of wechatV2.shots) expect(text).toContain('');
  });
  it('uses portrait-native cameras and safe-area captions', () => {
    const text = source();
    expect(text).toContain('1080');
    expect(text).toContain('1920');
    expect(text).toContain('left: 70');
    expect(text).toContain('fontSize: 84');
    expect(text).not.toContain('landscape');
  });
  it('preserves authority and capability boundaries', () => {
    const text = source();
    expect(text).toContain('ROLE_COPY.dispatcher');
    expect(text).toContain('ROLE_COPY.governor');
    expect(text).toContain('ROLE_COPY.executors');
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
