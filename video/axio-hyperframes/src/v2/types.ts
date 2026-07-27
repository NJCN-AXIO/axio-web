export type V2SceneKind =
  | 'command'
  | 'organization'
  | 'statement'
  | 'proof'
  | 'evidence'
  | 'governance'
  | 'loop'
  | 'vision'
  | 'brand'
  | 'trial';

export type V2Scene = {
  id: string;
  from: number;
  duration: number;
  kind: V2SceneKind;
  headline: string;
  voice: string;
  evidence?: string;
};

export type V2Timeline = {
  frames: number;
  layout: 'landscape' | 'portrait-independent';
  scenes: V2Scene[];
};
