import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

const pageCam = () => readFileSync('src/v2/ink/PageCam.tsx', 'utf8');
const primitives = () => readFileSync('src/v2/ink/InkPrimitives.tsx', 'utf8');

describe('AXIO Ink Press shared primitives', () => {
  it('keeps the calibrated PageCam contract and layout-scale 3D zoom', () => {
    const source = pageCam();
    for (const field of ['frame', 'cx', 'cy', 'zoom', 'rotX', 'rotY', 'rotZ', 'persp']) {
      expect(source).toMatch(new RegExp(`${field}\\??:`));
    }
    expect(source).toContain('zoom,');
    expect(source).toContain('perspective');
    expect(source).toContain('transformOrigin');
    expect(source).toContain('{children}');
    expect(source).not.toContain("objectFit: 'contain'");
  });

  it('uses the approved AXIO token set instead of the amber template skin', () => {
    const source = primitives();
    expect(source).toContain("accent: '#EE4D2D'");
    expect(source).toContain("ink: '#111111'");
    expect(source).toContain("page: '#F4F6F9'");
    expect(source).toContain("surface: '#FFFFFF'");
    expect(source).toContain("muted: '#65758B'");
    expect(source).toContain("verified: '#0D7657'");
    expect(source).not.toContain('oklch(52% 0.115 65)');
  });

  it('uses Chinese semantic segments and zero-letter-spacing sans typography', () => {
    const source = primitives();
    expect(source).toContain('segments:');
    expect(source).toContain('Inter, "Microsoft YaHei", "PingFang SC", sans-serif');
    expect(source).toContain('fontWeight: 700');
    expect(source).toContain('letterSpacing: 0');
    expect(source).not.toContain("split(' ')");
  });

  it('preserves the calibrated timing envelopes and settled holds', () => {
    const source = primitives();
    expect(source).toContain('FLASH_CUT_FRAMES = 10');
    expect(source).toContain('TITLE_HOLD_FRAMES = 30');
    expect(source).toContain('BATCH_SETTLE_FRAMES = 15');
    expect(source).toContain('BRAND_HOLD_FRAMES = 30');
    expect(source).toContain('[0, duration * 0.4, duration]');
    expect(source).toContain('Easing.bezier(0.34, 1.4, 0.44, 1)');
  });

  it('exports every shared primitive required by the format-specific shots', () => {
    const source = primitives();
    for (const name of ['InkTitleCard', 'FlashCut', 'InkCaption', 'DigitRoll', 'BrandInkOpen', 'InkOutro']) {
      expect(source).toContain(`export const ${name}`);
    }
  });

  it('is deterministic across renders', () => {
    const source = `${pageCam()}\n${primitives()}`;
    expect(source).not.toContain('Math.random()');
    expect(source).not.toContain('Date.now()');
  });
});
