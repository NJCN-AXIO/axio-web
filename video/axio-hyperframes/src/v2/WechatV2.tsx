import type {FC} from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {V2FilmProps} from './types';
import {wechatV2} from './timeline';
import {WechatShot} from './ink/WechatShots';
import {InkAudio} from './ink/audio';
export const WechatV2: FC<V2FilmProps> = ({bgm = true}) => <AbsoluteFill><InkAudio format="wechat" bgm={bgm} />{wechatV2.shots.map((shot) => <Sequence key={shot.id} from={shot.from} durationInFrames={shot.duration}><WechatShot id={shot.id} /></Sequence>)}</AbsoluteFill>;
