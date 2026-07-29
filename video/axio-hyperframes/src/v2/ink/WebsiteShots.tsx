import type {FC} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CURRENT_LIMITS, FOUNDER_BACKGROUND, FUTURE_CAPABILITY, ROLE_COPY, WEBSITE_CLOSING, WEBSITE_EXPERIENCE_DISCLOSURE} from '../copy';
import {websiteV2} from '../timeline';
import {PageCam} from './PageCam';
import {BrandInkOpen, DigitRoll, INK, InkCaption, InkOutro, InkTitleCard} from './InkPrimitives';

export const WEBSITE_SHOT_RECIPES = {
  open: ['brand-ink-open', 'spotlight-hero-card'], 'goal-title': ['paper-title-card'],
  'plan-deal': ['deck-deal-flyin', 'type-and-filter'], 'pricing-detail': ['row-embed'],
  'governance-title': ['paper-title-card'], 'governance-stack': ['list-stack-press'],
  'authority-map': ['spotlight-hero-card'], 'readback-title': ['paper-title-card'],
  readback: ['document-typewriter-reveal'], 'control-title': ['paper-title-card'],
  capability: ['row-embed'], 'founder-proof': ['digit-roll'], outro: ['outro-group-photo-launch'],
} as const;

const page = (src: string, pageH: number, cx = 720, cy = 500, zoom = 2.45) => ({src, pageH, keys: [{frame: 0, cx, cy, zoom}, {frame: 80, cx, cy, zoom: zoom * 1.04}]});
const Cutout: FC<{src: string; x: number; y: number; w: number; h: number}> = ({src, x, y, w, h}) => <Img src={staticFile('evidence/ink/' + src)} style={{position: 'absolute', left: x, top: y, width: w, height: h}} />;
const Evidence: FC<{src: string; pageH: number; cutout?: Parameters<typeof Cutout>[0]; caption: string; cx?: number; cy?: number; zoom?: number}> = ({src, pageH, cutout, caption, cx = 720, cy = 500, zoom = 2.45}) => <AbsoluteFill><PageCam {...page('evidence/ink/' + src, pageH, cx, cy, zoom)}>{cutout ? <Cutout {...cutout} /> : null}</PageCam><InkCaption text={caption} duration={120} /></AbsoluteFill>;
const Title: FC<{parts: readonly string[]}> = ({parts}) => <InkTitleCard duration={54} segments={parts.map((text, index) => ({text, accent: index === parts.length - 1}))} />;
const GOAL_CUTOUT = 'dashboard-goal-card-4x.png';
const OUTRO_HOLD_FROM = 150;
const AUTHORITY_PAGE = 'accio-overview-page.png';
const authoritativeReadback = '\u6743\u5a01\u7ed3\u679c\u56de\u8bfb';
const verified = '\u5df2\u9a8c\u8bc1';

export const WebsiteShot: FC<{id: string}> = ({id}) => {
  const frame = useCurrentFrame();
  switch (id) {
    case 'open': return frame < 70 ? <BrandInkOpen duration={70} /> : <PageCam {...page('evidence/ink/dashboard-page.png', 1097, 570, 205, 5.3)} />;
    case 'goal-title': return <Title parts={['Goal', 'Plan']} />;
    case 'plan-deal': return <AbsoluteFill data-source={GOAL_CUTOUT}><PageCam {...page('evidence/ink/dashboard-page.png', 1097, 570, 205, 5.3)} /><InkCaption text={ROLE_COPY.dispatcher} duration={180} /></AbsoluteFill>;
    case 'pricing-detail': return <Evidence src='matrix-pricing-page.png' pageH={1225} cutout={{src:'matrix-pricing-pricing-row-4x.png',x:21,y:444,w:320,h:610}} caption='Cost / Margin / Evidence' />;
    case 'governance-title': return <Title parts={['Execution', 'Governance']} />;
    case 'governance-stack': return <Evidence src='accio-governance-page.png' pageH={1000} cutout={{src:'accio-governance-governance-row-4x.png',x:260,y:281,w:780,h:54}} caption={ROLE_COPY.governor} />;
    case 'authority-map': return <AbsoluteFill data-source={AUTHORITY_PAGE} style={{backgroundColor: INK.page, justifyContent:'center', alignItems:'center'}}><div style={{fontSize:92,fontWeight:700,color:INK.ink,textAlign:'center'}}>{ROLE_COPY.dispatcher}<br/><span style={{color:INK.accent}}>{ROLE_COPY.governor}</span><br/>{ROLE_COPY.executors}</div></AbsoluteFill>;
    case 'readback-title': return <Title parts={['Execution settled', 'Business verified']} />;
    case 'readback': return <Evidence src='supervisor-page.png' pageH={1028} cx={720} cy={155} zoom={6.4} caption={authoritativeReadback + ' -> ' + verified + ' / supervisor-readback-row-4x.png'} />;
    case 'capability': return <Evidence src='accio-capabilities-page.png' pageH={1604} cutout={{src:'accio-capabilities-capability-state-4x.png',x:260,y:225,w:260,h:264}} caption={CURRENT_LIMITS.join(' / ') + ' / ' + FUTURE_CAPABILITY} />;
    case 'founder-proof': return <AbsoluteFill style={{backgroundColor:INK.page,justifyContent:'center',alignItems:'center'}}><div style={{fontSize:54,fontWeight:700,color:INK.ink}}><DigitRoll value='116' fontSize={180}/><br/>{FOUNDER_BACKGROUND}</div></AbsoluteFill>;
    case 'outro': return <AbsoluteFill><InkOutro duration={270} tagline='' items={[{key:'dashboard',src:'evidence/ink/dashboard-metric-card-4x.png',width:640,height:327,x:190,y:320,dx:-700,dy:200},{key:'supervisor',src:'evidence/ink/supervisor-task-row-4x.png',width:700,height:40,x:2500,y:920,dx:900,dy:-200},{key:'authority',src:'evidence/ink/accio-overview-authority-row-4x.png',width:640,height:510,x:2600,y:260,dx:500,dy:300}]} /><div style={{position:'absolute',top:1320,left:260,right:260,textAlign:'center',fontSize:52,fontWeight:700,color:INK.ink,opacity:frame >= OUTRO_HOLD_FROM ? 1 : 0}}>{WEBSITE_CLOSING}</div><div style={{position:'absolute',bottom:72,left:160,right:160,textAlign:'center',fontSize:36,fontWeight:700,color:INK.muted,opacity:frame >= OUTRO_HOLD_FROM ? 1 : 0}}>{WEBSITE_EXPERIENCE_DISCLOSURE}</div></AbsoluteFill>;
    default: throw new Error('Unknown website shot: ' + id);
  }
};





