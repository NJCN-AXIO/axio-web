import { expect, test } from "@playwright/test";

test.describe("homepage operating loop and navigation state", () => {
  test("keeps the current route or capability anchor highlighted", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto("./product/");
    const desktopNav = page.getByRole("navigation", { name: "主导航" });
    await expect(
      desktopNav.getByRole("link", { name: "产品能力" }),
    ).toHaveAttribute("aria-current", "page");

    await desktopNav.getByRole("link", { name: "解决方案" }).click();
    await expect(page).toHaveURL(/\/solutions\/$/);
    await expect(
      desktopNav.getByRole("link", { name: "解决方案" }),
    ).toHaveAttribute("aria-current", "page");

    await page.goto("./");
    const capabilityLink = desktopNav.getByRole("link", {
      name: "能力矩阵",
    });
    await capabilityLink.click();
    await expect(page).toHaveURL(/\/#capabilities$/);
    await expect(capabilityLink).toHaveAttribute("aria-current", "location");
  });

  test("shares the active route with the mobile navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./product/");
    await page.getByRole("button", { name: "打开导航菜单" }).click();

    const dialog = page.getByRole("dialog", { name: "网站导航" });
    await expect(
      dialog.getByRole("link", { name: "产品能力" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("expands the six stages into a responsive three-column matrix", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./");

    const items = page.locator(".operating-loop li");
    await expect(items).toHaveCount(6);
    await expect(page.locator(".operating-loop__detail")).toHaveCount(6);
    const desktopBoxes = await items.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y };
      }),
    );
    expect(Math.abs(desktopBoxes[0].y - desktopBoxes[2].y)).toBeLessThan(2);
    expect(desktopBoxes[3].y).toBeGreaterThan(desktopBoxes[0].y);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileBoxes = await items.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { y: box.y, height: box.height };
      }),
    );
    for (let index = 1; index < mobileBoxes.length; index += 1) {
      expect(mobileBoxes[index].y).toBeGreaterThanOrEqual(
        mobileBoxes[index - 1].y + mobileBoxes[index - 1].height - 1,
      );
    }
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    ).toBe(false);
  });
});
