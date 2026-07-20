import { expect, test } from "@playwright/test";

test.describe("public product preview", () => {
  test("enters from the demo center and completes the simulated task", async ({
    page,
  }) => {
    const productRequests: string[] = [];
    page.on("request", (request) => {
      const framePath = new URL(request.frame().url()).pathname;
      if (!framePath.includes("/preview/")) return;
      const method = request.method();
      if (
        ["fetch", "xhr", "websocket", "ping"].includes(
          request.resourceType(),
        ) ||
        !["GET", "HEAD"].includes(method)
      ) {
        productRequests.push(`${method} ${request.url()}`);
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./demo/");
    await page.getByRole("link", { name: "进入交互预览" }).click();
    await expect(page).toHaveURL(/\/preview\/$/);
    await expect(
      page.getByRole("heading", { name: "今日运营计划" }),
    ).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);

    await page.getByRole("button", { name: "新建任务" }).click();
    const action = page.getByRole("button", { name: "推进模拟任务" });
    const actionBox = await action.boundingBox();
    expect(actionBox).not.toBeNull();
    expect(actionBox?.height ?? 0).toBeGreaterThanOrEqual(44);
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
    const sidebar = page.locator("[data-preview-sidebar]");
    await expect(sidebar).toHaveJSProperty("inert", true);
    const menuBox = await menu.boundingBox();
    const mainBox = await page.locator("[data-preview-main]").boundingBox();
    expect(menuBox).not.toBeNull();
    expect(mainBox).not.toBeNull();
    expect((menuBox?.y ?? 0) + (menuBox?.height ?? 0)).toBeLessThanOrEqual(
      mainBox?.y ?? 0,
    );
    const bookingBox = await page
      .getByRole("link", { name: "预约真实演示" })
      .boundingBox();
    expect(bookingBox).not.toBeNull();
    expect(bookingBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    const brandBox = await page.locator(".preview-brand").boundingBox();
    expect(brandBox).not.toBeNull();
    expect(brandBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toHaveJSProperty("inert", false);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
    await expect(sidebar).toHaveJSProperty("inert", true);
    await menu.click();
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
    const clippedText = await page
      .locator("button, a, h1, h2, p, strong, span")
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = getComputedStyle(element);
            return (
              element.textContent?.trim() &&
              element.scrollWidth > element.clientWidth + 1 &&
              !["auto", "scroll"].includes(style.overflowX)
            );
          })
          .map((element) => element.textContent?.trim()),
      );
    expect(clippedText).toEqual([]);
    const nestedViewportScrollers = await page
      .locator("body *")
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = getComputedStyle(element);
            return (
              element.clientHeight >= window.innerHeight * 0.8 &&
              element.scrollHeight > element.clientHeight + 1 &&
              ["auto", "scroll"].includes(style.overflowY)
            );
          })
          .map((element) => element.className),
      );
    expect(nestedViewportScrollers).toEqual([]);
  });
});
