import type {FC} from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {CURRENT_LIMITS, OPERATING_LOOP, PRICING_PARTS} from './copy';
import {METRICS} from './evidence-model';
import {EvidenceLens} from './EvidenceLens';
import {OrganizationBoot} from './OrganizationBoot';
import {
  BrandMark,
  ImpactText,
  Kicker,
  Stage,
  VoiceCaption,
} from './primitives';
import {V2, range} from './theme';
import {websiteV2} from './timeline';

const beat = (id: string) => {
  const scene = websiteV2.scenes.find((item) => item.id === id);
  if (!scene) throw new Error(`Missing V2 scene: ${id}`);
  return scene;
};

const CommandScene: FC = () => {
  const frame = useCurrentFrame();
  const cursor = Math.floor(frame / 12) % 2 === 0;
  return (
    <Stage>
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 520,
        background: V2.orange,
      }} />
      <div style={{
        position: 'absolute',
        right: -92,
        top: 980,
        width: 700,
        transform: 'rotate(90deg)',
        color: V2.paper,
        fontSize: 28,
        fontWeight: 900,
      }}>FOUNDER COMMAND / AXIO</div>
      <BrandMark />
      <div style={{position: 'absolute', left: 180, top: 250, fontSize: 26, fontWeight: 900, color: V2.orange}}>
        OPERATING COMMAND / 经营目标
      </div>
      <ImpactText delay={-8} style={{
        position: 'absolute',
        left: 180,
        right: 720,
        top: 590,
        fontSize: 176,
        lineHeight: 1.08,
        fontWeight: 900,
      }}>
        “这个月，<br />帮我赚 10 万。”
        <span style={{display: 'inline-block', width: 20, height: 150, marginLeft: 24, background: V2.orange, opacity: cursor ? 1 : 0}} />
      </ImpactText>
      <div style={{
        position: 'absolute',
        left: 180,
        bottom: 230,
        width: `${range(frame, 18, 72) * 74}%`,
        height: 12,
        background: V2.orange,
      }} />
      <VoiceCaption>{beat('command').voice}</VoiceCaption>
    </Stage>
  );
};

const OrganizationScene: FC = () => (
  <Stage>
    <BrandMark />
    <div style={{position: 'absolute', left: 150, top: 78}}>
      <Kicker>AXIO ORGANIZATION BOOT</Kicker>
      <div style={{fontSize: 72, fontWeight: 900}}>目标进入，整个组织开始运转</div>
    </div>
    <OrganizationBoot />
    <VoiceCaption>{beat('organization-boot').voice}</VoiceCaption>
  </Stage>
);

const PositioningScene: FC = () => {
  const frame = useCurrentFrame();
  const cut = frame >= 76;
  return (
    <Stage dark={!cut} orange={cut}>
      <BrandMark light />
      <div style={{
        position: 'absolute',
        left: 180,
        right: 180,
        top: '50%',
        transform: 'translateY(-50%)',
      }}>
        {!cut ? (
          <ImpactText delay={4} style={{fontSize: 188, fontWeight: 900, lineHeight: 1}}>
            不是一个<br />
            <span style={{color: V2.orange}}>AI 工具</span>
          </ImpactText>
        ) : (
          <ImpactText delay={76} style={{fontSize: 196, fontWeight: 900, lineHeight: 1}}>
            是一套<br />AI 电商经营组织
          </ImpactText>
        )}
      </div>
      <VoiceCaption light>{beat('positioning').voice}</VoiceCaption>
    </Stage>
  );
};

const ProofScene: FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <BrandMark />
      <div style={{position: 'absolute', left: 150, right: 150, top: 140}}>
        <Kicker>FOUNDER OPERATING EVIDENCE</Kicker>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 80}}>
          {METRICS.map(([value, label], index) => (
            <div key={value} style={{
              borderTop: `12px solid ${index === 0 ? V2.orange : V2.ink}`,
              paddingTop: 28,
              transform: `translateY(${(1 - range(frame, index * 10, 18 + index * 10)) * 50}px)`,
              opacity: range(frame, index * 10, 18 + index * 10),
            }}>
              <div style={{fontSize: 190, fontWeight: 900, lineHeight: .9}}>{value}</div>
              <div style={{fontSize: 34, color: V2.muted, marginTop: 18}}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 820}}>
        <EvidenceLens asset='matrix-pricing.webp' label='店群经营矩阵' />
      </div>
      <VoiceCaption>{beat('proof').voice}</VoiceCaption>
    </Stage>
  );
};

const Formula: FC<{frame: number}> = ({frame}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
    marginTop: 48,
  }}>
    {PRICING_PARTS.map((part, index) => (
      <div key={part} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: range(frame, 210 + index * 14, 225 + index * 14)}}>
        <div style={{
          background: index === PRICING_PARTS.length - 1 ? V2.orange : V2.paper,
          color: index === PRICING_PARTS.length - 1 ? V2.paper : V2.ink,
          border: '1px solid #CDC7BE',
          padding: '18px 24px',
          fontSize: 28,
          fontWeight: 900,
        }}>{part}</div>
        {index < PRICING_PARTS.length - 1 ? <span style={{fontSize: 40, fontWeight: 300}}>+</span> : null}
      </div>
    ))}
  </div>
);

const PlanScene: FC = () => {
  const frame = useCurrentFrame();
  const phase = frame < 200 ? 'NATURAL LANGUAGE → PLAN' : frame < 400 ? 'TRANSPARENT PRICING' : 'EVIDENCE → ACCEPTANCE';
  return (
    <Stage>
      <BrandMark />
      <div style={{
        position: 'absolute',
        left: 150,
        top: 155,
        width: 1380,
        zIndex: 5,
      }}>
        <Kicker>{phase}</Kicker>
        <div style={{fontSize: 108, lineHeight: 1.04, fontWeight: 900}}>
          一句目标，<br />
          <span style={{color: V2.orange}}>拆成可验收计划</span>
        </div>
        <div style={{fontSize: 34, lineHeight: 1.55, color: V2.muted, marginTop: 34, maxWidth: 1160}}>
          商品 · 站点 · 数量 · 利润 · 店群<br />
          范围 · 前置条件 · 证据 · 验收标准
        </div>
        <Formula frame={frame} />
      </div>
      <div style={{
        position: 'absolute',
        left: 1700,
        right: 150,
        top: 220,
        transform: `perspective(1800px) rotateY(-3deg) translateX(${interpolate(range(frame, 0, 28), [0, 1], [90, 0])}px)`,
      }}>
        <EvidenceLens asset='task-pricing.webp' label='任务参数与透明控价' />
      </div>
      <div style={{
        position: 'absolute',
        left: 150,
        right: 150,
        bottom: 180,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 2,
      }}>
        {['目标已解析', '证据已组装', '风险待确认', '验收标准已生成'].map((label, index) => (
          <div key={label} style={{
            padding: '26px 30px',
            background: index === 3 ? V2.orange : V2.ink,
            color: V2.paper,
            fontSize: 25,
            fontWeight: 900,
            opacity: range(frame, 420 + index * 10, 434 + index * 10),
          }}>{String(index + 1).padStart(2, '0')} / {label}</div>
        ))}
      </div>
      <VoiceCaption>{beat('plan').voice}</VoiceCaption>
    </Stage>
  );
};

const GovernanceScene: FC = () => {
  const frame = useCurrentFrame();
  const gates = ['违禁词', '品牌', '图片', '利润', '租户权限', '脚本能力'];
  return (
    <Stage>
      <BrandMark />
      <div style={{position: 'absolute', left: 150, top: 140, width: 1420}}>
        <Kicker>GOVERNANCE BEFORE AUTOMATION</Kicker>
        <div style={{fontSize: 108, lineHeight: 1.02, fontWeight: 900}}>
          自动化之前，<br />先通过治理。
        </div>
        <div style={{marginTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
          {gates.map((gate, index) => (
            <div key={gate} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 28px',
              borderBottom: '1px solid #BEB8AF',
              fontSize: 30,
              fontWeight: 800,
              opacity: range(frame, 18 + index * 9, 32 + index * 9),
            }}>
              {gate}<span style={{color: index === 5 ? V2.orange : V2.green}}>{index === 5 ? '未验证即阻断' : 'CHECK'}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 54,
          padding: '30px 36px',
          background: V2.ink,
          color: V2.paper,
          fontSize: 30,
          fontWeight: 900,
        }}>
          ACCIO 监督纠偏　/　AI Supervisor 唯一正式派发
        </div>
      </div>
      <div style={{position: 'absolute', left: 1750, right: 150, top: 210}}>
        <EvidenceLens asset='risk-control.webp' label='风险阻断中心' />
      </div>
      <VoiceCaption>{beat('governance').voice}</VoiceCaption>
    </Stage>
  );
};

const ReadbackScene: FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(OPERATING_LOOP.length - 1, Math.floor(frame / 58));
  return (
    <Stage>
      <BrandMark />
      <div style={{position: 'absolute', left: 150, right: 150, top: 140}}>
        <Kicker>OPERATING LOOP / 经营闭环</Kicker>
        <div style={{fontSize: 98, fontWeight: 900}}>脚本完成，不等于业务成功。</div>
        <div style={{display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 100, marginTop: 70}}>
          <div>
            {OPERATING_LOOP.map((item, index) => (
              <div key={item} style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 180px',
                alignItems: 'center',
                padding: '28px 0',
                borderBottom: '1px solid #C9C3BA',
                color: index === active ? V2.orange : V2.ink,
                opacity: index <= active ? 1 : .35,
              }}>
                <span style={{fontSize: 24, fontWeight: 900}}>0{index + 1}</span>
                <span style={{fontSize: 48, fontWeight: 900}}>{item}</span>
                <span style={{fontSize: 22, textAlign: 'right'}}>TRACE / VERIFY</span>
              </div>
            ))}
          </div>
          <EvidenceLens asset='supervisor.webp' label='状态与结果回读' />
        </div>
      </div>
      <VoiceCaption>{beat('readback').voice}</VoiceCaption>
    </Stage>
  );
};

const VisionScene: FC = () => {
  const frame = useCurrentFrame();
  const items = [
    ['CURRENT', '受控执行', 'released 0 · unattended 0'],
    ['NEXT', '逐项验收开放', '范围 · 锁 · 证据 · 回读'],
    ['ADVANCED', '7×24 无人值守', '可监督 · 可纠偏 · 可停止'],
  ];
  return (
    <Stage>
      <BrandMark />
      <div style={{position: 'absolute', left: 150, right: 150, top: 220}}>
        <Kicker>CURRENT → NEXT → ADVANCED</Kicker>
        <div style={{fontSize: 112, fontWeight: 900}}>不是一键放权，是逐项进化。</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 120}}>
          {items.map(([phase, title, body], index) => (
            <div key={phase} style={{
              minHeight: 620,
              padding: '58px 54px',
              background: index === 2 ? V2.orange : index === 1 ? V2.ink : V2.paper,
              color: index === 0 ? V2.ink : V2.paper,
              transform: `translateY(${(1 - range(frame, 14 + index * 16, 30 + index * 16)) * 70}px)`,
              opacity: range(frame, 14 + index * 16, 30 + index * 16),
            }}>
              <div style={{fontSize: 24, fontWeight: 900, opacity: .8}}>{phase}</div>
              <div style={{fontSize: 66, lineHeight: 1.08, fontWeight: 900, marginTop: 110}}>{title}</div>
              <div style={{fontSize: 28, lineHeight: 1.5, marginTop: 34, opacity: .78}}>{body}</div>
              {index === 0 ? <div style={{marginTop: 110, display: 'flex', gap: 12}}>
                {CURRENT_LIMITS.map((limit) => <span key={limit} style={{fontSize: 20, border: '1px solid #BFB9B0', padding: '10px 14px'}}>{limit}</span>)}
              </div> : null}
            </div>
          ))}
        </div>
      </div>
      <VoiceCaption>{beat('vision').voice}</VoiceCaption>
    </Stage>
  );
};

const BrandScene: FC = () => (
  <Stage orange>
    <BrandMark light />
    <div style={{
      position: 'absolute',
      left: 180,
      right: 180,
      top: '47%',
      transform: 'translateY(-50%)',
    }}>
      <Kicker light>AXIO 智核</Kicker>
      <ImpactText style={{fontSize: 164, lineHeight: 1.02, fontWeight: 900}}>
        然后，整个 AI 组织<br />开始工作。
      </ImpactText>
      <div style={{fontSize: 34, marginTop: 52, fontWeight: 700}}>
        黑灯运营，不是黑盒自动化。
      </div>
    </div>
    <div style={{position: 'absolute', left: 180, bottom: 116, fontSize: 22, color: 'rgba(255,255,255,.86)'}}>
      未来高级版本愿景，不构成收益承诺 · 本片未触发真实平台写操作
    </div>
  </Stage>
);

export const WebsiteV2: FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile('audio/v2/website-bed.wav')} volume={0.48} />
    {websiteV2.scenes.map((scene) => (
      <Sequence key={`audio-${scene.id}`} from={scene.from} durationInFrames={scene.duration}>
        <Audio src={staticFile(`audio/v2/website-${scene.id}.wav`)} volume={1} />
      </Sequence>
    ))}
    <Sequence from={beat('command').from} durationInFrames={beat('command').duration}><CommandScene /></Sequence>
    <Sequence from={beat('organization-boot').from} durationInFrames={beat('organization-boot').duration}><OrganizationScene /></Sequence>
    <Sequence from={beat('positioning').from} durationInFrames={beat('positioning').duration}><PositioningScene /></Sequence>
    <Sequence from={beat('proof').from} durationInFrames={beat('proof').duration}><ProofScene /></Sequence>
    <Sequence from={beat('plan').from} durationInFrames={beat('plan').duration}><PlanScene /></Sequence>
    <Sequence from={beat('governance').from} durationInFrames={beat('governance').duration}><GovernanceScene /></Sequence>
    <Sequence from={beat('readback').from} durationInFrames={beat('readback').duration}><ReadbackScene /></Sequence>
    <Sequence from={beat('vision').from} durationInFrames={beat('vision').duration}><VisionScene /></Sequence>
    <Sequence from={beat('brand').from} durationInFrames={beat('brand').duration}><BrandScene /></Sequence>
  </AbsoluteFill>
);
