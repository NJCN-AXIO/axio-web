export type Shot = {id: string; from: number; duration: number};
export type Timeline = {frames: number; shots: readonly Shot[]};
export type Timelines = {website: Timeline; wechat: Timeline};
export type StillEntry = {
  format: 'website' | 'wechat';
  compositionId: string;
  shotId: string;
  phase: 'ingress' | 'peak' | 'settled';
  frame: number;
  filename: string;
  width: number;
  height: number;
  pixelVariance?: number;
};
export type TextBox = {id: string; x: number; y: number; width: number; height: number};

export const WEBSITE_FRAMES: readonly (readonly number[])[];
export const loadTimelines: (path?: string) => Timelines;
export const buildStillPlan: (timelines: Timelines, selected?: 'all' | 'website' | 'wechat') => StillEntry[];
export const validateFramePlan: (entries: StillEntry[], timelines: Timelines) => StillEntry[];
export const measurePixels: (path: string) => Promise<{width?: number; height?: number; pixelVariance: number}>;
export const validateTextBounds: (boxes: TextBox[], viewport: {width: number; height: number}, captionSafeTop: number) => true;
export const main: () => Promise<void>;
