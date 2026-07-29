import {describe, expect, it} from 'vitest';
import {
  CURRENT_LIMITS,
  FOUNDER_BACKGROUND,
  FUTURE_CAPABILITY,
  ROLE_COPY,
  WEBSITE_CLOSING,
  WECHAT_CLOSING,
} from '../src/v2/copy';
import {websiteV2, wechatV2} from '../src/v2/timeline';

const allCopy = [websiteV2, wechatV2]
  .flatMap((timeline) => [
    ...timeline.shots.map((shot) => shot.headline),
    ...timeline.narration.map((cue) => cue.text),
  ])
  .join('\n');

describe('AXIO V2 commercial copy contract', () => {
  it('keeps dispatcher and governance roles unambiguous', () => {
    expect(ROLE_COPY).toEqual({
      dispatcher: 'AI 主管 / 唯一正式派发',
      governor: 'ACCIO 超级主管 / 监督权限、风险、纠偏、记忆和审计',
      executors: 'G1 / G2 / 确定性执行与独立回读',
    });
    expect(allCopy).toContain('AI 主管');
    expect(allCopy).toContain('ACCIO 超级主管');
  });

  it('labels operating metrics as founder background rather than product capacity', () => {
    expect(FOUNDER_BACKGROUND).toBe('创始人经营背景：116 家店 / 6 个站点 / 2 个租户');
    expect(allCopy).toContain(FOUNDER_BACKGROUND);
  });

  it('states current and future capability boundaries exactly', () => {
    expect(CURRENT_LIMITS).toEqual(['受控执行', 'released=0', 'unattended=0']);
    expect(FUTURE_CAPABILITY).toBe('规划能力 / 尚未开放');
    expect(allCopy).toContain('released=0');
    expect(allCopy).toContain('unattended=0');
    expect(allCopy).toContain(FUTURE_CAPABILITY);
  });

  it('uses the approved closing lines', () => {
    expect(WEBSITE_CLOSING).toBe('这就是 AXIO。让每一次经营决策，都有计划、有边界、有回读。');
    expect(WECHAT_CLOSING).toBe('这就是 AXIO。有计划，有边界，有回读。');
    expect(websiteV2.narration.at(-1)?.text).toContain(WEBSITE_CLOSING);
    expect(wechatV2.narration.at(-1)?.text).toContain(WECHAT_CLOSING);
  });

  it.each(['前 50 位', '免费试用 7 天', '无人值守'])('excludes superseded claim %s', (claim) => {
    expect(allCopy).not.toContain(claim);
  });
});
