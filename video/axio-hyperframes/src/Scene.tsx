import type {CSSProperties, FC} from 'react';
import {
  AbsoluteFill, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import {BRAND} from './constants';
import type {SceneCopy} from './content';
import manifest from '../public/data/manifest.json';

const font = 'Microsoft YaHei, PingFang SC, Arial, sans-serif';

const shell: CSSProperties = {
  background: BRAND.background,
  color: BRAND.ink,
  fontFamily: font,
  letterSpacing: 0,
  overflow: 'hidden',
};

const evidenceStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center',
};

const Evidence: FC<{asset: string; portrait: boolean}> = ({asset, portrait}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [5, 20], [0, 1], {extrapolateRight: 'clamp'});
  return <div style={{
    position: 'relative',
    overflow: 'hidden',
    background: BRAND.paper,
    border: '1px solid #DEDAD4',
    borderRadius: 8,
    padding: portrait ? 24 : 36,
    height: portrait ? 720 : 980,
    boxShadow: '0 24px 70px rgba(40,32,24,.12)',
    opacity: reveal,
    transform: `translateY(${(1 - reveal) * 16}px)`,
  }}>
    <img src={staticFile(`evidence/${asset}`)} style={evidenceStyle} />
  </div>;
};

const Metrics: FC<{items: NonNullable<SceneCopy['metrics']>; portrait: boolean}> = ({items, portrait}) => (
  <div style={{display: 'flex', gap: portrait ? 22 : 48, marginTop: portrait ? 44 : 56}}>
    {items.map((item) => <div key={item.value} style={{borderTop: `6px solid ${BRAND.orange}`, paddingTop: 16, minWidth: portrait ? 210 : 300}}>
      <div style={{fontSize: portrait ? 76 : 118, lineHeight: .95, fontWeight: 900}}>{item.value}</div>
      <div style={{fontSize: portrait ? 25 : 34, color: BRAND.muted, marginTop: 12}}>{item.label}</div>
    </div>)}
  </div>
);

const CopyBlock: FC<{copy: SceneCopy; portrait: boolean}> = ({copy, portrait}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 120}});
  return <div style={{transform: `translateY(${(1 - enter) * 24}px)`, opacity: enter}}>
    <div style={{fontSize: portrait ? 24 : 30, fontWeight: 800, color: BRAND.orange, marginBottom: 22}}>{copy.kicker}</div>
    <div style={{fontSize: portrait ? 72 : 116, lineHeight: 1.06, fontWeight: 900, maxWidth: portrait ? 900 : 1800}}>{copy.title}</div>
    <div style={{fontSize: portrait ? 30 : 42, lineHeight: 1.5, color: BRAND.muted, marginTop: 28, maxWidth: portrait ? 900 : 1600}}>{copy.body}</div>
    {copy.metrics ? <Metrics items={copy.metrics} portrait={portrait} /> : null}
  </div>;
};

const Org: FC<{portrait: boolean}> = ({portrait}) => {
  const nodes = [
    ['Founder / 创始人', '最终治理权'],
    ['ACCIO', '方向 · 权限 · 风险 · 纠偏'],
    ['AI Supervisor', '唯一正式任务派发者'],
    ['专业 Agent', '结构化建议层'],
    ['确定性执行器', 'G1 · G2 · Listing · 定价'],
  ];
  return <div style={{display: 'grid', gridTemplateColumns: portrait ? '1fr' : '1fr 1.25fr', gap: 30, marginTop: 42}}>
    {nodes.map(([name, role], index) => <div key={name} style={{
      gridColumn: !portrait && (index === 0 || index === 4) ? '1 / 3' : undefined,
      justifySelf: !portrait && (index === 0 || index === 4) ? 'center' : 'stretch',
      width: !portrait && (index === 0 || index === 4) ? '58%' : 'auto',
      background: index === 2 ? BRAND.orange : BRAND.paper,
      color: index === 2 ? '#fff' : BRAND.ink,
      border: '1px solid #DEDAD4',
      borderRadius: 8,
      padding: portrait ? '24px 28px' : '28px 34px',
    }}>
      <div style={{fontSize: portrait ? 32 : 42, fontWeight: 900}}>{name}</div>
      <div style={{fontSize: portrait ? 22 : 27, opacity: .72, marginTop: 6}}>{role}</div>
    </div>)}
  </div>;
};

const Status: FC<{portrait: boolean}> = ({portrait}) => (
  <div style={{display: 'grid', gridTemplateColumns: portrait ? '1fr' : 'repeat(3,1fr)', gap: 22, marginTop: 52}}>
    {[
      ['CURRENT', '受控执行', 'released 0 · unattended 0'],
      ['NEXT', '逐项验收开放', '租户 · 范围 · 证据 · 回读'],
      ['VISION', '7×24 黑灯运营', '可监督 · 可纠偏 · 可停止'],
    ].map(([phase, title, body], index) => <div key={phase} style={{background: index === 2 ? '#FFE9E1' : BRAND.paper, borderTop: `8px solid ${index === 2 ? BRAND.orange : '#C9C5BE'}`, padding: 30}}>
      <div style={{fontSize: 22, fontWeight: 900, color: BRAND.orange}}>{phase}</div>
      <div style={{fontSize: portrait ? 36 : 48, fontWeight: 900, marginTop: 18}}>{title}</div>
      <div style={{fontSize: portrait ? 22 : 28, color: BRAND.muted, marginTop: 12}}>{body}</div>
    </div>)}
  </div>
);

export const Scene: FC<{copy: SceneCopy; portrait?: boolean}> = ({copy, portrait = false}) => {
  const pad = portrait ? 70 : 150;
  const isCta = copy.kind === 'cta';
  const narration = (portrait ? manifest.wechat.scenes : manifest.website.scenes)
    .find((scene) => scene.id === copy.id)?.narration;
  return <AbsoluteFill style={{...shell, padding: pad}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: portrait ? 18 : 24, height: '100%', background: BRAND.orange}} />
    <div style={{fontSize: portrait ? 24 : 28, fontWeight: 900, position: 'absolute', top: portrait ? 34 : 54, right: pad}}>AXIO 智核</div>
    {isCta ? <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: portrait ? 900 : 2600}}>
      <CopyBlock copy={copy} portrait={portrait} />
      <div style={{marginTop: 52, paddingTop: 24, borderTop: '2px solid #D6D1CA', fontSize: portrait ? 22 : 27, color: BRAND.muted}}>
        {portrait ? '前 50 位 · 7 天免费 · 最多 3 家店 · 计划模式 · 离线授权每次不超过 24 小时' : '在线体验为前端演示，未连接服务器，不含后端及真实执行能力'}
      </div>
    </div> : <div style={{display: 'grid', gridTemplateColumns: portrait ? '1fr' : copy.asset ? '1.05fr 1fr' : '1fr', gap: portrait ? 36 : 100, alignItems: 'center', height: '100%'}}>
      <div>
        <CopyBlock copy={copy} portrait={portrait} />
        {copy.kind === 'organization' ? <Org portrait={portrait} /> : null}
        {copy.kind === 'status' ? <Status portrait={portrait} /> : null}
      </div>
      {copy.asset ? <Evidence asset={copy.asset} portrait={portrait} /> : null}
    </div>}
    {!isCta && narration ? <div style={{
      position: 'absolute',
      left: portrait ? 70 : 150,
      right: portrait ? 70 : 150,
      bottom: portrait ? 32 : 44,
      borderTop: '2px solid #D8D3CC',
      paddingTop: 14,
      fontSize: portrait ? 24 : 31,
      lineHeight: 1.45,
      color: '#3E3D39',
      background: BRAND.background,
    }}>{narration}</div> : null}
  </AbsoluteFill>;
};
