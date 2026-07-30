import {createHash} from 'node:crypto';
import {access, readFile, mkdir, mkdtemp, rename, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');

export const assertLoopbackBaseUrl = (value) => {
  const url = new URL(value);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('Capture base must be exact IPv4 loopback HTTP with an explicit port and root path');
  }
  return url;
};

export const CAPTURE_PAGES = [
  {name: 'dashboard', path: '/', activate: '[data-page="dashboard"]', root: '#page-dashboard', features: [
    {name: 'goal-card', selectors: ['#dashboard-supervisor-report', '.dashboard-supervisor-report']},
    {name: 'metric-card', selectors: ['#page-dashboard .stat-card', '.dashboard-kpi-grid > *']},
  ]},
  {name: 'supervisor', path: '/', activate: '[data-page="supervisor"]', root: '#page-supervisor', features: [
    {name: 'task-row', selectors: ['#page-supervisor [data-task-id]', '#page-supervisor table tbody tr', '#page-supervisor .card']},
    {name: 'readback-row', selectors: ['#page-supervisor [data-readback]', '#page-supervisor .supervisor-workspace', '#page-supervisor .card']},
  ]},
  {name: 'accio-overview', path: '/accio', root: '#accio-panel-overview', features: [
    {name: 'authority-row', selectors: ['#accio-panel-overview .accio-capability-band', '#accio-panel-overview .accio-status-band']},
    {name: 'overview-metric', selectors: ['#accio-panel-overview .accio-status-band', '#accio-panel-overview section']},
  ]},
  {name: 'accio-governance', path: '/accio?view=supervisor', root: '#accio-panel-supervisor', features: [
    {name: 'governance-row', selectors: ['#accio-panel-supervisor .accio-table-section', '#accio-panel-supervisor section']},
  ]},
  {name: 'accio-capabilities', path: '/accio?view=capabilities', root: '#accio-panel-overview', features: [
    {name: 'capability-state', selectors: ['#accio-capability-list [data-capability-id]']},
  ]},
  {name: 'matrix-pricing', path: '/static/116shop_dashboard.html', activate: '#tabPricing', root: 'body', disableScripts: true, features: [
    {name: 'pricing-row', selectors: ['#pricingTable tbody tr', '#pricing-table tbody tr', '[data-pricing-row]', '#contentPricing .panel', '#contentPricing']},
  ]},
];

export const classifyCaptureRequest = (method, requestUrl, baseUrl, attemptedWrites = []) => {
  const url = new URL(requestUrl);
  const base = assertLoopbackBaseUrl(baseUrl);
  if (method.toUpperCase() !== 'GET') {
    attemptedWrites.push(`${method.toUpperCase()} ${url.pathname}`);
    return 'block-write';
  }
  if (url.origin !== base.origin) return 'block-cross-origin';
  return 'allow';
};

const SENSITIVE_PATTERNS = [
  ['credential-label', /\b(?:api[ _-]?key|access[ _-]?token|secret|password)\b\s*[:=]/i],
  ['credential-label', /\b(?:sk|ak)-[a-z0-9_-]{8,}\b/i],
  ['customer-name', /(?:客户|买家|收件人)(?:姓名|名称)?\s*[:：]\s*[^\s，,]{2,}/i],
  ['internal-path', /(?:[a-z]:\\(?:users|desktop|documents|data)\\|\/(?:home|users|srv|opt)\/)[^\s]+/i],
  ['order-identifier', /(?:订单号|order[ _-]?id)\s*[:：#]?\s*[a-z0-9-]{10,}/i],
  ['tenant-private', /tenant[_ -]?private\s*[:=]\s*\S+/i],
  ['tenant-private', /(?:租户|tenant)(?:名称|name|id)?\s*[:：=]\s*(?!演示|demo|2\b)[^\s，,]{3,}/i],
  ['plan-identifier', /\bplan[_-][a-z0-9_-]{8,}\b/i],
  ['task-identifier', /\b(?:sup|task)[_-][a-z0-9_-]{8,}\b/i],
  ['acceptance-identifier', /\baccept(?:ance)?[_-][a-z0-9_-]{8,}\b/i],
  ['delegation-identifier', /\bdelegation[_-][a-z0-9_-]{8,}\b/i],
  ['opaque-internal-id', /\b[a-f0-9]{16,}\b/i],
  ['timestamp', /\b20\d{2}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?\b/],
  ['founder-pin', /\bfounder\s*pin\b|创始人\s*PIN/iu],
  ['internal-region', /(?:^|[\s，,、])(?:广州|山东|丹阳|上海)(?=$|[\s，,、])/u],
  ['live-release-status', /(?:已释放|已正式发布|released\s*[:=]\s*(?:1|true)|[1-9]\d*\/\d+\s*项能力已发布)/i],
  ['unattended-status', /(?:unattended\s*[:=]\s*(?:1|true)|无人值守[\s\S]{0,40}(?:已正式启用|已启用|运行中)|受控自动运行已启动)/i],
];

export const findSensitiveEvidence = (text) => SENSITIVE_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);

const DEMO_REPLACEMENTS = [
  {source: '\\bplan[_-][a-z0-9_-]{8,}\\b', flags: 'gi', replacement: '演示计划'},
  {source: '\\b(?:sup|task)[_-][a-z0-9_-]{8,}\\b', flags: 'gi', replacement: '演示任务'},
  {source: '\\baccept(?:ance)?[_-][a-z0-9_-]{8,}\\b', flags: 'gi', replacement: '演示验收'},
  {source: '\\bdelegation[_-][a-z0-9_-]{8,}\\b', flags: 'gi', replacement: '演示委托'},
  {source: '\\b[a-f0-9]{16,}\\b', flags: 'gi', replacement: '演示证据'},
  {source: '\\b20\\d{2}-\\d{2}-\\d{2}(?:[T\\s]\\d{2}:\\d{2}(?::\\d{2})?(?:Z|[+-]\\d{2}:?\\d{2})?)?\\b', flags: 'g', replacement: '冻结演示时间'},
  {source: 'founder\\s*pin|创始人\\s*PIN', flags: 'gi', replacement: '创始人授权'},
  {source: '广州|山东|丹阳|上海', flags: 'g', replacement: '演示区域'},
  {source: '受控自动运行已启动[^。\\n]*[。]?', flags: 'g', replacement: '当前受控执行 released=0 / unattended=0。'},
  {source: '无人值守批量铺货', flags: 'g', replacement: '批量铺货（规划能力）'},
  {source: '已正式启用', flags: 'g', replacement: '尚未开放'},
  {source: '已释放', flags: 'g', replacement: '受控执行'},
];

export const sanitizeEvidenceText = (text) => DEMO_REPLACEMENTS.reduce(
  (value, {source, flags, replacement}) => value.replace(new RegExp(source, flags), replacement),
  text,
);

const sanitizeDemoState = async (page) => page.evaluate((rules) => {
  const sanitize = (value) => rules.reduce(
    (next, {source, flags, replacement}) => next.replace(new RegExp(source, flags), replacement),
    value,
  );
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue) node.nodeValue = sanitize(node.nodeValue);
  }
  for (const node of document.querySelectorAll('input, textarea')) {
    const input = /** @type {HTMLInputElement | HTMLTextAreaElement} */ (node);
    input.value = sanitize(input.value);
    input.placeholder = sanitize(input.placeholder);
  }
}, DEMO_REPLACEMENTS);

export const createCaptureManifest = ({baseUrl, assets, blockedRequests, attemptedWrites, safetyScans}) => {
  assertLoopbackBaseUrl(baseUrl);
  if (attemptedWrites.length) throw new Error(`Blocked write attempts must remain empty: ${attemptedWrites.join(', ')}`);
  for (const asset of assets) {
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) throw new Error(`Invalid SHA-256 for ${asset.file}`);
  }
  const approvedPages = CAPTURE_PAGES.map(({name}) => name);
  const scannedPages = safetyScans?.map(({page}) => page) ?? [];
  if (JSON.stringify(scannedPages) !== JSON.stringify(approvedPages)) {
    throw new Error('Safety scan must cover all approved pages exactly once');
  }
  const findings = safetyScans.flatMap(({page, findings: pageFindings}) =>
    pageFindings.map((finding) => `${page}:${finding}`),
  );
  if (findings.length) throw new Error(`Safety scan failed: ${findings.join(', ')}`);
  return {
    version: 2,
    captured_at: new Date().toISOString(),
    base_url: baseUrl,
    platform_write: false,
    attempted_writes: [],
    blocked_requests: blockedRequests,
    data_safety: {status: 'passed', scanned_pages: scannedPages, findings: []},
    pages: CAPTURE_PAGES.map(({name, path: pagePath}) => ({name, path: pagePath})),
    assets,
  };
};

const sha256 = async (file) => createHash('sha256').update(await readFile(file)).digest('hex');

const installRouteGate = async (context, baseUrl, attemptedWrites, blockedRequests) => {
  await context.route('**/*', async (route) => {
    const request = route.request();
    const decision = classifyCaptureRequest(request.method(), request.url(), baseUrl, attemptedWrites);
    if (decision === 'allow') return route.continue();
    blockedRequests.push(`${request.method()} ${request.url()}`);
    return route.abort('blockedbyclient');
  });
};

const settlePage = async (page) => {
  await page.addStyleTag({content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  await page.evaluate(() => {
    for (const node of document.querySelectorAll('input, textarea, select, button')) {
      node.setAttribute('disabled', '');
      node.setAttribute('aria-disabled', 'true');
    }
    for (const node of document.querySelectorAll('input, textarea')) {
      const input = /** @type {HTMLInputElement | HTMLTextAreaElement} */ (node);
      if (!['number', 'range', 'checkbox', 'radio', 'button'].includes(input.type)) input.value = '';
      input.removeAttribute('placeholder');
    }
    for (const node of document.querySelectorAll('[contenteditable]')) node.removeAttribute('contenteditable');
  });
  await page.waitForTimeout(250);
};

const activateLocalControl = async (page, selector) => {
  if (!selector) return;
  const control = page.locator(selector).first();
  if (!(await control.count())) throw new Error(`Missing approved local navigation control: ${selector}`);
  await control.evaluate((node) => {
    const label = `${node.id} ${node.getAttribute('data-page') ?? ''} ${node.textContent ?? ''}`;
    if (/submit|confirm|execute|release|publish|upload|run task|执行|确认|发布|上传/i.test(label)) throw new Error(`Unsafe activation rejected: ${label}`);
    const pageName = node.getAttribute('data-page');
    if (pageName) {
      for (const panel of document.querySelectorAll('.page')) panel.classList.remove('active');
      document.querySelector(`#page-${pageName}`)?.classList.add('active');
      return;
    }
    if (node.id === 'tabPricing') {
      for (const tab of document.querySelectorAll('.tab-btn')) tab.classList.remove('active');
      node.classList.add('active');
      for (const panel of document.querySelectorAll('[id^="content"]')) {
        /** @type {HTMLElement} */ (panel).style.display = panel.id === 'contentPricing' ? '' : 'none';
      }
      return;
    }
    /** @type {HTMLElement} */ (node).click();
  });
  await page.waitForTimeout(300);
};

const visibleLocator = async (page, selectors) => {
  for (const selector of selectors) {
    const candidates = page.locator(selector);
    const count = await candidates.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = candidates.nth(index);
      if (await candidate.isVisible()) return candidate;
    }
  }
  throw new Error(`No visible approved capture target: ${selectors.join(', ')}`);
};

const documentBox = (locator) => locator.evaluate((node) => {
  const box = node.getBoundingClientRect();
  return {x: box.x + window.scrollX, y: box.y + window.scrollY, w: box.width, h: box.height};
});

const addAsset = async (assets, outputDir, file, kind) => {
  const absolute = path.join(outputDir, file);
  const metadata = await sharp(absolute).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Unreadable capture: ${file}`);
  const stats = await sharp(absolute).stats();
  if (stats.channels.every((channel) => channel.stdev < 0.5)) throw new Error(`Blank capture: ${file}`);
  assets.push({file, kind, width: metadata.width, height: metadata.height, sha256: await sha256(absolute)});
};

const openState = async (context, base, config) => {
  const page = await context.newPage();
  await page.setViewportSize({width: 1440, height: 1000});
  if (config.disableScripts) {
    const documentUrl = new URL(config.path, base).href;
    await page.route(documentUrl, async (route) => {
      const response = await route.fetch();
      await route.fulfill({response, headers: {...response.headers(), 'content-security-policy': "script-src 'none'"}});
    });
  }
  await page.goto(new URL(config.path, base).href, {waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(500);
  await activateLocalControl(page, config.activate);
  await sanitizeDemoState(page);
  await settlePage(page);
  const rootLocator = page.locator(config.root).first();
  await rootLocator.waitFor({state: 'visible'});
  return {page, rootLocator};
};

const pathExists = async (value) => {
  try {
    await access(value);
    return true;
  } catch {
    return false;
  }
};

export const publishCaptureBundle = async ({stagingDir, outputDir, layoutPath, layout}) => {
  const backupDir = await mkdtemp(path.join(path.dirname(outputDir), '.ink-capture-backup-'));
  const backupOutput = path.join(backupDir, 'evidence');
  const backupLayout = path.join(backupDir, 'live-layout.json');
  const stagedLayout = path.join(stagingDir, '.live-layout.json');
  await writeFile(stagedLayout, `${JSON.stringify(layout, null, 2)}\n`, 'utf8');
  const hadOutput = await pathExists(outputDir);
  const hadLayout = await pathExists(layoutPath);
  if (hadOutput) await rename(outputDir, backupOutput);
  if (hadLayout) await rename(layoutPath, backupLayout);
  try {
    await rename(stagingDir, outputDir);
    await rename(path.join(outputDir, '.live-layout.json'), layoutPath);
    await rm(backupDir, {recursive: true, force: true});
  } catch (error) {
    await rm(outputDir, {recursive: true, force: true});
    await rm(layoutPath, {force: true});
    if (hadOutput && await pathExists(backupOutput)) await rename(backupOutput, outputDir);
    if (hadLayout && await pathExists(backupLayout)) await rename(backupLayout, layoutPath);
    await rm(backupDir, {recursive: true, force: true});
    throw error;
  }
};

export const captureAxioInkAssets = async ({baseUrl = 'http://127.0.0.1:8080/', outputDir = path.join(root, 'public', 'evidence', 'ink'), layoutPath = path.join(root, 'src', 'v2', 'ink', 'live-layout.json')} = {}) => {
  const base = assertLoopbackBaseUrl(baseUrl);
  await mkdir(path.dirname(outputDir), {recursive: true});
  await mkdir(path.dirname(layoutPath), {recursive: true});
  const stagingDir = await mkdtemp(path.join(path.dirname(outputDir), '.ink-capture-next-'));
  const browser = await chromium.launch({headless: true});
  const attemptedWrites = [];
  const blockedRequests = [];
  const assets = [];
  const layout = {};
  const safetyScans = [];
  try {
    const pageContext = await browser.newContext({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 2});
    const cutoutContext = await browser.newContext({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 4});
    await installRouteGate(pageContext, base.href, attemptedWrites, blockedRequests);
    await installRouteGate(cutoutContext, base.href, attemptedWrites, blockedRequests);
    for (const config of CAPTURE_PAGES) {
      const {page, rootLocator} = await openState(pageContext, base, config);
      const pageSize = await page.evaluate(() => ({pageH: document.documentElement.scrollHeight, pageW: document.documentElement.scrollWidth}));
      const text = await rootLocator.innerText();
      const sensitive = findSensitiveEvidence(text);
      safetyScans.push({page: config.name, findings: sensitive});
      if (sensitive.length) throw new Error(`Sensitive evidence in ${config.name}: ${sensitive.join(', ')}`);
      await writeFile(path.join(stagingDir, `${config.name}.ocr.txt`), text, 'utf8');
      const pageFile = `${config.name}-page.png`;
      await page.screenshot({path: path.join(stagingDir, pageFile), fullPage: true, animations: 'disabled'});
      await addAsset(assets, stagingDir, pageFile, 'page');
      const boxes = {};
      const cutouts = {};
      const nodesToHide = [];
      for (const feature of config.features) {
        const locator = await visibleLocator(page, feature.selectors);
        boxes[feature.name] = await documentBox(locator);
        nodesToHide.push(locator);
      }
      for (const locator of nodesToHide) await locator.evaluate((node) => { node.style.visibility = 'hidden'; });
      const plateFile = `${config.name}-empty-plate.png`;
      await page.screenshot({path: path.join(stagingDir, plateFile), fullPage: true, animations: 'disabled'});
      await addAsset(assets, stagingDir, plateFile, 'empty-plate');
      await page.close();
      const {page: cutoutPage} = await openState(cutoutContext, base, config);
      for (const feature of config.features) {
        const locator = await visibleLocator(cutoutPage, feature.selectors);
        const file = `${config.name}-${feature.name}-4x.png`;
        await locator.screenshot({path: path.join(stagingDir, file), animations: 'disabled'});
        await addAsset(assets, stagingDir, file, 'cutout');
        cutouts[feature.name] = {file, ...boxes[feature.name]};
      }
      await cutoutPage.close();
      layout[config.name] = {...pageSize, boxes, cutouts};
    }
    await pageContext.close();
    await cutoutContext.close();
  } finally {
    await browser.close();
  }
  if (attemptedWrites.length) throw new Error(`Blocked write attempts: ${attemptedWrites.join(', ')}`);
  const manifest = createCaptureManifest({baseUrl: base.href, assets, blockedRequests, attemptedWrites, safetyScans});
  await writeFile(path.join(stagingDir, 'capture-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await publishCaptureBundle({stagingDir, outputDir, layoutPath, layout});
  return manifest;
};

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const manifest = await captureAxioInkAssets({baseUrl: process.env.AXIO_CAPTURE_BASE_URL ?? 'http://127.0.0.1:8080/'});
  console.log(`Captured ${manifest.pages.length} page states; blocked write attempts: ${manifest.attempted_writes.length}; platform_write=${manifest.platform_write}`);
}
