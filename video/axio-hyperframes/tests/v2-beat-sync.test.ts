import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
describe('AXIO beat-synced audio layer', () => {
  it('provides deterministic beat analysis and a reusable audio component', () => {
    expect(existsSync('scripts/analyze-v2-beats.mjs')).toBe(true);
    expect(existsSync('src/v2/ink/audio.tsx')).toBe(true);
  });
  it('gates only BGM and retains narration plus SFX', () => {
    const source = existsSync('src/v2/ink/audio.tsx') ? readFileSync('src/v2/ink/audio.tsx','utf8') : '';
    expect(source).toContain('bgm ?');
    expect(source).toContain('NARRATION');
    expect(source).toContain('SFX');
    expect(source).toContain('house-vibez.mp3');
  });
  it('records traceable music attribution and no untraceable riser', () => {
    const path='public/audio/v2/ATTRIBUTION.md';
    const text=existsSync(path)?readFileSync(path,'utf8'):'';
    expect(text).toContain('House Vibez');
    expect(text).toContain('Lily J');
    expect(text).toContain('https://assets.mixkit.co/music/745/745.mp3');
    expect(text).not.toContain('riser-cine.mp3');
  });
});
