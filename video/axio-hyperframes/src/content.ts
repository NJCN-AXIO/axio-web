export type SceneCopy = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  metrics?: Array<{value: string; label: string}>;
  asset?: string;
  accent?: 'orange' | 'green';
  kind?: 'standard' | 'organization' | 'status' | 'cta';
};

export const websiteCopy: SceneCopy[] = [
  {
    id: 'founder-proof',
    kicker: '来自真实经营现场',
    title: '116 家店，6 个站点',
    body: '不是凭空设计的产品，而是为解决真实店群经营问题，一步一步做出来的系统。',
    metrics: [{value: '116', label: '家店'}, {value: '6', label: '个站点'}],
    asset: 'matrix-pricing.webp',
  },
  {
    id: 'operating-layer',
    kicker: 'AXIO 智核',
    title: '从经营意图，到业务回读',
    body: '在妙手 ERP 之上连接市场信号、关键词、四平台选品、六站点定价与任务计划。',
    metrics: [{value: '2,906', label: '有效市场信号'}, {value: '1,013', label: '关键词资产'}],
    asset: 'control-center.webp',
  },
  {
    id: 'objective-plan',
    kicker: '自然语言任务编排',
    title: '一句经营目标，拆成可执行计划',
    body: '商品、站点、数量、利润和店群，被拆成范围、步骤、证据与验收标准。',
    metrics: [{value: '透明', label: '成本与费率'}, {value: '精准', label: '六站点控价'}],
    asset: 'task-pricing.webp',
  },
  {
    id: 'organization',
    kicker: 'AXIO 智核最终组织形态',
    title: '效率与治理，双轨制衡',
    body: 'AI 主管负责正式派发；ACCIO 监督方向与风险；创始人掌握最终决策权。',
    kind: 'organization',
  },
  {
    id: 'safety-locality',
    kicker: '非黑盒自动化',
    title: '先预览、检查、确认，再执行',
    body: '违禁词、品牌、图片、利润与租户权限集中校验。敏感凭证留在自己的电脑。',
    metrics: [{value: '本地', label: 'Windows 客户端'}, {value: '阻断', label: '证据不足'}],
    asset: 'risk-control.webp',
  },
  {
    id: 'readback',
    kicker: '经营闭环',
    title: '脚本跑完，不等于业务成功',
    body: '执行状态、异常、订单与利润持续回读，进入记忆和 Playbook，让下一次计划更可靠。',
    asset: 'supervisor.webp',
    accent: 'green',
  },
  {
    id: 'status-vision',
    kicker: 'CURRENT → NEXT → VISION',
    title: '受控执行，走向 7×24 黑灯运营',
    body: '真实能力逐项验收开放。未来仍然可监督、可纠偏、可随时停止。',
    kind: 'status',
  },
  {
    id: 'cta',
    kicker: 'AXIO 智核',
    title: '黑灯运营，不是黑盒自动化',
    body: '现在可在线体验前端演示',
    kind: 'cta',
  },
];

export const wechatCopy: SceneCopy[] = [
  {
    id: 'proof', kicker: '真实经营现场', title: '116 家店｜6 个站点',
    body: 'AXIO 智核，从真实 Shopee 店群经营问题里做出来。',
    metrics: [{value: '116', label: '家店'}, {value: '6', label: '个站点'}],
    asset: 'matrix-pricing.webp',
  },
  {
    id: 'loop', kicker: '从意图到回读', title: '一句目标，拆成经营计划',
    body: '市场信号、选品、透明定价和任务计划，在妙手 ERP 之上连成经营链。',
    asset: 'task-pricing.webp',
  },
  {
    id: 'governance', kicker: '双轨制衡', title: 'AI 主管执行｜ACCIO 纠偏',
    body: '专业 Agent 只负责建议，创始人掌握最终决策权。',
    kind: 'organization',
  },
  {
    id: 'safety', kicker: '可预览 · 可确认 · 可追溯', title: '黑灯运营，不是黑盒自动化',
    body: '关键动作先检查。没有验证过的脚本，AI 想调用也调不动。',
    asset: 'risk-control.webp',
  },
  {
    id: 'trial', kicker: '新品上线', title: '前 50 位粉丝｜免费试用 7 天',
    body: '最多接入 3 家店，先用计划模式体验 AXIO。',
    kind: 'cta',
  },
];
