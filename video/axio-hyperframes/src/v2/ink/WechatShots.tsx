import type {FC} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CURRENT_LIMITS, FUTURE_CAPABILITY, ROLE_COPY, WECHAT_CLOSING} from '../copy';
import {wechatV2} from '../timeline';
import {PageCam} from './PageCam';
import {BrandInkOpen, INK, InkCaption, InkOutro} from './InkPrimitives';

export const WECHAT_SHOT_RECIPES = {
  open: ['brand-ink-open','spotlight-hero-card'], 'goal-title': ['paper-title-card'],
  'plan-deal': ['deck-deal-flyin','type-and-filter'], 'pricing-detail': ['row-embed'],
  'governance-title': ['paper-title-card'], governance: ['list-stack-press','spotlight-hero-card'],
  'readback-title': ['paper-title-card'], readback: ['document-typewriter-reveal'],
  'control-title': ['paper-title-card'], capability: ['row-embed'], outro: ['outro-group-photo-launch'],
} as const;
const PORTRAIT_WIDTH = 1080;
const PORTRAIT_HEIGHT = 1920;
const SAFE_LEFT = 70;
const authoritativeReadback = '\u6743\u5a01\u7ed3\u679c\u56de\u8bfb';
const verified = '\u5df2\u9a8c\u8bc1';
const camera = (src: string, pageH: number, cx = 720, cy = 240, zoom = 4) => ({src, pageH, keys: [{frame: 0, cx, cy, zoom}, {frame: 120, cx, cy: cy + 90, zoom}]});
const PortraitTitle: FC<{title: string; accent: string}> = ({title, accent}) => <AbsoluteFill data-width={PORTRAIT_WIDTH} data-height={PORTRAIT_HEIGHT} style={{backgroundColor: INK.page, justifyContent:'center', alignItems:'center'}}><div style={{width:940,textAlign:'center',fontSize: 84,fontWeight:700,lineHeight:1.15,color:INK.ink}}>{title}<br/><span style={{color:INK.accent}}>{accent}</span></div><div style={{position:'absolute',left: 70,right: 70,bottom:120,height:6,backgroundColor:INK.accent}} /></AbsoluteFill>;
const PageShot: FC<{src: string; pageH: number; caption: string; cx?: number; cy?: number; zoom?: number}> = ({src,pageH,caption,cx,cy,zoom}) => <AbsoluteFill><PageCam {...camera('evidence/ink/' + src,pageH,cx,cy,zoom)} /><div style={{position:'absolute',left: 70,right: 70,bottom:100,fontSize:42,fontWeight:700,color:INK.ink,textAlign:'center'}}>{caption}</div></AbsoluteFill>;
export const WechatShot: FC<{id: string}> = ({id}) => {
  const frame = useCurrentFrame();
  switch (id) {
    case 'open': return frame < 70 ? <BrandInkOpen duration={70} /> : <PageShot src='dashboard-page.png' pageH={1097} caption={ROLE_COPY.dispatcher} cx={450} cy={150} zoom={3.6} />;
    case 'goal-title': return <PortraitTitle title='One goal' accent='One operating plan' />;
    case 'plan-deal': return <PageShot src='dashboard-page.png' pageH={1097} caption={ROLE_COPY.dispatcher} cx={450} cy={150} zoom={3.6} />;
    case 'pricing-detail': return <PageShot src='matrix-pricing-page.png' pageH={1225} caption='Cost / Margin / Evidence' cx={180} cy={650} zoom={3.5} />;
    case 'governance-title': return <PortraitTitle title='Execution' accent='Governance' />;
    case 'governance': return <PageShot src='accio-governance-page.png' pageH={1000} caption={ROLE_COPY.governor + ' / ' + ROLE_COPY.executors} cx={650} cy={300} zoom={4.2} />;
    case 'readback-title': return <PortraitTitle title='Execution settled' accent='Business verified' />;
    case 'readback': return <PageShot src='supervisor-page.png' pageH={1028} caption={authoritativeReadback + ' / ' + verified} cx={720} cy={170} zoom={5.2} />;
    case 'control-title': return <PortraitTitle title='Current limits' accent='Future boundary' />;
    case 'capability': return <PageShot src='accio-capabilities-page.png' pageH={1604} caption={CURRENT_LIMITS.join(' / ') + ' / ' + FUTURE_CAPABILITY} cx={390} cy={350} zoom={3.6} />;
    case 'outro': return <AbsoluteFill><InkOutro duration={150} tagline='' items={[{key:'metric',src:'evidence/ink/dashboard-metric-card-4x.png',width:520,height:260,x:80,y:300,dx:-500,dy:100},{key:'authority',src:'evidence/ink/accio-overview-authority-row-4x.png',width:620,height:480,x:380,y:1160,dx:500,dy:200}]} /><div style={{position:'absolute',left: 70,right: 70,top:1340,textAlign:'center',fontSize:46,fontWeight:700,color:INK.ink}}>{WECHAT_CLOSING}</div></AbsoluteFill>;
    default: throw new Error('Unknown portrait shot: ' + id);
  }
};


