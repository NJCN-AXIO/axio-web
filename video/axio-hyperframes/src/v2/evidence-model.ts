export const METRICS = [
  ['116', '实际参与运营店铺'],
  ['6', '覆盖站点'],
  ['2', '独立租户'],
] as const;

export type EvidenceState = {
  mode: 'complete' | 'focus';
  progress: number;
};

export const evidenceState = (frame: number): EvidenceState => {
  if (frame < 24) return {mode: 'complete', progress: 0};
  if (frame < 72) {
    return {
      mode: 'focus',
      progress: Math.min(1, Math.max(0, (frame - 24) / 48)),
    };
  }
  return {mode: 'complete', progress: 1};
};
