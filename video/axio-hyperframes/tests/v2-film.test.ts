import {describe, expect, it} from 'vitest';
import {
  CURRENT_LIMITS,
  FUTURE_COMMAND,
  TRIAL_LIMITS,
  WEBSITE_LAYOUTS,
  WEBSITE_EXPERIENCE_DISCLOSURE,
} from '../src/v2/copy';

describe('AXIO V2 commercial copy contract', () => {
  it('does not repeat the same website composition in adjacent beats', () => {
    for (let index = 1; index < WEBSITE_LAYOUTS.length; index += 1) {
      expect(WEBSITE_LAYOUTS[index]).not.toBe(WEBSITE_LAYOUTS[index - 1]);
    }
  });

  it('keeps current capability separate from advanced vision', () => {
    expect(CURRENT_LIMITS).toEqual([
      '受控执行',
      'released 0',
      'unattended 0',
    ]);
  });

  it('keeps the future command and frontend-only disclosure explicit', () => {
    expect(FUTURE_COMMAND).toBe('这个月，帮我赚 10 万。');
    expect(WEBSITE_EXPERIENCE_DISCLOSURE).toContain('未连接服务器');
    expect(WEBSITE_EXPERIENCE_DISCLOSURE).toContain('不含后端及真实执行能力');
  });

  it('shows every WeChat trial boundary', () => {
    expect(TRIAL_LIMITS).toEqual([
      '前 50 位粉丝',
      '7 天免费试用',
      '最多 3 家店',
      '计划模式',
      '离线授权每次不超过 24 小时',
    ]);
  });
});
