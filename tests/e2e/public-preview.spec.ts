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
for (const entry of [
  {
    page: "dashboard",
    selector: "#page-dashboard",
    proof: "#dashboard-last-refresh",
    expected: "2026-07-20",
  },
  {
    page: "history",
    selector: "#page-history",
    proof: "#task-list",
    expected: "桌面收纳用品",
  },
  {
    page: "stores",
    selector: "#page-stores",
    proof: "#stores-tbody",
    expected: "演示店铺 A",
  },
]) {
  test(entry.page + " renders local operational data", async ({ page }) => {
    await page.goto("./preview/");
    await page.locator("[data-page=" + entry.page + "]").click();
    await expect(page.locator(entry.selector)).toHaveClass(/active/);
    await expect(page.locator(entry.proof)).toContainText(entry.expected);
  });
}

test("navigates the complete local selection decision chain", async ({
  page,
}) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");

  await page.locator("[data-page=selection]").click();
  await expect(page.locator("#page-selection")).toHaveClass(/active/);
  await expect(page.locator("#selection-candidates-body")).toContainText(
    "桌面收纳",
  );

  for (const entry of [
    { target: "hotpick", selector: "#page-hotpick" },
    { target: "keywords", selector: "#page-keywords" },
    { target: "orders", selector: "#page-orders" },
    { target: "tianji", selector: "#page-tianji" },
  ]) {
    await page.locator("[data-selection-target=" + entry.target + "]").click();
    await expect(page.locator(entry.selector)).toHaveClass(/active/);
  }

  await page.locator("[data-selection-target=candidates]").click();
  await expect(page.locator("[data-selection-panel=candidates]")).toHaveClass(
    /active/,
  );
  await expect(page.locator("#selection-candidates-body")).toContainText(
    "桌面收纳",
  );
  expect(requests.violations).toEqual([]);
});

test("collects and imports a fictional hotpick locally", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-selection-target=hotpick]").click();
  await page.locator(".hp-platform-card[data-platform=shopee]").click();
  await page.locator("#hp-site").selectOption("MY");
  await page.locator("#hp-category").selectOption("家居生活");
  await page.getByRole("button", { name: "🔍 开始采集" }).click();
  await expect(page.locator("#hp-results-list")).toContainText("便携收纳袋");
  await page.getByRole("button", { name: "📥 一键导入关键词库" }).click();
  await expect(page.getByText(/成功导入/)).toBeVisible();
  await page.getByRole("button", { name: "确定" }).click();

  await page.locator("[data-selection-target=keywords]").click();
  await expect(page.locator("#kw-tbody")).toContainText("便携收纳袋");
  expect(requests.violations).toEqual([]);
});

test("simulates local order feedback and candidate import", async ({
  page,
}) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-selection-target=orders]").click();
  await page.getByRole("button", { name: "同步并分析订单" }).click();
  await expect(page.locator("#order-tbody")).toContainText("桌面收纳套装");

  await page.locator("[data-selection-target=candidates]").click();
  await page.locator(".selection-import-btn").first().click();
  await expect(page.getByText(/关键词库已存在/)).toBeVisible();
  await page.getByRole("button", { name: "确定" }).click();
  expect(requests.violations).toEqual([]);
});

test("runs the local tianji analysis interaction", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-selection-target=tianji]").click();
  await page.getByRole("button", { name: "📥 加载演示数据" }).click();
  await expect(page.getByText(/演示数据已加载/)).toBeVisible();
  await page.getByRole("button", { name: "确定" }).click();
  await page.getByRole("button", { name: "🔍 开始田忌赛马分析" }).click();
  await expect(page.locator("#tj-result")).toContainText("利润款");
  expect(requests.violations).toEqual([]);
});

test("runs the local matrix workspace", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-page=shopboard]").click();
  const matrix = page.frameLocator("#shopboard-frame");
  await expect(
    matrix.getByRole("heading", { name: "📊 AXIO 矩阵经营看板" }),
  ).toBeVisible();
  await matrix.getByRole("button", { name: "⚡ 作战计划" }).click();
  await expect(matrix.locator("#tabBattle")).toHaveClass(/active/);
  await expect(matrix.locator("#uploadStatus")).toContainText("已同步");
  expect(requests.violations).toEqual([]);
});

test("runs a local optimization action", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-page=optimize]").click();
  await page.getByRole("heading", { name: "📦 库存同步" }).click();
  await page.getByRole("button", { name: "🚀 开始执行" }).click();
  await expect(page.locator("#opt-result")).toContainText("执行完成");
  expect(requests.violations).toEqual([]);
});

test("scores a local title candidate", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-page=titlelearn]").click();
  await page.locator(".tl-check").first().check();
  await page.getByRole("button", { name: "🤖 本地演示兜底评分" }).click();
  await expect(page.getByText(/评分完成/)).toBeVisible();
  await page.getByRole("button", { name: "确定" }).click();
  await expect(page.locator("#title-candidate-list")).toContainText("8.8");
  expect(requests.violations).toEqual([]);
});

test("scans a fictional title locally", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-page=ipcontrol]").click();
  await page.locator("#ip-test-title").fill("普通桌面收纳盒");
  await page.getByRole("button", { name: "扫描" }).click();
  await expect(page.locator("#ip-test-result")).toContainText("安全");
  expect(requests.violations).toEqual([]);
});

test("saves the fictional AI configuration locally", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-page=config]").click();
  await page.getByRole("button", { name: "保存配置" }).click();
  await expect(page.getByText(/演示配置已保存/)).toBeVisible();
  await page.getByRole("button", { name: "确定" }).click();
  expect(requests.violations).toEqual([]);
});

test("answers a supervisor question from local evidence", async ({ page }) => {
  const requests = monitorPreviewRequests(page);
  await page.goto("./preview/");
  await page.locator("[data-page=dashboard]").click();
  await page
    .locator("#supervisor-natural-input")
    .fill("今天完成了多少演示任务");
  await page.locator("#supervisor-send").click();
  await expect(page.locator("#supervisor-answer")).toBeVisible();
  await expect(page.locator("#supervisor-answer-text")).toContainText(
    "演示任务",
  );
  expect(requests.violations).toEqual([]);
});
