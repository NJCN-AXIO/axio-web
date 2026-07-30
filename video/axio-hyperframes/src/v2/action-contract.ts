import contract from './action-contract.json';

export type V2Format = keyof typeof contract.visualActionFrames;
export type VisualAction<F extends V2Format> = keyof typeof contract.visualActionFrames[F];

export const BEAT_SUBDIVISION = contract.beatSubdivision;
export const HARD_CUT_FRAMES = contract.hardCuts;
export const VISUAL_ACTION_FRAMES = contract.visualActionFrames;

export const getOutroLocalActionFrames = (duration: number, holdFrames: number, itemCount: number) => {
  const stable = Math.max(30, duration - holdFrames);
  const lastItemCue = Math.max(18, stable - 52);
  const settle = itemCount > 0 ? lastItemCue + 12 : 0;
  const impact = Math.max(12, stable - 38);
  const sparkle = Math.max(18, stable - 24);
  return {riser: 0, settle, brand: impact, impact, sparkle, stable};
};

export const visualActionFrame = <F extends V2Format>(format: F, action: VisualAction<F>) =>
  VISUAL_ACTION_FRAMES[format][action] as number;
