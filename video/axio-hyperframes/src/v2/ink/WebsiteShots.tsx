import type {FC} from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CURRENT_LIMITS, FOUNDER_BACKGROUND, FUTURE_CAPABILITY, ROLE_COPY, WEBSITE_CLOSING, WEBSITE_EXPERIENCE_DISCLOSURE} from '../copy';
import {DigitRoll, INK, InkCaption, InkDealFilter, InkDocumentReveal, InkHeroSpotlight, InkOutro, InkRowEmbed, InkStackPress, InkTitleCard, textSizeForFrame, type EvidenceBox} from './InkPrimitives';
import liveLayout from './live-layout.json';

export const WEBSITE_SHOT_RECIPES = {
  open: ['brand-ink-open', 'spotlight-hero-card'], 'goal-title': ['paper-title-card'],
  'plan-deal': ['deck-deal-flyin', 'type-and-filter'], 'pricing-detail': ['row-embed'],
  'governance-title': ['paper-title-card'], 'governance-stack': ['list-stack-press'],
  'authority-map': ['spotlight-hero-card'], 'readback-title': ['paper-title-card'],
  readback: ['document-typewriter-reveal'], 'control-title': ['paper-title-card'],
  capability: ['row-embed'], 'founder-proof': ['digit-roll'], outro: ['outro-group-photo-launch'],
} as const;

const evidence = (file: string, x: number, y: number, w: number, h: number): EvidenceBox => ({file, x, y, w, h});
const goalBox = evidence('dashboard-goal-card-4x.png', liveLayout.dashboard.cutouts['goal-card'].x, liveLayout.dashboard.cutouts['goal-card'].y, liveLayout.dashboard.cutouts['goal-card'].w, liveLayout.dashboard.cutouts['goal-card'].h);
const pricingBox = evidence('matrix-pricing-pricing-row-4x.png', liveLayout['matrix-pricing'].cutouts['pricing-row'].x, liveLayout['matrix-pricing'].cutouts['pricing-row'].y, liveLayout['matrix-pricing'].cutouts['pricing-row'].w, liveLayout['matrix-pricing'].cutouts['pricing-row'].h);
const governanceBox = evidence('accio-governance-governance-row-4x.png', liveLayout['accio-governance'].cutouts['governance-row'].x, liveLayout['accio-governance'].cutouts['governance-row'].y, liveLayout['accio-governance'].cutouts['governance-row'].w, liveLayout['accio-governance'].cutouts['governance-row'].h);
const readbackBox = evidence('supervisor-readback-row-4x.png', liveLayout.supervisor.cutouts['readback-row'].x, liveLayout.supervisor.cutouts['readback-row'].y, liveLayout.supervisor.cutouts['readback-row'].w, liveLayout.supervisor.cutouts['readback-row'].h);
const capabilityBox = evidence('accio-capabilities-capability-state-4x.png', liveLayout['accio-capabilities'].cutouts['capability-state'].x, liveLayout['accio-capabilities'].cutouts['capability-state'].y, liveLayout['accio-capabilities'].cutouts['capability-state'].w, liveLayout['accio-capabilities'].cutouts['capability-state'].h);
const OUTRO_HOLD_FROM = 150;
const authoritativeReadback = '权威结果回读';
const verified = '已验证';
const governanceChecks = ['唯一正式任务派发者', '权限模式', '受控执行', '任务状态', '异常状态', '独立回读'];
const Title: FC<{parts: readonly string[]}> = ({parts}) => <InkTitleCard duration={54} segments={parts.map((text, index) => ({text, accent: index === parts.length - 1}))} />;

const AuthorityMap: FC = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const line = interpolate(frame, [10, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nodes = [
    {label: 'ACCIO 超级主管', detail: '监督权限 · 风险 · 审计', accent: true},
    {label: 'AI 主管', detail: '唯一正式派发', accent: false},
    {label: 'G1 / G2', detail: '确定性执行 · 独立回读', accent: false},
  ];
  return <AbsoluteFill data-source='accio-overview-page.png' style={{backgroundColor: INK.page, justifyContent: 'center', padding: '0 220px'}}>
    <div style={{fontSize: textSizeForFrame(height, 'narrative'), fontWeight: 700, color: INK.muted, marginBottom: 110}}>经营组织权责链</div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 180px 1fr 180px 1fr', alignItems: 'center'}}>{nodes.map((node, index) => <div key={node.label} style={{display: 'contents'}}><div style={{borderTop: `10px solid ${node.accent ? INK.accent : INK.ink}`, paddingTop: 38, minHeight: 280}}><div style={{fontSize: 128, lineHeight: 1.1, fontWeight: 700, color: node.accent ? INK.accent : INK.ink}}>{node.label}</div><div style={{fontSize: textSizeForFrame(height, 'support'), lineHeight: 1.3, fontWeight: 700, color: INK.muted, marginTop: 28}}>{node.detail}</div></div>{index < nodes.length - 1 ? <div style={{height: 8, backgroundColor: INK.accent, transform: `scaleX(${line})`, transformOrigin: 'left'}} /> : null}</div>)}</div>
  </AbsoluteFill>;
};

const FounderProof: FC = () => {
  const {height} = useVideoConfig();
  return <AbsoluteFill style={{backgroundColor: INK.page, justifyContent: 'center', alignItems: 'center'}}><div style={{textAlign: 'center', fontSize: textSizeForFrame(height, 'narrative'), lineHeight: 1.25, fontWeight: 700, color: INK.ink}}><DigitRoll value='116' fontSize={220} /><br />{FOUNDER_BACKGROUND}</div></AbsoluteFill>;
};

const WebsiteOutro: FC = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const items = [
    {key: 'goal', src: 'evidence/ink/dashboard-goal-card-4x.png', width: 920, height: 120, x: 180, y: 240, dx: -900, dy: -220, rotate: -3},
    {key: 'metric', src: 'evidence/ink/dashboard-metric-card-4x.png', width: 520, height: 266, x: 250, y: 720, dx: -700, dy: 80, rotate: 4},
    {key: 'pricing', src: 'evidence/ink/matrix-pricing-pricing-row-4x.png', width: 340, height: 650, x: 560, y: 1210, dx: -700, dy: 500, rotate: -2},
    {key: 'governance', src: 'evidence/ink/accio-governance-governance-row-4x.png', width: 900, height: 62, x: 1460, y: 260, dx: 0, dy: -500, rotate: 1},
    {key: 'authority', src: 'evidence/ink/accio-overview-authority-row-4x.png', width: 720, height: 570, x: 2880, y: 260, dx: 900, dy: -300, rotate: 3},
    {key: 'overview', src: 'evidence/ink/accio-overview-overview-metric-4x.png', width: 760, height: 70, x: 2740, y: 930, dx: 900, dy: 0, rotate: -2},
    {key: 'task', src: 'evidence/ink/supervisor-task-row-4x.png', width: 820, height: 48, x: 2700, y: 1370, dx: 900, dy: 250, rotate: 2},
    {key: 'readback', src: 'evidence/ink/supervisor-readback-row-4x.png', width: 820, height: 560, x: 2500, y: 1510, dx: 800, dy: 600, rotate: -3},
    {key: 'capability', src: 'evidence/ink/accio-capabilities-capability-state-4x.png', width: 520, height: 528, x: 1080, y: 1490, dx: -180, dy: 700, rotate: 2},
  ] as const;
  return <AbsoluteFill><InkOutro duration={270} holdFrames={120} tagline='AI 电商经营组织' items={items} /><div style={{position: 'absolute', top: 1430, left: 360, right: 360, textAlign: 'center', fontSize: textSizeForFrame(height, 'narrative'), lineHeight: 1.18, fontWeight: 700, color: INK.ink, opacity: frame >= OUTRO_HOLD_FROM ? 1 : 0}}>{WEBSITE_CLOSING}</div><div style={{position: 'absolute', bottom: 64, left: 220, right: 220, textAlign: 'center', fontSize: textSizeForFrame(height, 'support'), lineHeight: 1.2, fontWeight: 700, color: INK.muted, opacity: frame >= OUTRO_HOLD_FROM ? 1 : 0}}>{WEBSITE_EXPERIENCE_DISCLOSURE}</div></AbsoluteFill>;
};

export const WebsiteShot: FC<{id: string}> = ({id}) => {
  switch (id) {
    case 'open': return <><Sequence durationInFrames={70}><InkTitleCard duration={70} segments={[{text: 'AXIO', accent: true}]} sub='AI 电商经营组织' /></Sequence><Sequence from={70} durationInFrames={140}><InkHeroSpotlight duration={140} pageSrc='dashboard-page.png' pageH={liveLayout.dashboard.pageH} box={goalBox} keys={[{frame: 0, cx: 720, cy: 420, zoom: 1.35, rotX: 0, rotY: 0, persp: 1400}, {frame: 28, cx: 720, cy: 245, zoom: 2.15, rotX: 5, rotY: -8, persp: 1400}, {frame: 140, cx: 720, cy: 245, zoom: 2.08, rotX: 5, rotY: -8, persp: 1400}]} caption='一句目标，进入 AXIO' /></Sequence></>;
    case 'goal-title': return <Title parts={['一句目标', '生成经营计划']} />;
    case 'plan-deal': return <InkDealFilter duration={180} pageSrc='dashboard-page.png' emptySrc='dashboard-empty-plate.png' pageH={liveLayout.dashboard.pageH} box={goalBox} keys={[{frame: 0, cx: 720, cy: 245, zoom: 2.1, rotX: 12, rotY: -18, persp: 1200}, {frame: 48, cx: 720, cy: 245, zoom: 1.8, rotX: 0, rotY: 0, persp: 1300}, {frame: 180, cx: 720, cy: 245, zoom: 2.05, rotX: 0, rotY: 0, persp: 1300}]} caption={ROLE_COPY.dispatcher} />;
    case 'pricing-detail': return <InkRowEmbed duration={96} pageSrc='matrix-pricing-page.png' emptySrc='matrix-pricing-empty-plate.png' pageH={liveLayout['matrix-pricing'].pageH} box={pricingBox} rows={5} keys={[{frame: 0, cx: 190, cy: 705, zoom: 1.75}, {frame: 76, cx: 190, cy: 740, zoom: 1.9}]} caption='成本 / 汇率 / 平台费 / 物流 / 目标利润' />;
    case 'governance-title': return <Title parts={['自动化之前', '先通过治理']} />;
    case 'governance-stack': return <InkStackPress duration={120} pageSrc='accio-governance-page.png' emptySrc='accio-governance-empty-plate.png' pageH={liveLayout['accio-governance'].pageH} box={governanceBox} labels={governanceChecks} keys={[{frame: 0, cx: 650, cy: 470, zoom: 1.35}, {frame: 90, cx: 650, cy: 490, zoom: 1.48}]} caption={ROLE_COPY.governor} />;
    case 'authority-map': return <AuthorityMap />;
    case 'readback-title': return <Title parts={['执行完成', '不等于业务成功']} />;
    case 'readback': return <InkDocumentReveal duration={120} pageSrc='supervisor-page.png' emptySrc='supervisor-empty-plate.png' pageH={liveLayout.supervisor.pageH} box={readbackBox} rows={5} keys={[{frame: 0, cx: 840, cy: 560, zoom: 2.2}, {frame: 82, cx: 840, cy: 560, zoom: 2.35}]} caption={authoritativeReadback} />;
    case 'control-title': return <Title parts={['当前仍是', '受控执行']} />;
    case 'capability': return <InkRowEmbed duration={138} pageSrc='accio-capabilities-page.png' emptySrc='accio-capabilities-empty-plate.png' pageH={liveLayout['accio-capabilities'].pageH} box={capabilityBox} rows={3} keys={[{frame: 0, cx: 390, cy: 350, zoom: 2.45}, {frame: 110, cx: 390, cy: 350, zoom: 2.7}]} caption={`${CURRENT_LIMITS.join(' / ')} · ${FUTURE_CAPABILITY}`} />;
    case 'founder-proof': return <FounderProof />;
    case 'outro': return <WebsiteOutro />;
    default: throw new Error(`Unknown website shot: ${id}`);
  }
};

void verified;
