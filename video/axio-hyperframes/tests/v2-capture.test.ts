import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {describe, expect, it} from 'vitest';
// @ts-expect-error The production capture script is intentionally plain ESM for direct Node execution.
import {assertLoopbackBaseUrl, CAPTURE_PAGES, classifyCaptureRequest, createCaptureManifest, findSensitiveEvidence} from '../scripts/capture-evidence.mjs';

describe('AXIO Ink Press evidence capture', () => {
  it('accepts only exact IPv4 loopback HTTP bases with an explicit port', () => {
    expect(assertLoopbackBaseUrl('http://127.0.0.1:8080/').href).toBe('http://127.0.0.1:8080/');
    for (const value of [
      'https://127.0.0.1:8080/',
      'http://localhost:8080/',
      'http://127.0.0.1/',
      'http://127.0.0.1:8080/path',
      'http://127.0.0.2:8080/',
    ]) {
      expect(() => assertLoopbackBaseUrl(value)).toThrow(/exact IPv4 loopback HTTP/);
    }
  });

  it('allows only same-origin GET requests and records blocked writes', () => {
    const writes: string[] = [];
    expect(classifyCaptureRequest('GET', 'http://127.0.0.1:8080/static/app.js', 'http://127.0.0.1:8080/', writes)).toBe('allow');
    expect(classifyCaptureRequest('GET', 'https://example.com/asset.js', 'http://127.0.0.1:8080/', writes)).toBe('block-cross-origin');
    expect(classifyCaptureRequest('POST', 'http://127.0.0.1:8080/api/run', 'http://127.0.0.1:8080/', writes)).toBe('block-write');
    expect(writes).toEqual(['POST /api/run']);
  });

  it('defines the six approved read-only page states', () => {
    expect(CAPTURE_PAGES.map(({name, path}: {name: string; path: string}) => [name, path])).toEqual([
      ['dashboard', '/'],
      ['supervisor', '/'],
      ['accio-overview', '/accio'],
      ['accio-governance', '/accio?view=supervisor'],
      ['accio-capabilities', '/accio?view=capabilities'],
      ['matrix-pricing', '/static/116shop_dashboard.html'],
    ]);
  });

  it('declares 2x pages, 4x cutouts, full pages, empty plates, and layout coordinates', () => {
    const source = readFileSync('scripts/capture-evidence.mjs', 'utf8');
    expect(source).toContain('deviceScaleFactor: 2');
    expect(source).toContain('deviceScaleFactor: 4');
    expect(source).toContain('fullPage: true');
    expect(source).toContain("'empty-plate'");
    expect(source).toContain("'cutout'");
    expect(source).toContain('pageH');
    expect(source).toContain('boxes');
    expect(source).toContain('cutouts');
  });

  it('creates a fail-closed manifest with hashes and no platform writes', () => {
    const manifest = createCaptureManifest({
      baseUrl: 'http://127.0.0.1:8080/',
      assets: [{file: 'dashboard-page.png', sha256: 'a'.repeat(64), width: 2560, height: 3200, kind: 'page'}],
      blockedRequests: ['GET https://example.com/font.woff2'],
      attemptedWrites: [],
    });
    expect(manifest.platform_write).toBe(false);
    expect(manifest.attempted_writes).toEqual([]);
    expect(manifest.assets[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(() => createCaptureManifest({
      baseUrl: 'http://127.0.0.1:8080/', assets: [], blockedRequests: [], attemptedWrites: ['POST /api/run'],
    })).toThrow(/write attempts/i);
  });

  it('rejects credential, private tenant, internal path, and order evidence', () => {
    expect(findSensitiveEvidence('API Key: sk-secret-value')).toContain('credential-label');
    expect(findSensitiveEvidence('C:\\Users\\operator\\private.csv')).toContain('internal-path');
    expect(findSensitiveEvidence('订单号 123456789012345')).toContain('order-identifier');
    expect(findSensitiveEvidence('tenant_private=merchant-one')).toContain('tenant-private');
    expect(findSensitiveEvidence('AXIO 智核\nAI 主管\n规划能力')).toEqual([]);
  });

  it('validates generated image dimensions, pixels, hashes, coordinates, and OCR sidecars', async () => {
    const manifest = JSON.parse(readFileSync('public/evidence/ink/capture-manifest.json', 'utf8'));
    const layout = JSON.parse(readFileSync('src/v2/ink/live-layout.json', 'utf8'));
    expect(manifest.platform_write).toBe(false);
    expect(manifest.attempted_writes).toEqual([]);
    expect(Object.keys(layout)).toEqual(CAPTURE_PAGES.map(({name}: {name: string}) => name));

    for (const config of CAPTURE_PAGES) {
      const pageLayout = layout[config.name];
      expect(pageLayout.pageH).toBeGreaterThan(0);
      expect(Object.keys(pageLayout.cutouts).length).toBeGreaterThan(0);
      const pageAsset = manifest.assets.find(({file}: {file: string}) => file === `${config.name}-page.png`);
      expect(pageAsset).toMatchObject({kind: 'page', width: pageLayout.pageW * 2, height: pageLayout.pageH * 2});
      expect(findSensitiveEvidence(readFileSync(`public/evidence/ink/${config.name}.ocr.txt`, 'utf8'))).toEqual([]);
      for (const box of Object.values(pageLayout.boxes) as Array<{x: number; y: number; w: number; h: number}>) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.w).toBeLessThanOrEqual(pageLayout.pageW + 0.01);
        expect(box.y + box.h).toBeLessThanOrEqual(pageLayout.pageH + 0.01);
      }
    }

    for (const asset of manifest.assets as Array<{file: string; width: number; height: number; sha256: string}>) {
      const bytes = readFileSync(`public/evidence/ink/${asset.file}`);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
      const metadata = await sharp(bytes).metadata();
      expect(metadata.width).toBe(asset.width);
      expect(metadata.height).toBe(asset.height);
      const stats = await sharp(bytes).stats();
      expect(stats.channels.some((channel) => channel.stdev > 0.5)).toBe(true);
    }
  });
});
