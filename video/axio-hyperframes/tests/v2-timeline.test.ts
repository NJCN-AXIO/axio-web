import {describe, expect, it} from 'vitest';
import {websiteV2, wechatV2} from '../src/v2/timeline';

describe('AXIO V2 timeline', () => {
  it('uses the approved nine-beat website arc', () => {
    expect(websiteV2.frames).toBe(2550);
    expect(websiteV2.scenes.map((scene) => scene.id)).toEqual([
      'command',
      'organization-boot',
      'positioning',
      'proof',
      'plan',
      'governance',
      'readback',
      'vision',
      'brand',
    ]);
    expect(websiteV2.scenes.at(-1)?.from).toBe(2400);
  });

  it('keeps WeChat portrait timing independent', () => {
    expect(wechatV2.frames).toBe(1500);
    expect(wechatV2.layout).toBe('portrait-independent');
    expect(wechatV2.scenes.map((scene) => scene.from)).toEqual([
      0, 240, 420, 900, 1200,
    ]);
  });
});
