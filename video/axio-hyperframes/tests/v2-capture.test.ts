import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {describe, expect, it} from 'vitest';
// @ts-expect-error The production capture script is intentionally plain ESM for direct Node execution.
import {assertLoopbackBaseUrl, CAPTURE_PAGES, classifyCaptureRequest, createCaptureManifest, findSensitiveEvidence, publishCaptureBundle, sanitizeEvidenceText} from '../scripts/capture-evidence.mjs';

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
      safetyScans: CAPTURE_PAGES.map(({name}: {name: string}) => ({page: name, findings: []})),
    });
    expect(manifest.platform_write).toBe(false);
    expect(manifest.attempted_writes).toEqual([]);
    expect(manifest.assets[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.data_safety).toEqual({
      status: 'passed',
      scanned_pages: CAPTURE_PAGES.map(({name}: {name: string}) => name),
      findings: [],
    });
    expect(() => createCaptureManifest({
      baseUrl: 'http://127.0.0.1:8080/', assets: [], blockedRequests: [], attemptedWrites: ['POST /api/run'], safetyScans: [],
    })).toThrow(/write attempts/i);
    expect(() => createCaptureManifest({
      baseUrl: 'http://127.0.0.1:8080/', assets: [], blockedRequests: [], attemptedWrites: [],
      safetyScans: CAPTURE_PAGES.map(({name}: {name: string}) => ({page: name, findings: name === 'supervisor' ? ['plan-identifier'] : []})),
    })).toThrow(/safety scan/i);
    expect(() => createCaptureManifest({
      baseUrl: 'http://127.0.0.1:8080/', assets: [], blockedRequests: [], attemptedWrites: [], safetyScans: [],
    })).toThrow(/all approved pages/i);
  });

  it('rejects credential, private tenant, internal path, and order evidence', () => {
    expect(findSensitiveEvidence('API Key: sk-secret-value')).toContain('credential-label');
    expect(findSensitiveEvidence('C:\\Users\\operator\\private.csv')).toContain('internal-path');
    expect(findSensitiveEvidence('订单号 123456789012345')).toContain('order-identifier');
    expect(findSensitiveEvidence('tenant_private=merchant-one')).toContain('tenant-private');
    expect(findSensitiveEvidence('AXIO 智核\nAI 主管\n规划能力')).toEqual([]);
  });

  it('rejects internal operating identifiers, timestamps, PIN labels, regions, and live execution state', () => {
    const cases = [
      ['plan-identifier', '当前有效 | plan_20260729_223715_55bdd20b0d6a3077'],
      ['task-identifier', '主任务 sup_4106a1ab49f0 · 刷新容量'],
      ['acceptance-identifier', '验收证据 accept_16fb7c7255ec4501'],
      ['delegation-identifier', '主管委托 delegation-06f5b2cc0f1ea8fcb2056a82'],
      ['timestamp', '观察 2026-07-29T22:42:21+08:00'],
      ['founder-pin', 'Founder PIN\n等待验证'],
      ['internal-region', '全部公司 广州 山东 丹阳 上海'],
      ['live-release-status', '营销执行 已释放'],
      ['unattended-status', '无人值守批量铺货\n已正式启用'],
      ['unattended-status', '受控自动运行已启动'],
    ] as const;
    for (const [label, text] of cases) expect(findSensitiveEvidence(text), text).toContain(label);
    expect(findSensitiveEvidence('受控执行 released=0 unattended=0 规划能力 / 尚未开放')).toEqual([]);
  });

  it('freezes internal and live page text into the approved sanitized demo state', () => {
    const unsafe = [
      '当前有效 | plan_20260729_223715_55bdd20b0d6a3077',
      '主任务 sup_4106a1ab49f0 · 验收 accept_16fb7c7255ec4501',
      '委托 delegation-06f5b2cc0f1ea8fcb2056a82 · 观察 2026-07-29T22:42:21+08:00',
      'Founder PIN · 广州 山东 丹阳 上海',
      '营销执行 已释放 · 无人值守批量铺货 已正式启用 · 受控自动运行已启动',
    ].join('\n');
    const sanitized = sanitizeEvidenceText(unsafe);
    expect(findSensitiveEvidence(sanitized)).toEqual([]);
    expect(sanitized).toContain('演示计划');
    expect(sanitized).toContain('受控执行');
    expect(sanitized).toContain('released=0');
    expect(sanitized).toContain('unattended=0');
    expect(sanitized).toContain('规划能力');
    expect(sanitized).toContain('尚未开放');
  });

  it('publishes a complete capture bundle by directory replacement', async () => {
    const sandbox = mkdtempSync(join(tmpdir(), 'axio-capture-publish-'));
    const current = join(sandbox, 'ink');
    const staging = join(sandbox, 'ink-next');
    const layoutPath = join(sandbox, 'live-layout.json');
    mkdirSync(current);
    mkdirSync(staging);
    writeFileSync(join(current, 'old.txt'), 'old');
    writeFileSync(join(staging, 'new.txt'), 'new');
    writeFileSync(layoutPath, '{"old":true}\n');
    try {
      await publishCaptureBundle({stagingDir: staging, outputDir: current, layoutPath, layout: {new: true}});
      expect(existsSync(join(current, 'new.txt'))).toBe(true);
      expect(existsSync(join(current, 'old.txt'))).toBe(false);
      expect(JSON.parse(readFileSync(layoutPath, 'utf8'))).toEqual({new: true});
    } finally {
      rmSync(sandbox, {recursive: true, force: true});
    }
  });

  it('accepts the current bundle only after every OCR sidecar is sanitized', () => {
    const findings = CAPTURE_PAGES.flatMap(({name}: {name: string}) =>
      findSensitiveEvidence(readFileSync(`public/evidence/ink/${name}.ocr.txt`, 'utf8')),
    );
    expect(findings).toEqual([]);
    const manifest = JSON.parse(readFileSync('public/evidence/ink/capture-manifest.json', 'utf8'));
    expect(manifest.version).toBe(2);
    expect(manifest.data_safety).toEqual({
      status: 'passed',
      scanned_pages: CAPTURE_PAGES.map(({name}: {name: string}) => name),
      findings: [],
    });
  });

  it('validates generated image dimensions, pixels, hashes, coordinates, and OCR sidecars', async () => {
    const manifest = JSON.parse(readFileSync('public/evidence/ink/capture-manifest.json', 'utf8'));
    const layout = JSON.parse(readFileSync('src/v2/ink/live-layout.json', 'utf8'));
    expect(manifest.platform_write).toBe(false);
    expect(manifest.attempted_writes).toEqual([]);
    expect(Object.keys(layout)).toEqual(CAPTURE_PAGES.map(({name}: {name: string}) => name));

    const overviewAuthority = manifest.assets.find(
      ({file}: {file: string}) => file === 'accio-overview-authority-row-4x.png',
    );
    const capabilityState = manifest.assets.find(
      ({file}: {file: string}) => file === 'accio-capabilities-capability-state-4x.png',
    );
    expect(capabilityState?.sha256).not.toBe(overviewAuthority?.sha256);

    for (const config of CAPTURE_PAGES) {
      const pageLayout = layout[config.name];
      expect(pageLayout.pageH).toBeGreaterThan(0);
      expect(Object.keys(pageLayout.cutouts).length).toBeGreaterThan(0);
      const pageAsset = manifest.assets.find(({file}: {file: string}) => file === `${config.name}-page.png`);
      expect(pageAsset).toMatchObject({kind: 'page', width: pageLayout.pageW * 2, height: pageLayout.pageH * 2});
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
