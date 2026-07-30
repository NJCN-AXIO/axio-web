import type {FC} from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {visualActionFrame, type V2Format, type VisualAction} from '../action-contract';
import {websiteV2, wechatV2} from '../timeline';

type Format = V2Format;
type SfxCue = {action: string; from: number; src: string; volume: number; duration?: number};

const TIMELINES = {website: websiteV2, wechat: wechatV2};
const sfx = <F extends Format>(format: F, action: VisualAction<F>, src: string, volume: number, duration?: number): SfxCue => ({
  action: String(action), from: visualActionFrame(format, action), src, volume, ...(duration ? {duration} : {}),
});

export const NARRATION = {
  website: websiteV2.narration,
  wechat: wechatV2.narration.filter((cue) => cue.id !== 'wechat-readback-title'),
};

export const SFX: Record<Format, SfxCue[]> = {
  website: [
    sfx('website', 'open-brand', 'transition-soft.mp3', 0.28),
    sfx('website', 'open-page', 'air-whoosh-powerful.mp3', 0.26, 72),
    sfx('website', 'goal-title', 'sweep-fast-small.mp3', 0.3),
    sfx('website', 'plan-deal', 'paper-slide.mp3', 0.22, 60),
    sfx('website', 'plan-filter', 'transition-soft.mp3', 0.2, 18),
    sfx('website', 'pricing-detail', 'transition-soft.mp3', 0.24),
    sfx('website', 'pricing-row-embed', 'paper-staple.mp3', 0.24),
    sfx('website', 'governance-title', 'sweep-fast-small.mp3', 0.28),
    sfx('website', 'governance-stack', 'paper-slide.mp3', 0.22, 72),
    sfx('website', 'readback-title', 'sweep-fast-small.mp3', 0.28),
    sfx('website', 'readback-document', 'typewriter-digital.mp3', 0.2, 56),
    sfx('website', 'readback-verified', 'paper-staple.mp3', 0.28),
    sfx('website', 'control-title', 'sweep-fast-small.mp3', 0.28),
    sfx('website', 'capability-row-embed', 'paper-staple.mp3', 0.22),
    sfx('website', 'outro-riser', 'air-whoosh-powerful.mp3', 0.34, 112),
    sfx('website', 'outro-impact', 'impact-deep-whoosh.mp3', 0.5),
    sfx('website', 'outro-sparkle', 'shimmer-sparkle-sweep.mp3', 0.34, 24),
  ],
  wechat: [
    sfx('wechat', 'open-brand', 'transition-soft.mp3', 0.28),
    sfx('wechat', 'open-page', 'air-whoosh-powerful.mp3', 0.26, 68),
    sfx('wechat', 'goal-title', 'sweep-fast-small.mp3', 0.3),
    sfx('wechat', 'plan-deal', 'paper-slide.mp3', 0.22, 60),
    sfx('wechat', 'plan-filter', 'transition-soft.mp3', 0.2, 18),
    sfx('wechat', 'pricing-detail', 'transition-soft.mp3', 0.24),
    sfx('wechat', 'pricing-row-embed', 'paper-staple.mp3', 0.24),
    sfx('wechat', 'governance-title', 'sweep-fast-small.mp3', 0.28),
    sfx('wechat', 'governance-stack', 'paper-slide.mp3', 0.22, 72),
    sfx('wechat', 'readback-title', 'sweep-fast-small.mp3', 0.28),
    sfx('wechat', 'readback-document', 'typewriter-digital.mp3', 0.2, 56),
    sfx('wechat', 'readback-verified', 'paper-staple.mp3', 0.28),
    sfx('wechat', 'control-title', 'sweep-fast-small.mp3', 0.28),
    sfx('wechat', 'capability-row-embed', 'paper-staple.mp3', 0.22),
    sfx('wechat', 'outro-riser', 'air-whoosh-powerful.mp3', 0.34, 82),
    sfx('wechat', 'outro-impact', 'impact-deep-whoosh.mp3', 0.5),
    sfx('wechat', 'outro-sparkle', 'shimmer-sparkle-sweep.mp3', 0.34, 24),
  ],
};

export const InkAudio: FC<{format: Format; bgm: boolean}> = ({format, bgm}) => {
  const timeline = TIMELINES[format];
  return <>
    {bgm ? <Audio src={staticFile('audio/v2/house-vibez.mp3')} volume={(frame) => interpolate(frame, [0, 30, timeline.frames - 50, timeline.frames], [0, 0.24, 0.24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} /> : null}
    {NARRATION[format].map((cue) => <Sequence key={cue.id} from={cue.from} durationInFrames={cue.duration}><Audio src={staticFile('audio/v2/' + cue.id + '.wav')} volume={1} /></Sequence>)}
    {SFX[format].map((cue, index) => <Sequence key={cue.src + '-' + cue.from + '-' + index} from={cue.from} durationInFrames={cue.duration ?? 90}><Audio src={staticFile('audio/v2/' + cue.src)} volume={cue.volume} /></Sequence>)}
  </>;
};
