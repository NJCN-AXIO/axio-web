import {chromium} from 'playwright';

const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 2560, height: 1600}});
await page.route('**/*', (route) =>
  route.request().method() === 'GET' ? route.continue() : route.abort('blockedbyclient')
);
await page.goto('http://127.0.0.1:8091/', {waitUntil: 'networkidle'});
const pages = [
  ['dashboard', '控制台'], ['task', '新建任务'], ['selection', '选品决策'],
  ['keywords', '关键词库'], ['optimize', '智能优化'], ['ipcontrol', '违禁管控'],
];
for (const [name] of pages) {
  await page.locator('.page').evaluateAll((nodes) => nodes.forEach((node) => node.classList.remove('active')));
  await page.locator(`#page-${name}`).evaluate((node) => node.classList.add('active'));
  await page.waitForTimeout(100);
  const ids = await page.locator('[id]').evaluateAll((nodes) => nodes
    .filter((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 350 && box.height > 100 && getComputedStyle(node).display !== 'none';
    })
    .slice(0, 35)
    .map((node) => `${node.tagName}#${node.id}`));
  console.log(`\n[${name}]\n${ids.join('\n')}`);
}
await browser.close();
