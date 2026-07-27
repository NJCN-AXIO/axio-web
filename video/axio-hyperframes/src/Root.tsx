import type {FC} from 'react';
import {Composition} from 'remotion';
import {WebsiteFilm, WechatFilm} from './Films';
import {WebsiteV2} from './v2/WebsiteV2';
import {WechatV2} from './v2/WechatV2';

export const Root: FC = () => (
  <>
    <Composition
      id='AXIO-Website-4K'
      component={WebsiteFilm}
      durationInFrames={2550}
      fps={30}
      width={3840}
      height={2160}
    />
    <Composition
      id='AXIO-WeChat-Vertical'
      component={WechatFilm}
      durationInFrames={1500}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id='AXIO-Website-V2-4K'
      component={WebsiteV2}
      durationInFrames={2550}
      fps={30}
      width={3840}
      height={2160}
    />
    <Composition
      id='AXIO-WeChat-V2-Vertical'
      component={WechatV2}
      durationInFrames={1500}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
