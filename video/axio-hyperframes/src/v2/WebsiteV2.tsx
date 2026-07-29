import type {FC} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {V2FilmProps} from './types';
import {websiteV2} from './timeline';
import {WebsiteShot} from './ink/WebsiteShots';

export const WebsiteV2: FC<V2FilmProps> = ({bgm = true}) => (
  <AbsoluteFill>
    {bgm ? <Audio src={staticFile('audio/v2/website-bed.wav')} volume={0.48} /> : null}
    {websiteV2.narration.map((cue) => <Sequence key={'audio-' + cue.id} from={cue.from} durationInFrames={cue.duration}><Audio src={staticFile('audio/v2/' + cue.id + '.wav')} volume={1} /></Sequence>)}
    {websiteV2.shots.map((shot) => <Sequence key={shot.id} from={shot.from} durationInFrames={shot.duration}><WebsiteShot id={shot.id} /></Sequence>)}
  </AbsoluteFill>
);
