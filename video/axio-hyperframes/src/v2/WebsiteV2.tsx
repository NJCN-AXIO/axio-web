import type {FC} from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {V2FilmProps} from './types';
import {websiteV2} from './timeline';
import {WebsiteShot} from './ink/WebsiteShots';
import {InkAudio} from './ink/audio';

export const WebsiteV2: FC<V2FilmProps> = ({bgm = true}) => (
  <AbsoluteFill>
    <InkAudio format="website" bgm={bgm} />
    {websiteV2.shots.map((shot) => <Sequence key={shot.id} from={shot.from} durationInFrames={shot.duration}><WebsiteShot id={shot.id} /></Sequence>)}
  </AbsoluteFill>
);
