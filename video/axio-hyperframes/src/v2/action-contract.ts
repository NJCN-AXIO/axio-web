import contract from './action-contract.json';

export type V2Format = keyof typeof contract.visualActionFrames;
export type VisualAction<F extends V2Format> = keyof typeof contract.visualActionFrames[F];

export const BEAT_SUBDIVISION = contract.beatSubdivision;
export const HARD_CUT_FRAMES = contract.hardCuts;
export const VISUAL_ACTION_FRAMES = contract.visualActionFrames;

export const getOutroLocalActionFrames = (duration: number) => {
  const settle = Math.max(24, duration - 30 - 15);
  const brand = settle + 15;
  return {settle, brand, impact: brand - 3, sparkle: brand + 4};
};

export const visualActionFrame = <F extends V2Format>(format: F, action: VisualAction<F>) =>
  VISUAL_ACTION_FRAMES[format][action] as number;
