import type {FC} from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {websiteV2, wechatV2} from '../timeline';

type Format = 'website' | 'wechat';
type SfxCue = {from: number; src: string; volume: number; duration?: number};

const TIMELINES = {website: websiteV2, wechat: wechatV2};
const shot = (format: Format, id: string) => {
  const match = TIMELINES[format].shots.find((item) => item.id === id);
  if (!match) throw new Error('Unknown ' + format + ' shot: ' + id);
  return match.from;
};

export const NARRATION = {
  website: websiteV2.narration,
  wechat: wechatV2.narration.filter((cue) => cue.id !== 'wechat-readback-title'),
};

export const SFX: Record<Format, SfxCue[]> = {
  website: [
    {from: shot('website', 'open') + 12, src: 'transition-soft.mp3', volume: 0.28},
    {from: shot('website', 'open') + 78, src: 'air-whoosh-powerful.mp3', volume: 0.26, duration: 72},
    {from: shot('website', 'goal-title'), src: 'sweep-fast-small.mp3', volume: 0.3},
    {from: shot('website', 'plan-deal') + 18, src: 'paper-slide.mp3', volume: 0.32},
    {from: shot('website', 'plan-deal') + 78, src: 'sweep-fast-small.mp3', volume: 0.24},
    {from: shot('website', 'plan-deal') + 126, src: 'typewriter-digital.mp3', volume: 0.24, duration: 42},
    {from: shot('website', 'pricing-detail'), src: 'transition-soft.mp3', volume: 0.24},
    {from: shot('website', 'pricing-detail') + 58, src: 'camera-shutter-hard.mp3', volume: 0.38},
    {from: shot('website', 'governance-title'), src: 'sweep-fast-small.mp3', volume: 0.28},
    {from: shot('website', 'governance-stack') + 14, src: 'paper-slide.mp3', volume: 0.3},
    {from: shot('website', 'governance-stack') + 64, src: 'paper-staple.mp3', volume: 0.3},
    {from: shot('website', 'authority-map') + 52, src: 'camera-shutter-hard.mp3', volume: 0.34},
    {from: shot('website', 'readback-title'), src: 'sweep-fast-small.mp3', volume: 0.28},
    {from: shot('website', 'readback') + 18, src: 'typewriter-digital.mp3', volume: 0.25, duration: 60},
    {from: shot('website', 'readback') + 92, src: 'camera-shutter-hard.mp3', volume: 0.36},
    {from: shot('website', 'control-title'), src: 'sweep-fast-small.mp3', volume: 0.28},
    {from: shot('website', 'capability') + 16, src: 'paper-slide.mp3', volume: 0.28},
    {from: shot('website', 'capability') + 92, src: 'paper-staple.mp3', volume: 0.28},
    {from: shot('website', 'founder-proof') + 32, src: 'camera-shutter-hard.mp3', volume: 0.4},
    {from: shot('website', 'outro'), src: 'air-whoosh-powerful.mp3', volume: 0.34, duration: 80},
    {from: shot('website', 'outro') + 75, src: 'paper-slide.mp3', volume: 0.28},
    {from: shot('website', 'outro') + 155, src: 'impact-deep-whoosh.mp3', volume: 0.5},
    {from: shot('website', 'outro') + 180, src: 'shimmer-sparkle-sweep.mp3', volume: 0.34, duration: 90},
  ],
  wechat: [
    {from: shot('wechat', 'open') + 12, src: 'transition-soft.mp3', volume: 0.28},
    {from: shot('wechat', 'open') + 70, src: 'air-whoosh-powerful.mp3', volume: 0.26, duration: 68},
    {from: shot('wechat', 'goal-title'), src: 'sweep-fast-small.mp3', volume: 0.3},
    {from: shot('wechat', 'plan-deal') + 18, src: 'paper-slide.mp3', volume: 0.3},
    {from: shot('wechat', 'plan-deal') + 96, src: 'typewriter-digital.mp3', volume: 0.24, duration: 40},
    {from: shot('wechat', 'pricing-detail') + 52, src: 'camera-shutter-hard.mp3', volume: 0.36},
    {from: shot('wechat', 'governance-title'), src: 'sweep-fast-small.mp3', volume: 0.28},
    {from: shot('wechat', 'governance') + 16, src: 'paper-slide.mp3', volume: 0.3},
    {from: shot('wechat', 'governance') + 88, src: 'paper-staple.mp3', volume: 0.3},
    {from: shot('wechat', 'readback-title'), src: 'sweep-fast-small.mp3', volume: 0.28},
    {from: shot('wechat', 'readback') + 18, src: 'typewriter-digital.mp3', volume: 0.25, duration: 54},
    {from: shot('wechat', 'readback') + 96, src: 'camera-shutter-hard.mp3', volume: 0.36},
    {from: shot('wechat', 'control-title'), src: 'sweep-fast-small.mp3', volume: 0.28},
    {from: shot('wechat', 'capability') + 20, src: 'paper-slide.mp3', volume: 0.28},
    {from: shot('wechat', 'capability') + 96, src: 'paper-staple.mp3', volume: 0.28},
    {from: shot('wechat', 'outro'), src: 'air-whoosh-powerful.mp3', volume: 0.34, duration: 58},
    {from: shot('wechat', 'outro') + 60, src: 'impact-deep-whoosh.mp3', volume: 0.5},
    {from: shot('wechat', 'outro') + 84, src: 'shimmer-sparkle-sweep.mp3', volume: 0.34, duration: 66},
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
