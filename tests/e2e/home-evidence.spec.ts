import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
}

async function expectProductImagesLoaded(
  page: import("@playwright/test").Page,
) {
  await page.getByTestId("product-evidence").scrollIntoViewIfNeeded();
  const images = page.locator(".evidence-shot__image");
  await expect(images).toHaveCount(4);
  await expect
    .poll(() =>
      images.evaluateAll((nodes) =>
        nodes.every((node) => (node as HTMLImageElement).naturalWidth > 0),
      ),
    )
    .toBe(true);
  return images;
}

test.describe("homepage product evidence", () => {
  for (const viewport of [
    { width: 2048, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    test(`shows all four screenshots in two wide columns at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("./");

      const images = await expectProductImagesLoaded(page);
      const columns = page.locator(".evidence-showcase__column");
      await expect(columns).toHaveCount(2);

      const columnBoxes = await columns.evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { x: box.x, width: box.width };
        }),
      );
      expect(columnBoxes[1].x).toBeGreaterThan(
        columnBoxes[0].x + columnBoxes[0].width,
      );

      const imageGeometry = await images.evaluateAll((nodes) =>
        nodes.map((node) => {
          const image = node as HTMLImageElement;
          const box = image.getBoundingClientRect();
          return {
            objectFit: getComputedStyle(image).objectFit,
            renderedWidth: box.width,
          };
        }),
      );
      expect(
        imageGeometry.every(({ objectFit }) => objectFit === "contain"),
      ).toBe(true);
      expect(
        imageGeometry.every(({ renderedWidth }) => renderedWidth >= 520),
      ).toBe(true);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("collapses evidence to one column on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");

    await expectProductImagesLoaded(page);
    const columns = page.locator(".evidence-showcase__column");
    const columnBoxes = await columns.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, height: box.height };
      }),
    );

    expect(Math.abs(columnBoxes[0].x - columnBoxes[1].x)).toBeLessThan(2);
    expect(columnBoxes[1].y).toBeGreaterThan(
      columnBoxes[0].y + columnBoxes[0].height,
    );
    await expectNoHorizontalOverflow(page);
  });

  test("keeps inverse CTA copy readable in both themes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    for (const theme of ["light", "dark"]) {
      await page.addInitScript((value) => {
        localStorage.setItem("axio-theme", value);
      }, theme);
      await page.goto("./");

      const homepageRatios = await page
        .locator(".final-cta")
        .evaluate((section) => {
          const luminance = (rgb: number[]) => {
            const channels = rgb.map((value) => {
              const channel = value / 255;
              return channel <= 0.04045
                ? channel / 12.92
                : ((channel + 0.055) / 1.055) ** 2.4;
            });
            return (
              0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
            );
          };
          const parseColor = (value: string) =>
            (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
          const background = parseColor(
            getComputedStyle(section).backgroundColor,
          );
          const backgroundLuminance = luminance(background);
          return [
            section.querySelector(".final-cta__copy > p"),
            section.querySelector(".wechat-contact figcaption span"),
          ].map((node) => {
            const foreground = parseColor(
              getComputedStyle(node as Element).color,
            );
            const foregroundLuminance = luminance(foreground);
            return (
              (Math.max(backgroundLuminance, foregroundLuminance) + 0.05) /
              (Math.min(backgroundLuminance, foregroundLuminance) + 0.05)
            );
          });
        });

      expect(Math.min(...homepageRatios)).toBeGreaterThanOrEqual(4.5);

      await page.goto("./demo/");
      const marketingRatio = await page
        .locator(".marketing-cta")
        .evaluate((section) => {
          const parseColor = (value: string) =>
            (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
          const luminance = (rgb: number[]) => {
            const channels = rgb.map((value) => {
              const channel = value / 255;
              return channel <= 0.04045
                ? channel / 12.92
                : ((channel + 0.055) / 1.055) ** 2.4;
            });
            return (
              0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
            );
          };
          const background = luminance(
            parseColor(getComputedStyle(section).backgroundColor),
          );
          const copy = luminance(
            parseColor(
              getComputedStyle(section.querySelector("p") as Element).color,
            ),
          );
          return (
            (Math.max(background, copy) + 0.05) /
            (Math.min(background, copy) + 0.05)
          );
        });
      expect(marketingRatio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("keeps the WeChat QR large enough to scan", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("./");

    const qr = page.locator(".final-cta__wechat .wechat-contact__qr");
    await expect(qr).toBeVisible();
    const box = await qr.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(180);

    await page.goto("./demo/");
    const demoQr = page.locator(".demo-booking__wechat .wechat-contact__qr");
    await expect(demoQr).toBeVisible();
    const demoBox = await demoQr.boundingBox();
    expect(demoBox).not.toBeNull();
    expect(demoBox!.width).toBeGreaterThanOrEqual(180);
    await expectNoHorizontalOverflow(page);
  });
});
