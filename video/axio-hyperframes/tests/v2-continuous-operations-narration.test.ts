import {describe, expect, it} from 'vitest';
import {websiteV2, wechatV2} from '../src/v2/timeline';

describe('AXIO V2 narration contract', () => {
  it('uses stable format-prefixed cue IDs', () => {
    expect(websiteV2.narration.map((cue) => cue.id)).toEqual([
      'website-open',
      'website-goal-plan',
      'website-pricing',
      'website-governance',
      'website-readback-title',
      'website-readback',
      'website-control',
      'website-founder-proof',
      'website-outro',
    ]);
    expect(wechatV2.narration.map((cue) => cue.id)).toEqual([
      'wechat-open',
      'wechat-goal-plan',
      'wechat-pricing',
      'wechat-governance',
      'wechat-readback-title',
      'wechat-readback',
      'wechat-control',
      'wechat-outro',
    ]);
  });

  it.each([websiteV2, wechatV2])('marks verification only after authoritative readback starts', (timeline) => {
    const readbackFrom = timeline.shots.find((shot) => shot.id === 'readback')?.from;
    expect(readbackFrom).toBeTypeOf('number');
    for (const cue of timeline.narration.filter((item) => item.text.includes('已验证'))) {
      expect(cue.from).toBeGreaterThanOrEqual(readbackFrom as number);
    }
  });

  it('describes deterministic execution and authoritative result readback', () => {
    const narration = [...websiteV2.narration, ...wechatV2.narration]
      .map((cue) => cue.text)
      .join('\n');
    expect(narration).toContain('G1、G2');
    expect(narration).toContain('确定性执行');
    expect(narration).toContain('权威结果回读');
    expect(narration).not.toContain('ACCIO 超级主管派发');
  });
});
