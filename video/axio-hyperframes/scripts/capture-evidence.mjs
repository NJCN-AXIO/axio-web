import {mkdir, unlink} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import sharp from 'sharp';

const base = new URL('http://127.0.0.1:8091/');
if (base.hostname !== '127.0.0.1' || base.protocol !== 'http:') {
  throw new Error('Capture must use exact IPv4 loopback HTTP');
}

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public', 'evidence');
const temp = path.join(out, '.capture.png');
await mkdir(out, {recursive: true});

const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 2560, height: 1600}, deviceScaleFactor: 1});
const writes = [];
await page.route('**/*', async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  if (request.method() !== 'GET') {
    writes.push(`${request.method()} ${url.pathname}`);
    return route.abort('blockedbyclient');
  }
  if (url.origin !== base.origin) return route.abort('blockedbyclient');
  await route.continue();
});
await page.goto(base.href, {waitUntil: 'networkidle'});

await page.locator('input, textarea').evaluateAll((nodes) => nodes.forEach((node) => {
  if (!['number', 'range', 'checkbox', 'radio', 'button'].includes(node.type)) node.value = '';
  node.removeAttribute('placeholder');
}));
await page.locator('select').evaluateAll((nodes) => nodes.forEach((node) => {
  if (node.options.length) node.selectedIndex = 0;
}));

const show = async (name) => {
  await page.locator('.page').evaluateAll((nodes) => nodes.forEach((node) => node.classList.remove('active')));
  await page.locator(`#page-${name}`).evaluate((node) => node.classList.add('active'));
  await page.waitForTimeout(80);
};

const capture = async (name, selector, pageName) => {
  await show(pageName);
  const target = page.locator(selector);
  await target.waitFor({state: 'visible'});
  await target.screenshot({path: temp, animations: 'disabled'});
  await sharp(temp)
    .flatten({background: '#FFFFFF'})
    .resize({width: 2000, withoutEnlargement: true})
    .webp({quality: 88, nearLossless: true})
    .toFile(path.join(out, name));
};

await capture('matrix-pricing.webp', '#page-dashboard', 'dashboard');
await capture('supervisor.webp', '#dashboard-supervisor-report', 'dashboard');
await capture('task-pricing.webp', '#task-legacy-workbench', 'task');
await capture('control-center.webp', '#page-selection', 'selection');
await capture('image-workspace.webp', '#kw-ai-intake-panel', 'keywords');
await capture('pricing-formula.webp', '#page-optimize', 'optimize');
await capture('risk-control.webp', '#page-ipcontrol', 'ipcontrol');

await unlink(temp).catch(() => {});
await browser.close();
if (writes.length) throw new Error(`Blocked write attempts: ${writes.join(', ')}`);
console.log('Captured 7 complete UI units; forwarded platform writes: 0');
