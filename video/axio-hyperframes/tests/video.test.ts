import {describe, expect, it} from 'vitest';
import {BRAND, WEBSITE_SCENES, WECHAT_SCENES} from '../src/constants';

describe('AXIO video contract', () => {
  it('uses the approved light Shopee-orange system', () => {
    expect(BRAND.orange).toBe('#EE4D2D');
    expect(BRAND.background).toBe('#F7F5F2');
    expect(BRAND.letterSpacing).toBe(0);
  });

  it('keeps independent timelines', () => {
    expect(WEBSITE_SCENES).toHaveLength(8);
    expect(WECHAT_SCENES).toHaveLength(5);
    expect(WECHAT_SCENES[0].layout).toBe('portrait');
  });
});
