export type InkRecipe =
  | 'brand-ink-open'
  | 'spotlight-hero-card'
  | 'paper-title-card'
  | 'deck-deal-flyin'
  | 'type-and-filter'
  | 'row-embed'
  | 'list-stack-press'
  | 'document-typewriter-reveal'
  | 'digit-roll'
  | 'outro-group-photo-launch';

export type V2Shot = {
  id: string;
  from: number;
  duration: number;
  recipe: InkRecipe | readonly InkRecipe[];
  headline: string;
};

export type NarrationCue = {
  id: string;
  from: number;
  duration: number;
  text: string;
};

export type LegacyV2Scene = {
  id: string;
  from: number;
  duration: number;
  voice?: string;
};

export type V2Timeline = {
  frames: number;
  layout: 'landscape' | 'portrait-independent';
  shots: readonly V2Shot[];
  narration: readonly NarrationCue[];
  /** @deprecated Remove when the format-specific Ink Press renderers own all shots. */
  scenes: readonly LegacyV2Scene[];
};

export type V2FilmProps = {bgm?: boolean};
