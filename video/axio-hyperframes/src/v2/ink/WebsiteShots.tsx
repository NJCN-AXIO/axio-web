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
const AuthorityMap: FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [10, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nodes = [
    {label: 'ACCIO 超级主管', detail: '监督权限 · 风险 · 审计', accent: true},
    {label: 'AI 主管', detail: '唯一正式派发', accent: false},
    {label: 'G1 / G2', detail: '确定性执行 · 独立回读', accent: false},
  ];
  return <AbsoluteFill data-source={AUTHORITY_PAGE} style={{backgroundColor: INK.page, justifyContent: 'center', padding: '0 220px'}}>
    <div style={{fontSize: 70, fontWeight: 700, color: INK.muted, marginBottom: 120}}>经营组织权责链</div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 220px 1fr 220px 1fr', alignItems: 'center'}}>
      {nodes.map((node, index) => <div key={node.label} style={{display: 'contents'}}>
        <div style={{borderTop: '10px solid ' + (node.accent ? INK.accent : INK.ink), paddingTop: 38, minHeight: 260}}>
          <div style={{fontSize: 128, lineHeight: 1.1, fontWeight: 700, color: node.accent ? INK.accent : INK.ink}}>{node.label}</div>
          <div style={{fontSize: 56, lineHeight: 1.35, fontWeight: 700, color: INK.muted, marginTop: 30}}>{node.detail}</div>
        </div>
        {index < nodes.length - 1 ? <div style={{height: 8, backgroundColor: INK.accent, transform: `scaleX(${line})`, transformOrigin: 'left', position: 'relative'}}><span style={{position: 'absolute', right: -2, top: -17, width: 0, height: 0, borderTop: '21px solid transparent', borderBottom: '21px solid transparent', borderLeft: '32px solid ' + INK.accent}} /></div> : null}
      </div>)}
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 220px 1fr 220px 1fr', marginTop: 28, fontSize: 42, fontWeight: 700, color: INK.muted, textAlign: 'center'}}>
      <span/><span>监督</span><span/><span>正式派发</span><span/>
    </div>
  </AbsoluteFill>;
};

export const WebsiteShot: FC<{id: string}> = ({id}) => {
  const frame = useCurrentFrame();
  switch (id) {
    case 'open': return frame < 70 ? <BrandInkOpen duration={70} /> : <PageCam {...page('evidence/ink/dashboard-page.png', 1097, 570, 205, 5.3)} />;
    case 'goal-title': return <Title parts={['一句目标', '生成经营计划']} />;
    case 'plan-deal': return <AbsoluteFill data-source={GOAL_CUTOUT}><PageCam {...page('evidence/ink/dashboard-page.png', 1097, 570, 205, 5.3)} /><InkCaption text={ROLE_COPY.dispatcher} duration={180} /></AbsoluteFill>;
    case 'pricing-detail': return <Evidence src='matrix-pricing-page.png' pageH={1225} cutout={{src:'matrix-pricing-pricing-row-4x.png',x:21,y:444,w:320,h:610}} caption='Cost / Margin / Evidence' />;
    case 'governance-title': return <Title parts={['有执行', '也有治理']} />;
    case 'governance-stack': return <Evidence src='accio-governance-page.png' pageH={1000} cutout={{src:'accio-governance-governance-row-4x.png',x:260,y:281,w:780,h:54}} caption={ROLE_COPY.governor} />;
    case 'authority-map': return <AuthorityMap />;
    case 'readback-title': return <Title parts={['执行完成', '不等于业务成功']} />;
    case 'readback': return <Evidence src='supervisor-page.png' pageH={1028} cx={720} cy={155} zoom={6.4} caption={authoritativeReadback + ' -> ' + verified + ' / supervisor-readback-row-4x.png'} />;
    case 'control-title': return <Title parts={['当前能力', '未来边界']} />;
    case 'capability': return <Evidence src='accio-capabilities-page.png' pageH={1604} cutout={{src:'accio-capabilities-capability-state-4x.png',x:260,y:225,w:260,h:264}} caption={CURRENT_LIMITS.join(' / ') + ' / ' + FUTURE_CAPABILITY} />;
    case 'founder-proof': return <AbsoluteFill style={{backgroundColor:INK.page,justifyContent:'center',alignItems:'center'}}><div style={{fontSize:54,fontWeight:700,color:INK.ink}}><DigitRoll value='116' fontSize={180}/><br/>{FOUNDER_BACKGROUND}</div></AbsoluteFill>;
    case 'outro': return <AbsoluteFill><InkOutro duration={270} tagline='' items={[{key:'dashboard',src:'evidence/ink/dashboard-metric-card-4x.png',width:640,height:327,x:190,y:320,dx:-700,dy:200},{key:'supervisor',src:'evidence/ink/supervisor-task-row-4x.png',width:700,height:40,x:2500,y:920,dx:900,dy:-200},{key:'authority',src:'evidence/ink/accio-overview-authority-row-4x.png',width:640,height:510,x:2600,y:260,dx:500,dy:300}]} /><div style={{position:'absolute',top:1320,left:260,right:260,textAlign:'center',fontSize:52,fontWeight:700,color:INK.ink,opacity:frame >= OUTRO_HOLD_FROM ? 1 : 0}}>{WEBSITE_CLOSING}</div><div style={{position:'absolute',bottom:72,left:160,right:160,textAlign:'center',fontSize:36,fontWeight:700,color:INK.muted,opacity:frame >= OUTRO_HOLD_FROM ? 1 : 0}}>{WEBSITE_EXPERIENCE_DISCLOSURE}</div></AbsoluteFill>;
    default: throw new Error('Unknown website shot: ' + id);
  }
};





