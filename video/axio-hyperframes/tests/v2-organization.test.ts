import {describe, expect, it} from 'vitest';
import {HERO_COPY, validateEdge} from '../src/v2/authority';

describe('AXIO V2 authority contract', () => {
  it('keeps AI Supervisor as the only formal dispatcher', () => {
    expect(() => validateEdge('ACCIO', 'G1', 'dispatch')).toThrow(
      'ACCIO cannot dispatch',
    );
    expect(validateEdge('AI Supervisor', 'G1', 'dispatch')).toBe(true);
    expect(validateEdge('Agent', 'AI Supervisor', 'advice')).toBe(true);
  });

  it('states the differentiated product position', () => {
    expect(HERO_COPY).toContain('不是一个 AI 工具');
    expect(HERO_COPY).toContain('一套 AI 电商经营组织');
  });
});
