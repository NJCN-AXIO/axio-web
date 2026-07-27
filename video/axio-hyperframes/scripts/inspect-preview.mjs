import {chromium} from 'playwright';

const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1920, height: 1400}});
await page.route('**/*', async (route) => {
  if (route.request().method() !== 'GET') return route.abort('blockedbyclient');
  await route.continue();
});
await page.goto('http://127.0.0.1:8091/', {waitUntil: 'networkidle'});
console.log(await page.title());
console.log((await page.locator('[id]').evaluateAll((nodes) =>
  nodes.filter((node) => node.getBoundingClientRect().width > 200)
    .slice(0, 80).map((node) => ({tag: node.tagName, id: node.id}))
)).map((item) => `${item.tag}#${item.id}`).join('\n'));
console.log(await page.locator('button, [data-page], [onclick]').evaluateAll((nodes) =>
  nodes.slice(0, 100).map((node) => ({
    text: node.textContent?.trim().replace(/\s+/g, ' ').slice(0, 50),
    page: node.getAttribute('data-page'),
    click: node.getAttribute('onclick'),
  }))
));
await browser.close();
