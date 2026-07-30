import type {FC} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CURRENT_LIMITS, FUTURE_CAPABILITY, ROLE_COPY, WECHAT_CLOSING} from '../copy';
import {INK, InkDealFilter, InkDocumentReveal, InkHeroSpotlight, InkOutro, InkRowEmbed, InkStackPress, InkTitleCard, textSizeForFrame, type EvidenceBox} from './InkPrimitives';
import liveLayout from './live-layout.json';

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
const authoritativeReadback = '权威结果回读';
const verified = '已验证';
const evidence = (file: string, x: number, y: number, w: number, h: number): EvidenceBox => ({file, x, y, w, h});
const goalBox = evidence('dashboard-goal-card-4x.png', liveLayout.dashboard.cutouts['goal-card'].x, liveLayout.dashboard.cutouts['goal-card'].y, liveLayout.dashboard.cutouts['goal-card'].w, liveLayout.dashboard.cutouts['goal-card'].h);
const pricingBox = evidence('matrix-pricing-pricing-row-4x.png', liveLayout['matrix-pricing'].cutouts['pricing-row'].x, liveLayout['matrix-pricing'].cutouts['pricing-row'].y, liveLayout['matrix-pricing'].cutouts['pricing-row'].w, liveLayout['matrix-pricing'].cutouts['pricing-row'].h);
const governanceBox = evidence('accio-governance-governance-row-4x.png', liveLayout['accio-governance'].cutouts['governance-row'].x, liveLayout['accio-governance'].cutouts['governance-row'].y, liveLayout['accio-governance'].cutouts['governance-row'].w, liveLayout['accio-governance'].cutouts['governance-row'].h);
const readbackBox = evidence('supervisor-readback-row-4x.png', liveLayout.supervisor.cutouts['readback-row'].x, liveLayout.supervisor.cutouts['readback-row'].y, liveLayout.supervisor.cutouts['readback-row'].w, liveLayout.supervisor.cutouts['readback-row'].h);
const capabilityBox = evidence('accio-capabilities-capability-state-4x.png', liveLayout['accio-capabilities'].cutouts['capability-state'].x, liveLayout['accio-capabilities'].cutouts['capability-state'].y, liveLayout['accio-capabilities'].cutouts['capability-state'].w, liveLayout['accio-capabilities'].cutouts['capability-state'].h);
const governanceChecks = ['ACCIO 超级主管 / 监督治理', '权限模式', '风险门禁', '受控执行', 'G1 / G2 / 确定性执行与独立回读', '权威结果回读'];

const PortraitTitle: FC<{title: string; accent: string; duration: number}> = ({title, accent, duration}) => <AbsoluteFill data-width={PORTRAIT_WIDTH} data-height={PORTRAIT_HEIGHT} style={{backgroundColor: INK.page}}><InkTitleCard duration={duration} segments={[{text: title}, {text: accent, accent: true}]} /><div style={{position: 'absolute', left: 70, right: 70, bottom: 120, height: 8, backgroundColor: INK.accent}} /></AbsoluteFill>;

const PortraitOutro: FC = () => {
  const frame = useCurrentFrame();
  const items = [
    {key:'goal',src:'evidence/ink/dashboard-goal-card-4x.png',width:760,height:100,x:60,y:190,dx:-700,dy:-180,rotate:-3},
    {key:'metric',src:'evidence/ink/dashboard-metric-card-4x.png',width:360,height:184,x:70,y:360,dx:-500,dy:0,rotate:3},
    {key:'pricing',src:'evidence/ink/matrix-pricing-pricing-row-4x.png',width:210,height:400,x:790,y:310,dx:500,dy:-100,rotate:-2},
    {key:'governance',src:'evidence/ink/accio-governance-governance-row-4x.png',width:720,height:50,x:180,y:700,dx:0,dy:-400,rotate:2},
    {key:'authority',src:'evidence/ink/accio-overview-authority-row-4x.png',width:390,height:310,x:40,y:1100,dx:-500,dy:200,rotate:-3},
    {key:'overview',src:'evidence/ink/accio-overview-overview-metric-4x.png',width:510,height:48,x:520,y:1030,dx:500,dy:0,rotate:2},
    {key:'task',src:'evidence/ink/supervisor-task-row-4x.png',width:600,height:36,x:400,y:1450,dx:600,dy:240,rotate:-2},
    {key:'readback',src:'evidence/ink/supervisor-readback-row-4x.png',width:520,height:358,x:480,y:1510,dx:500,dy:500,rotate:3},
    {key:'capability',src:'evidence/ink/accio-capabilities-capability-state-4x.png',width:300,height:304,x:70,y:1510,dx:-500,dy:500,rotate:-2},
  ] as const;
  return <AbsoluteFill><InkOutro duration={150} holdFrames={30} tagline='AI 电商经营组织' items={items} /><div style={{position:'absolute', left: 70, right: 70, top: 1280, textAlign:'center', fontSize: textSizeForFrame(PORTRAIT_HEIGHT, 'narrative'), lineHeight:1.18, fontWeight:700, color:INK.ink, backgroundColor:'rgba(244,246,249,0.92)', padding:'18px 12px', opacity: frame >= 105 ? 1 : 0}}>{WECHAT_CLOSING}</div></AbsoluteFill>;
};

export const WechatShot: FC<{id: string}> = ({id}) => {
  switch (id) {
    case 'open': return <><Sequence durationInFrames={70}><InkTitleCard duration={70} segments={[{text:'AXIO',accent:true}]} sub='AI 电商经营组织' /></Sequence><Sequence from={70} durationInFrames={110}><InkHeroSpotlight duration={110} pageSrc='dashboard-page.png' pageH={liveLayout.dashboard.pageH} box={goalBox} keys={[{frame:0,cx:720,cy:420,zoom:0.82,rotX:0,rotY:0,persp:1400},{frame:24,cx:720,cy:245,zoom:1.05,rotX:4,rotY:-6,persp:1400},{frame:110,cx:720,cy:245,zoom:1.02,rotX:4,rotY:-6,persp:1400}]} caption={ROLE_COPY.dispatcher} /></Sequence></>;
    case 'goal-title': return <PortraitTitle duration={45} title='一句目标' accent='进入 AXIO' />;
    case 'plan-deal': return <InkDealFilter duration={165} pageSrc='dashboard-page.png' emptySrc='dashboard-empty-plate.png' pageH={liveLayout.dashboard.pageH} box={goalBox} keys={[{frame:0,cx:720,cy:245,zoom:1.04,rotX:12,rotY:-16,persp:1200},{frame:42,cx:720,cy:245,zoom:0.9,rotX:0,rotY:0,persp:1300},{frame:165,cx:720,cy:245,zoom:1.02,rotX:0,rotY:0,persp:1300}]} caption={ROLE_COPY.dispatcher} />;
    case 'pricing-detail': return <InkRowEmbed duration={90} pageSrc='matrix-pricing-page.png' emptySrc='matrix-pricing-empty-plate.png' pageH={liveLayout['matrix-pricing'].pageH} box={pricingBox} rows={5} keys={[{frame:0,cx:185,cy:720,zoom:2.45},{frame:75,cx:185,cy:740,zoom:2.62}]} caption='成本 / 利润 / 证据' />;
    case 'governance-title': return <PortraitTitle duration={45} title='自动化之前' accent='先通过治理' />;
    case 'governance': return <InkStackPress duration={135} pageSrc='accio-governance-page.png' emptySrc='accio-governance-empty-plate.png' pageH={liveLayout['accio-governance'].pageH} box={governanceBox} labels={governanceChecks} keys={[{frame:0,cx:650,cy:470,zoom:1.02},{frame:110,cx:650,cy:490,zoom:1.12}]} caption={'ACCIO 超级主管 / 监督治理\nG1 / G2 / 确定性执行与独立回读'} />;
    case 'readback-title': return <PortraitTitle duration={45} title='执行完成' accent='不等于业务成功' />;
    case 'readback': return <InkDocumentReveal duration={135} pageSrc='supervisor-page.png' emptySrc='supervisor-empty-plate.png' pageH={liveLayout.supervisor.pageH} box={readbackBox} rows={5} keys={[{frame:0,cx:840,cy:570,zoom:0.78},{frame:105,cx:840,cy:570,zoom:0.86}]} caption={authoritativeReadback} />;
    case 'control-title': return <PortraitTitle duration={45} title='当前仍是' accent='受控执行' />;
    case 'capability': return <InkRowEmbed duration={135} pageSrc='accio-capabilities-page.png' emptySrc='accio-capabilities-empty-plate.png' pageH={liveLayout['accio-capabilities'].pageH} box={capabilityBox} rows={3} keys={[{frame:0,cx:390,cy:350,zoom:2.8},{frame:108,cx:390,cy:350,zoom:3.05}]} caption={`${CURRENT_LIMITS.join(' / ')}\n${FUTURE_CAPABILITY}`} />;
    case 'outro': return <PortraitOutro />;
    default: throw new Error(`Unknown portrait shot: ${id}`);
  }
};

void SAFE_LEFT;
void verified;
