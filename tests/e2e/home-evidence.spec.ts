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
    test(
      "shows all four screenshots at a readable width at " +
        viewport.width +
        "px",
      async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("./");

        const images = await expectProductImagesLoaded(page);
        const shots = page.locator(".evidence-shot");
        await expect(shots).toHaveCount(4);

        const shotBoxes = await shots.evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect();
            return { x: box.x, width: box.width };
          }),
        );
        expect(
          shotBoxes.every(({ x }) => Math.abs(x - shotBoxes[0].x) < 2),
        ).toBe(true);
        expect(shotBoxes.every(({ width }) => width >= 1300)).toBe(true);

        const imageGeometry = await images.evaluateAll((nodes) =>
          nodes.map((node) => {
            const image = node as HTMLImageElement;
            const box = image.getBoundingClientRect();
            return {
              naturalWidth: image.naturalWidth,
              objectFit: getComputedStyle(image).objectFit,
              renderedWidth: box.width,
            };
          }),
        );
        expect(
          imageGeometry.every(({ objectFit }) => objectFit === "contain"),
        ).toBe(true);
        expect(
          imageGeometry.every(
            ({ naturalWidth, renderedWidth }) =>
              renderedWidth >= 1300 && renderedWidth <= naturalWidth + 1,
          ),
        ).toBe(true);
        await expect(page.locator(".evidence-shot__media")).toHaveCount(4);
        await expectNoHorizontalOverflow(page);
      },
    );
  }

  test("keeps evidence in one direct column on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");

    await expectProductImagesLoaded(page);
    const shotBoxes = await page
      .locator(".evidence-shot")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { x: box.x, y: box.y, height: box.height };
        }),
      );

    expect(shotBoxes.every(({ x }) => Math.abs(x - shotBoxes[0].x) < 2)).toBe(
      true,
    );
    for (let index = 1; index < shotBoxes.length; index += 1) {
      expect(shotBoxes[index].y).toBeGreaterThan(
        shotBoxes[index - 1].y + shotBoxes[index - 1].height,
      );
    }
    await expectNoHorizontalOverflow(page);
  });

  test("removes decorative hero guide lines", async ({ page }) => {
    await page.setViewportSize({ width: 2048, height: 1024 });
    await page.goto("./");

    const guides = await page.locator(".hero").evaluate((hero) => {
      const product = hero.querySelector(".hero__product") as HTMLElement;
      const productStyles = getComputedStyle(product);
      return {
        pseudoContent: getComputedStyle(hero, "::before").content,
        topBorder: productStyles.borderTopWidth,
        bottomBorder: productStyles.borderBottomWidth,
      };
    });

    expect(guides).toEqual({
      pseudoContent: "none",
      topBorder: "0px",
      bottomBorder: "0px",
    });
  });
  test("uses light screenshot backdrops instead of black side bars", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 2048, height: 1024 });
    await page.goto("./");
    await page.getByTestId("product-evidence").scrollIntoViewIfNeeded();

    for (const name of [
      "AXIO 违禁管控与风险词库界面",
      "AXIO 站点定价公式与利润反算界面",
    ]) {
      const channels = await page
        .getByRole("img", { name })
        .locator("..")
        .evaluate((media) =>
          (getComputedStyle(media).backgroundColor.match(/[\d.]+/g) ?? [])
            .slice(0, 3)
            .map(Number),
        );
      expect(Math.min(...channels)).toBeGreaterThan(220);
    }
  });

  test("keeps the homepage inverse CTA copy readable in both themes", async ({
    page,
  }) => {
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
    await expect(page.locator(".demo-booking__wechat")).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });
});
