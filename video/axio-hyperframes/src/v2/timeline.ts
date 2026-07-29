import {
  CURRENT_LIMITS,
  FOUNDER_BACKGROUND,
  FUTURE_CAPABILITY,
  ROLE_COPY,
  WEBSITE_CLOSING,
  WECHAT_CLOSING,
} from './copy';
import type {V2Timeline} from './types';

export const websiteV2: V2Timeline = {
  frames: 1530,
  layout: 'landscape',
  shots: [
    {id: 'open', from: 0, duration: 210, recipe: ['brand-ink-open', 'spotlight-hero-card'], headline: 'AXIO · AI 电商经营组织'},
    {id: 'goal-title', from: 210, duration: 54, recipe: 'paper-title-card', headline: '一句目标，生成经营计划'},
    {id: 'plan-deal', from: 264, duration: 180, recipe: ['deck-deal-flyin', 'type-and-filter'], headline: ROLE_COPY.dispatcher},
    {id: 'pricing-detail', from: 444, duration: 96, recipe: 'row-embed', headline: '成本、汇率、平台费、物流与目标利润'},
    {id: 'governance-title', from: 540, duration: 54, recipe: 'paper-title-card', headline: '有执行，也有治理'},
    {id: 'governance-stack', from: 594, duration: 120, recipe: 'list-stack-press', headline: ROLE_COPY.governor},
    {id: 'authority-map', from: 714, duration: 120, recipe: 'spotlight-hero-card', headline: ROLE_COPY.executors},
    {id: 'readback-title', from: 834, duration: 54, recipe: 'paper-title-card', headline: '执行完成，不等于业务成功'},
    {id: 'readback', from: 888, duration: 120, recipe: 'document-typewriter-reveal', headline: '权威结果回读 · 已验证'},
    {id: 'control-title', from: 1008, duration: 54, recipe: 'paper-title-card', headline: '当前能力与未来边界'},
    {id: 'capability', from: 1062, duration: 138, recipe: 'row-embed', headline: `${CURRENT_LIMITS.join(' · ')} · ${FUTURE_CAPABILITY}`},
    {id: 'founder-proof', from: 1200, duration: 60, recipe: 'digit-roll', headline: FOUNDER_BACKGROUND},
    {id: 'outro', from: 1260, duration: 270, recipe: 'outro-group-photo-launch', headline: WEBSITE_CLOSING},
  ],
  narration: [
    {id: 'website-open', from: 0, duration: 180, text: 'AXIO，是一套为真实电商经营而生的 AI 组织。'},
    {id: 'website-goal-plan', from: 180, duration: 360, text: '你说目标，AI 主管唯一正式派发，拆成有证据、有验收的计划；定价成本逐项透明。'},
    {id: 'website-governance', from: 540, duration: 294, text: 'ACCIO 超级主管监督权限、风险、纠偏、记忆和审计。G1、G2 接受 AI 主管派发，确定性执行并独立回读。'},
    {id: 'website-readback', from: 888, duration: 120, text: '权威结果回读后，才标记已验证；异常不会伪装成成功。'},
    {id: 'website-control-founder', from: 1008, duration: 252, text: `当前${CURRENT_LIMITS[0]}，${CURRENT_LIMITS[1]}，${CURRENT_LIMITS[2]}。${FUTURE_CAPABILITY}。${FOUNDER_BACKGROUND}。`},
    {id: 'website-outro', from: 1260, duration: 270, text: WEBSITE_CLOSING},
  ],
  // Temporary audio/timing view for WebsiteV2.tsx until Task 4 replaces it.
  scenes: [
    {id: 'command', from: 0, duration: 150},
    {id: 'organization-boot', from: 150, duration: 150},
    {id: 'positioning', from: 300, duration: 120},
    {id: 'proof', from: 420, duration: 120},
    {id: 'plan', from: 540, duration: 300},
    {id: 'governance', from: 840, duration: 240},
    {id: 'readback', from: 1080, duration: 180},
    {id: 'vision', from: 1260, duration: 30},
    {id: 'brand', from: 1290, duration: 240},
  ],
};

export const wechatV2: V2Timeline = {
  frames: 1170,
  layout: 'portrait-independent',
  shots: [
    {id: 'open', from: 0, duration: 180, recipe: ['brand-ink-open', 'spotlight-hero-card'], headline: 'AXIO · AI 电商经营组织'},
    {id: 'goal-title', from: 180, duration: 45, recipe: 'paper-title-card', headline: '一句目标'},
    {id: 'plan-deal', from: 225, duration: 165, recipe: ['deck-deal-flyin', 'type-and-filter'], headline: ROLE_COPY.dispatcher},
    {id: 'pricing-detail', from: 390, duration: 90, recipe: 'row-embed', headline: '透明定价 · 逐项可查'},
    {id: 'governance-title', from: 480, duration: 45, recipe: 'paper-title-card', headline: '执行与治理'},
    {id: 'governance', from: 525, duration: 135, recipe: ['list-stack-press', 'spotlight-hero-card'], headline: `${ROLE_COPY.governor} · ${ROLE_COPY.executors}`},
    {id: 'readback-title', from: 660, duration: 45, recipe: 'paper-title-card', headline: '结果必须回读'},
    {id: 'readback', from: 705, duration: 135, recipe: 'document-typewriter-reveal', headline: '权威结果回读 · 已验证'},
    {id: 'control-title', from: 840, duration: 45, recipe: 'paper-title-card', headline: '能力有边界'},
    {id: 'capability', from: 885, duration: 135, recipe: 'row-embed', headline: `${CURRENT_LIMITS.join(' · ')} · ${FUTURE_CAPABILITY}`},
    {id: 'outro', from: 1020, duration: 150, recipe: 'outro-group-photo-launch', headline: WECHAT_CLOSING},
  ],
  narration: [
    {id: 'wechat-open', from: 0, duration: 180, text: 'AXIO，是一套为真实电商经营而生的 AI 组织。'},
    {id: 'wechat-goal-plan-pricing', from: 180, duration: 300, text: '一句目标，AI 主管唯一正式派发，拆成有证据、有验收的计划；定价逐项透明。'},
    {id: 'wechat-governance', from: 480, duration: 180, text: 'ACCIO 超级主管管权限和风险；G1、G2 由 AI 主管派发，确定性执行、独立回读。'},
    {id: 'wechat-readback-title', from: 660, duration: 45, text: '执行完成，不算成功。'},
    {id: 'wechat-readback', from: 705, duration: 135, text: '权威结果回读后，才标记已验证。'},
    {id: 'wechat-control', from: 840, duration: 180, text: `当前${CURRENT_LIMITS.join('，')}。${FUTURE_CAPABILITY}。`},
    {id: 'wechat-outro', from: 1020, duration: 150, text: WECHAT_CLOSING},
  ],
  // Temporary audio/timing view for WechatV2.tsx until Task 5 replaces it.
  scenes: [
    {id: 'organization', from: 0, duration: 240},
    {id: 'proof', from: 240, duration: 180},
    {id: 'operating', from: 420, duration: 300},
    {id: 'governance', from: 720, duration: 300},
    {id: 'trial', from: 1020, duration: 150},
  ],
};
