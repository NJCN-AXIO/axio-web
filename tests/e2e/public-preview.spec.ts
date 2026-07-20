import { expect, test } from "@playwright/test";

test.describe("public product preview", () => {
  test("enters from the demo center and completes the simulated task", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./demo/");
    await page.getByRole("link", { name: "进入交互预览" }).click();
    await expect(page).toHaveURL(/\/preview\/$/);
    await expect(
      page.getByRole("heading", { name: "今日运营计划" }),
    ).toBeVisible();

    const productRequests: string[] = [];
    page.on("request", (request) => {
      if (["fetch", "xhr", "websocket"].includes(request.resourceType())) {
        productRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    await page.getByRole("button", { name: "新建任务" }).click();
    const action = page.getByRole("button", { name: "推进模拟任务" });
    await action.click();
    await action.click();
    await action.click();
    await expect(
      page.getByRole("button", { name: "模拟回读已完成" }),
    ).toBeDisabled();
    await expect(page.locator('[data-stage="verified"]')).toHaveClass(
      /is-complete/,
    );
    expect(productRequests).toEqual([]);
    await expect(
      page.getByRole("link", { name: "预约真实演示" }),
    ).toHaveAttribute("href", /\/demo\/$/);
    const siteRoot = new URL(page.url()).pathname.replace(/preview\/$/, "");
    await expect(page.locator("[data-site-home]").first()).toHaveAttribute(
      "href",
      siteRoot,
    );
  });

  test("uses a mobile drawer without page-level horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./preview/");
    const menu = page.getByRole("button", { name: "功能导航" });
    const menuBox = await menu.boundingBox();
    const mainBox = await page.locator("[data-preview-main]").boundingBox();
    expect(menuBox).not.toBeNull();
    expect(mainBox).not.toBeNull();
    expect((menuBox?.y ?? 0) + (menuBox?.height ?? 0)).toBeLessThanOrEqual(
      mainBox?.y ?? 0,
    );
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "精准定价" }).click();
    await expect(
      page.getByRole("heading", { name: "价格影子比较" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).toBe(false);
  });
});
