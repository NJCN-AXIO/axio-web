import { expect, test, type Page } from "@playwright/test";

type RequestMonitor = {
  observed: string[];
  violations: string[];
};

function monitorPreviewRequests(page: Page): RequestMonitor {
  const monitor: RequestMonitor = { observed: [], violations: [] };
  let previewOrigin: string | undefined;

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!url.protocol.startsWith("http")) return;

    previewOrigin ??= url.origin;
    const summary = `${request.method()} ${request.resourceType()} ${url.href}`;
    monitor.observed.push(summary);

    if (
      !(["GET", "HEAD"] as const).includes(request.method() as "GET" | "HEAD")
    ) {
      monitor.violations.push(`write request: ${summary}`);
    }
    if (
      ["fetch", "xhr", "websocket", "eventsource", "ping"].includes(
        request.resourceType(),
      )
    ) {
      monitor.violations.push(`dynamic request: ${summary}`);
    }
    if (url.origin !== previewOrigin) {
      monitor.violations.push(`external request: ${summary}`);
    }
    if (/\/api(?:\/|$)/.test(url.pathname)) {
      monitor.violations.push(`API request: ${summary}`);
    }
  });

  return monitor;
}

test.describe("faithful public product preview", () => {
  test("opens on the real new-task workspace by default", async ({ page }) => {
    await page.goto("./preview/");

    await expect(page.locator('[data-page="task"]')).toHaveClass(/active/);
    await expect(page.locator("#page-task")).toHaveClass(/active/);
    await expect(
      page.getByRole("heading", { name: "🚀 新建上架任务" }),
    ).toBeVisible();
    await expect(page.locator("#f-keywords")).toBeVisible();
    await expect(page.locator("#f-category")).toBeVisible();
    await expect(page.locator("#f-strategy")).toBeVisible();
    await expect(page.locator("#f-quantity")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "🚀 开始执行" }),
    ).toBeVisible();
  });

  test("completes the real manual task flow without browser API traffic", async ({
    page,
  }) => {
    const requests = monitorPreviewRequests(page);

    await page.goto("./preview/");
    await expect(page.locator("#pricing-shadow-status")).toHaveAttribute(
      "data-state",
      "approved_current",
    );
    await page.locator("#f-category").selectOption("家居生活");
    await page.locator("#f-keywords").fill("桌面收纳用品");
    await page.locator("#f-strategy").selectOption("sales");
    await page.locator("#f-quantity").fill("6");
    await page.locator("#f-audit-mode").selectOption("manual");
    await page.locator('#f-site-options input[value="MY"]').check();

    await page.getByRole("button", { name: "🚀 开始执行" }).click();

    const auditModal = page.locator("#audit-modal");
    await expect(auditModal).toBeVisible();
    await expect(
      auditModal.getByRole("heading", { name: "📋 审计报告" }),
    ).toBeVisible();
    await expect(page.locator("#audit-body")).toContainText("总计");
    await auditModal.getByRole("button", { name: "✅ 立即发布" }).click();

    await expect(page.getByText("✅ 模拟任务已完成")).toBeVisible();
    await page.getByRole("button", { name: "确定" }).click();
    await expect(auditModal).toBeHidden();
    await expect(page.locator("#progress-modal")).toBeHidden();

    expect(requests.observed.length).toBeGreaterThan(0);
    expect(requests.violations).toEqual([]);
  });

  test("keeps online-experience and site-home links on the deployment root", async ({
    page,
  }) => {
    await page.goto(".");
    const siteRoot = new URL(page.url()).pathname;
    const expectedPreviewPath = `${siteRoot}preview/`;
    const experienceLinks = page.getByRole("link", { name: "在线体验" });
    const experienceCount = await experienceLinks.count();

    expect(experienceCount).toBeGreaterThan(0);
    for (let index = 0; index < experienceCount; index += 1) {
      await expect(experienceLinks.nth(index)).toHaveAttribute(
        "href",
        expectedPreviewPath,
      );
    }

    await experienceLinks.first().click();
    await expect(page).toHaveURL(new RegExp(`${expectedPreviewPath}$`));

    const homeLinks = page.locator("[data-site-home]");
    await expect(homeLinks.first()).toBeAttached();
    const homeCount = await homeLinks.count();
    for (let index = 0; index < homeCount; index += 1) {
      await expect(homeLinks.nth(index)).toHaveAttribute("href", siteRoot);
    }
  });
});
