import type {FC} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {websiteCopy, wechatCopy} from './content';
import {Scene} from './Scene';

const websiteStarts = [0, 300, 720, 1080, 1500, 1920, 2190, 2430];
const websiteDurations = [300, 420, 360, 420, 420, 270, 240, 120];
const wechatStarts = [0, 210, 600, 960, 1290];
const wechatDurations = [210, 390, 360, 330, 210];

export const WebsiteFilm: FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile('audio/website.wav')} />
    {websiteCopy.map((copy, index) => (
      <Sequence key={copy.id} from={websiteStarts[index]} durationInFrames={websiteDurations[index]}>
        <Scene copy={copy} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const WechatFilm: FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile('audio/wechat.wav')} />
    {wechatCopy.map((copy, index) => (
      <Sequence key={copy.id} from={wechatStarts[index]} durationInFrames={wechatDurations[index]}>
        <Scene copy={copy} portrait />
      </Sequence>
    ))}
  </AbsoluteFill>
);
