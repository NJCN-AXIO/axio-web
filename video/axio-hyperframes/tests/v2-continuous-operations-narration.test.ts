import {describe, expect, it} from 'vitest';
import {websiteV2, wechatV2} from '../src/v2/timeline';

const speechUnits = (text: string) => {
  const chinese = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinTokens = text.match(/[A-Za-z0-9=+×]+/g)?.length ?? 0;
  return chinese + latinTokens * 2;
};

describe('AXIO V2 narration contract', () => {
  it('uses stable format-prefixed cue IDs', () => {
    expect(websiteV2.narration.map((cue) => cue.id)).toEqual([
      'website-open',
      'website-goal-plan',
      'website-governance',
      'website-readback',
      'website-control-founder',
      'website-outro',
    ]);
    expect(wechatV2.narration.map((cue) => cue.id)).toEqual([
      'wechat-open',
      'wechat-goal-plan-pricing',
      'wechat-governance',
      'wechat-readback-title',
      'wechat-readback',
      'wechat-control',
      'wechat-outro',
    ]);
  });

  it.each([websiteV2, wechatV2])('leaves eight frames of headroom at a natural commercial speech density', (timeline) => {
    for (const cue of timeline.narration) {
      const usableSeconds = (cue.duration - 8) / 30;
      expect(speechUnits(cue.text) / usableSeconds, cue.id).toBeLessThanOrEqual(6.5);
    }
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
