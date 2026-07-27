import type {FC} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {OPERATING_LOOP, TRIAL_LIMITS} from './copy';
import {EvidenceLens} from './EvidenceLens';
import {OrganizationBoot} from './OrganizationBoot';
import {BrandMark, ImpactText, Kicker, Stage, VoiceCaption} from './primitives';
import {V2, range} from './theme';
import {wechatV2} from './timeline';

const beat = (id: string) => {
  const scene = wechatV2.scenes.find((item) => item.id === id);
  if (!scene) throw new Error(`Missing V2 portrait scene: ${id}`);
  return scene;
};

const Organization: FC = () => (
  <Stage portrait>
    <BrandMark portrait />
    <div style={{position: 'absolute', left: 70, right: 70, top: 120}}>
      <Kicker>AXIO ORGANIZATION BOOT</Kicker>
      <div style={{fontSize: 70, lineHeight: 1.04, fontWeight: 900}}>
        不是一个 AI 工具<br />
        <span style={{color: V2.orange}}>是一套 AI 电商经营组织</span>
      </div>
    </div>
    <OrganizationBoot portrait />
    <VoiceCaption portrait>{beat('organization').voice}</VoiceCaption>
  </Stage>
);

const Proof: FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage portrait orange>
      <BrandMark portrait light />
      <div style={{position: 'absolute', left: 70, right: 70, top: 150}}>
        <Kicker light>REAL OPERATING EVIDENCE</Kicker>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34}}>
          {[
            ['116', '实际参与运营店铺'],
            ['6', '覆盖站点'],
          ].map(([value, label], index) => (
            <div key={value} style={{
              borderTop: '8px solid #111',
              paddingTop: 20,
              opacity: range(frame, index * 12, 18 + index * 12),
            }}>
              <div style={{fontSize: 126, lineHeight: .9, fontWeight: 900, color: V2.ink}}>{value}</div>
              <div style={{fontSize: 21, color: 'rgba(17,17,17,.75)', marginTop: 16}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop: 80}}>
          <EvidenceLens asset='matrix-pricing.webp' label='店群经营矩阵' portrait />
        </div>
      </div>
      <VoiceCaption portrait light>{beat('proof').voice}</VoiceCaption>
    </Stage>
  );
};

const Operating: FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(3, Math.floor(frame / 110));
  const stages = ['目标解析', '证据计划', '透明定价', '获批执行'];
  return (
    <Stage portrait>
      <BrandMark portrait />
      <div style={{position: 'absolute', left: 70, right: 70, top: 125}}>
        <Kicker>ONE COMMAND → OPERATING PLAN</Kicker>
        <div style={{fontSize: 70, lineHeight: 1.06, fontWeight: 900}}>
          一句话，拆成<br />
          <span style={{color: V2.orange}}>可验收经营计划</span>
        </div>
        <div style={{marginTop: 48}}>
          <EvidenceLens asset='task-pricing.webp' label='自然语言任务与控价' portrait />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: 28, gap: 2}}>
          {stages.map((stage, index) => (
            <div key={stage} style={{
              padding: '22px 20px',
              background: index <= active ? (index === active ? V2.orange : V2.ink) : '#D7D2CA',
              color: index <= active ? V2.paper : V2.muted,
              fontSize: 22,
              fontWeight: 900,
            }}>
              0{index + 1} / {stage}
            </div>
          ))}
        </div>
      </div>
      <VoiceCaption portrait>{beat('operating').voice}</VoiceCaption>
    </Stage>
  );
};

const Governance: FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage portrait dark>
      <BrandMark portrait light />
      <div style={{position: 'absolute', left: 70, right: 70, top: 120}}>
        <Kicker light>DUAL-TRACK GOVERNANCE</Kicker>
        <div style={{fontSize: 64, lineHeight: 1.08, fontWeight: 900}}>
          ACCIO 监督纠偏<br />
          <span style={{color: V2.orange}}>AI Supervisor 唯一派发</span>
        </div>
        <div style={{marginTop: 50}}>
          <EvidenceLens asset='risk-control.webp' label='风险与权限阻断' portrait />
        </div>
        <div style={{display: 'grid', gap: 2, marginTop: 26}}>
          {[
            ['专业 Agent', '只提交结构化建议'],
            ['AI Supervisor', '唯一正式任务派发者'],
            ['ACCIO', '方向 · 权限 · 风险 · 纠偏'],
          ].map(([name, role], index) => (
            <div key={name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '20px 22px',
              background: index === 1 ? V2.orange : '#262626',
              fontSize: 20,
              opacity: range(frame, 24 + index * 12, 38 + index * 12),
            }}>
              <strong>{name}</strong><span style={{opacity: .8}}>{role}</span>
            </div>
          ))}
        </div>
      </div>
      <VoiceCaption portrait light>{beat('governance').voice}</VoiceCaption>
    </Stage>
  );
};

const Trial: FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage portrait>
      <BrandMark portrait />
      <div style={{position: 'absolute', left: 70, right: 70, top: 150}}>
        <Kicker>NEW PRODUCT TRIAL</Kicker>
        <ImpactText style={{fontSize: 118, lineHeight: .95, fontWeight: 900}}>
          前 50 位
        </ImpactText>
        <ImpactText delay={12} style={{fontSize: 74, lineHeight: 1.05, fontWeight: 900, color: V2.orange, marginTop: 28}}>
          免费试用 7 天
        </ImpactText>
        <div style={{marginTop: 90}}>
          {TRIAL_LIMITS.slice(2).map((item, index) => (
            <div key={item} style={{
              padding: '30px 0',
              borderBottom: '2px solid #C7C1B8',
              fontSize: 30,
              fontWeight: 800,
              opacity: range(frame, 28 + index * 12, 42 + index * 12),
            }}>
              0{index + 1}　{item}
            </div>
          ))}
        </div>
        <div style={{marginTop: 100, background: V2.orange, color: V2.paper, padding: '32px 34px', fontSize: 36, fontWeight: 900}}>
          AXIO 智核　/　从计划模式开始
        </div>
        <div style={{marginTop: 30, fontSize: 20, lineHeight: 1.5, color: V2.muted}}>
          当前为受控执行 · 7×24 为未来高级版本愿景 · 不构成收益承诺
        </div>
      </div>
      <VoiceCaption portrait>{beat('trial').voice}</VoiceCaption>
    </Stage>
  );
};

export const WechatV2: FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile('audio/v2/wechat-bed.wav')} volume={0.48} />
    {wechatV2.scenes.map((scene) => (
      <Sequence key={`audio-${scene.id}`} from={scene.from} durationInFrames={scene.duration}>
        <Audio src={staticFile(`audio/v2/wechat-${scene.id}.wav`)} volume={1} />
      </Sequence>
    ))}
    <Sequence from={beat('organization').from} durationInFrames={beat('organization').duration}><Organization /></Sequence>
    <Sequence from={beat('proof').from} durationInFrames={beat('proof').duration}><Proof /></Sequence>
    <Sequence from={beat('operating').from} durationInFrames={beat('operating').duration}><Operating /></Sequence>
    <Sequence from={beat('governance').from} durationInFrames={beat('governance').duration}><Governance /></Sequence>
    <Sequence from={beat('trial').from} durationInFrames={beat('trial').duration}><Trial /></Sequence>
  </AbsoluteFill>
);
