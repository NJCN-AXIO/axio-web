import type {FC} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {V2FilmProps} from './types';
import {wechatV2} from './timeline';
import {WechatShot} from './ink/WechatShots';
export const WechatV2: FC<V2FilmProps> = ({bgm = true}) => <AbsoluteFill>{bgm ? <Audio src={staticFile('audio/v2/wechat-bed.wav')} volume={0.48} /> : null}{wechatV2.narration.map((cue) => <Sequence key={'audio-' + cue.id} from={cue.from} durationInFrames={cue.duration}><Audio src={staticFile('audio/v2/' + cue.id + '.wav')} volume={1} /></Sequence>)}{wechatV2.shots.map((shot) => <Sequence key={shot.id} from={shot.from} durationInFrames={shot.duration}><WechatShot id={shot.id} /></Sequence>)}</AbsoluteFill>;
