import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {websiteV2, wechatV2} from '../src/v2/timeline';

describe('AXIO V2 production narration generator', () => {
  const generator = readFileSync('scripts/generate-v2-audio.ps1', 'utf8');
  const cues = [...websiteV2.narration, ...wechatV2.narration];
  it('uses Yunxi at the approved slightly fast base rate', () => {
    expect(generator).toContain('$' + "Voice = 'zh-CN-YunxiNeural'" );
    expect(generator).toContain('$' + "Rate = '+6%'" );
    expect(generator).toContain('$' + 'MaxAttempts = 3');
  });
  it('generates exactly the authoritative timeline cues and text', () => {
    const serialized = JSON.parse(readFileSync('scripts/v2-narration-cues.json', 'utf8'));
    expect(serialized).toEqual(cues);
    expect(generator).toContain('v2-narration-cues.json');
    expect(generator).toContain('v2-spoken-overrides.json');
  });
  it('produces 48 kHz stereo voice while preserving natural dynamics', () => {
    expect(generator).toContain('-ar 48000 -ac 2');
    expect(generator).toContain('alimiter=limit=0.85');
    expect(generator).not.toContain('loudnorm=');
  });
  it('does not use desktop or MiniMax synthesis', () => {
    expect(generator).not.toContain('System.Speech');
    expect(generator).not.toContain('MiniMax');
  });
});
