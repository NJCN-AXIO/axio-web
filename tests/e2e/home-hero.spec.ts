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

async function expectEvidenceLoaded(page: import("@playwright/test").Page) {
  const evidence = page.getByTestId("hero-product-evidence");
  await expect(evidence).toBeVisible();
  await expect
    .poll(() =>
      evidence.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  return evidence;
}

test.describe("homepage hero", () => {
  test("leads with real product evidence on wide screens", async ({ page }) => {
    await page.setViewportSize({ width: 2048, height: 1024 });
    await page.goto("./");

    await expectEvidenceLoaded(page);
    await expect(page.locator(".hero canvas")).toHaveCount(0);

    const headingBox = await page
      .getByRole("heading", { level: 1 })
      .boundingBox();
    const proofBox = await page.locator(".proof-strip").boundingBox();

    expect(headingBox).not.toBeNull();
    expect(proofBox).not.toBeNull();
    expect(headingBox!.y / 1024).toBeLessThan(0.32);
    expect(proofBox!.y).toBeLessThan(1024);
    await expectNoHorizontalOverflow(page);
  });

  test("preserves the responsive split and complete image", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 961, height: 760 });
    await page.goto("./");

    const evidence = await expectEvidenceLoaded(page);
    const copyBox = await page.locator(".hero__copy").boundingBox();
    const productBox = await page.locator(".hero__product").boundingBox();
    expect(copyBox).not.toBeNull();
    expect(productBox).not.toBeNull();
    expect(productBox!.x).toBeGreaterThan(copyBox!.x + copyBox!.width);

    const imageGeometry = await evidence.evaluate(
      (image: HTMLImageElement) => ({
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        width: image.getAttribute("width"),
        height: image.getAttribute("height"),
        objectFit: getComputedStyle(image).objectFit,
      }),
    );
    expect(imageGeometry).toMatchObject({
      naturalWidth: 1600,
      naturalHeight: 1823,
      width: "1600",
      height: "1823",
      objectFit: "contain",
    });

    await page.setViewportSize({ width: 960, height: 760 });
    const actionsBox = await page.locator(".hero__actions").boundingBox();
    const stackedProductBox = await page
      .locator(".hero__product")
      .boundingBox();
    expect(actionsBox).not.toBeNull();
    expect(stackedProductBox).not.toBeNull();
    expect(stackedProductBox!.y).toBeGreaterThan(
      actionsBox!.y + actionsBox!.height,
    );

    await page.setViewportSize({ width: 1440, height: 700 });
    await expectEvidenceLoaded(page);
    const lowHeroBox = await page.locator(".hero").boundingBox();
    const lowCopyBox = await page.locator(".hero__copy").boundingBox();
    const lowProductBox = await page.locator(".hero__product").boundingBox();
    expect(lowHeroBox).not.toBeNull();
    expect(lowCopyBox).not.toBeNull();
    expect(lowProductBox).not.toBeNull();
    expect(lowCopyBox!.x + lowCopyBox!.width).toBeLessThan(lowProductBox!.x);
    expect(lowCopyBox!.y).toBeGreaterThanOrEqual(lowHeroBox!.y);
    expect(lowProductBox!.y + lowProductBox!.height).toBeLessThanOrEqual(
      lowHeroBox!.y + lowHeroBox!.height + 1,
    );
    await expectNoHorizontalOverflow(page);
  });

  test("keeps evidence and actions usable on mobile and dark mode", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./");

    await expectEvidenceLoaded(page);
    const actionHeights = await page
      .locator(".hero__actions a")
      .evaluateAll((links) =>
        links.map((link) => link.getBoundingClientRect().height),
      );
    expect(actionHeights).toHaveLength(2);
    expect(Math.min(...actionHeights)).toBeGreaterThanOrEqual(44);
    await expectNoHorizontalOverflow(page);

    await page.evaluate(() => localStorage.setItem("axio-theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectEvidenceLoaded(page);
    await expectNoHorizontalOverflow(page);
  });
});
