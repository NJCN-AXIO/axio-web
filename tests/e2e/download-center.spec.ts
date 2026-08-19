import { expect, test } from "@playwright/test";

const templateLinks = [
  ["店铺导入模板", "downloads/templates/stores.csv"],
  ["商品导入模板", "downloads/templates/products.csv"],
  ["类目导入模板", "downloads/templates/categories.csv"],
  ["关键词导入模板", "downloads/templates/keywords.csv"],
  ["定价参数模板", "downloads/templates/pricing.csv"],
] as const;

test.describe("download center", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./download/");
  });

  test("opens the stable cloud folder while release metadata remains pending", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "下载 AXIO 客户端" }),
    ).toBeVisible();
    const download = page.getByRole("link", {
      name: "打开 AXIO 客户端下载文件夹",
    });
    await expect(download).toHaveAttribute(
      "href",
      "https://pan.xunlei.com/s/VP-P3BI7hG8hv-roJdqimWq9A1?pwd=ix5s",
    );
    await expect(download).toHaveAttribute("target", "_blank");
    await expect(download).toHaveAttribute("rel", "noreferrer");
    await expect(
      page
        .getByTestId("release-download")
        .locator("dd")
        .filter({ hasText: /^待发布$/ }),
    ).toHaveCount(4);
    await expect(page.locator('a[href=""]')).toHaveCount(0);
    await expect(page.getByTestId("wechat-contact")).toBeVisible();
  });

  test("resolves every blank template and customer manual", async ({
    page,
  }) => {
    for (const [label, suffix] of templateLinks) {
      const link = page.getByRole("link", { name: label });
      const href = await link.getAttribute("href");
      expect(href).toContain(suffix);
      const response = await page.request.get(new URL(href!, page.url()).href);
      expect(response.ok()).toBe(true);
    }

    for (const label of ["查看客户安装手册", "查看 API 配置手册"]) {
      const link = page.getByRole("link", { name: label });
      const href = await link.getAttribute("href");
      const response = await page.request.get(new URL(href!, page.url()).href);
      expect(response.ok()).toBe(true);
    }
  });

  test("expands native FAQ answers without client accordion state", async ({
    page,
  }) => {
    const faqCount = await page.locator("details").count();
    expect(faqCount).toBeGreaterThanOrEqual(45);
    const summary = page.getByText(
      "任务显示完成是否等于平台成功，未知写入为什么不重试？",
    );
    await summary.click();
    await expect(summary.locator("xpath=..")).toHaveAttribute("open", "");
    await expect(
      page.getByText(/平台写入结果未知时不会自动重试/),
    ).toBeVisible();
  });

  test("keeps customer secrets and internal identifiers out of the page", async ({
    page,
  }) => {
    const body = await page.locator("body").innerText();

    expect(body).not.toMatch(/sk-[a-z0-9_-]{8,}/i);
    expect(body).not.toContain("D:\\shopee-auto-lister");
    expect(body).not.toContain("116 店");
    await expect(page.locator('a[href$=".axlic"]')).toHaveCount(0);
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test("stays usable on mobile without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).toBe(false);
    await page.getByRole("button", { name: "打开导航菜单" }).click();
    await expect(
      page.getByRole("dialog", { name: "网站导航" }).getByRole("link", {
        name: "下载中心",
      }),
    ).toHaveAttribute("aria-current", "page");
  });
});
