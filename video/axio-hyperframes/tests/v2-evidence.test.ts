import {describe, expect, it} from 'vitest';
import {METRICS, evidenceState} from '../src/v2/evidence-model';

describe('AXIO V2 evidence choreography', () => {
  it('restores complete UI context after detail focus', () => {
    expect(evidenceState(0)).toEqual({mode: 'complete', progress: 0});
    expect(evidenceState(42).mode).toBe('focus');
    expect(evidenceState(88)).toEqual({mode: 'complete', progress: 1});
  });

  it('labels founder operating evidence without implying capacity', () => {
    expect(METRICS).toEqual([
      ['116', '实际参与运营店铺'],
      ['6', '覆盖站点'],
      ['2', '独立租户'],
    ]);
  });
});
