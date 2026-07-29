export const FUTURE_COMMAND = '这个月，帮我赚 10 万。';

export const ROLE_COPY = {
  dispatcher: 'AI 主管 / 唯一正式派发',
  governor: 'ACCIO 超级主管 / 监督权限、风险、纠偏、记忆和审计',
  executors: 'G1 / G2 / 确定性执行与独立回读',
} as const;

export const FOUNDER_BACKGROUND =
  '创始人经营背景：116 家店 / 6 个站点 / 2 个租户';

export const CURRENT_LIMITS = [
  '受控执行',
  'released=0',
  'unattended=0',
] as const;

export const FUTURE_CAPABILITY = '规划能力 / 尚未开放';

export const WEBSITE_CLOSING =
  '这就是 AXIO。让每一次经营决策，都有计划、有边界、有回读。';
export const WECHAT_CLOSING = '这就是 AXIO。有计划，有边界，有回读。';

export const WEBSITE_EXPERIENCE_DISCLOSURE =
  '可在线先行体验 · 演示版未连接服务器 · 不含后端及真实执行能力';

export const WEBSITE_LAYOUTS = [
  'command-field',
  'authority-map',
  'statement-cut',
  'metric-triptych',
  'evidence-stage',
  'governance-split',
  'operating-loop',
  'status-rail',
  'brand-lockup',
] as const;

// Kept as a compatibility export until the portrait renderer is replaced in Task 5.
export const TRIAL_LIMITS = CURRENT_LIMITS;

export const PRICING_PARTS = [
  '采购成本',
  '汇率',
  '平台费',
  '物流',
  '目标利润',
] as const;

export const OPERATING_LOOP = [
  '经营目标',
  '证据计划',
  '获批执行',
  '结果回读',
  '复盘进化',
] as const;
