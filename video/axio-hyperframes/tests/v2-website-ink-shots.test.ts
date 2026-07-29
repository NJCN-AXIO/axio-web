import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {websiteV2} from '../src/v2/timeline';

const websiteShotsPath = 'src/v2/ink/WebsiteShots.tsx';
const source = () => existsSync(websiteShotsPath) ? readFileSync(websiteShotsPath, 'utf8') : '';

describe('AXIO website Ink Press shots', () => {
  it('provides the dedicated landscape shot renderer', () => {
    expect(existsSync(websiteShotsPath)).toBe(true);
  });

  it('maps every website timeline shot exactly once to its approved recipes', () => {
    const text = source();
    expect(text).toContain('export const WEBSITE_SHOT_RECIPES');
    for (const {id, recipe} of websiteV2.shots) {
      expect(text).toContain(`'${id}'`);
      for (const item of Array.isArray(recipe) ? recipe : [recipe]) {
        expect(text).toContain(`'${item}'`);
      }
    }
  });

  it('uses real AXIO evidence pages and 4x evidence cutouts', () => {
    const text = source();
    for (const asset of [
      'dashboard-page.png', 'dashboard-goal-card-4x.png',
      'supervisor-page.png', 'supervisor-readback-row-4x.png',
      'accio-overview-page.png', 'accio-overview-authority-row-4x.png',
      'accio-governance-page.png', 'accio-capabilities-capability-state-4x.png',
      'matrix-pricing-page.png', 'matrix-pricing-pricing-row-4x.png',
    ]) expect(text).toContain(asset);
    expect(text).toContain('<PageCam');
    expect(text).not.toContain("objectFit: 'contain'");
  });

  it('keeps authority, capability, and readback claims in their approved order', () => {
    const text = source();
    expect(text).toContain('ROLE_COPY.dispatcher');
    expect(text).toContain('ROLE_COPY.governor');
    expect(text).toContain('ROLE_COPY.executors');
    expect(text).toContain('FUTURE_CAPABILITY');
    expect(text.indexOf('authoritativeReadback')).toBeLessThan(text.indexOf('verified'));
  });

  it('holds the outro brand and disclosure for the final 120 frames', () => {
    const text = source();
    expect(text).toContain('OUTRO_HOLD_FROM = 150');
    expect(text).toContain('WEBSITE_EXPERIENCE_DISCLOSURE');
  });
});
