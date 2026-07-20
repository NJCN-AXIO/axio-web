import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const rendererPath = resolve(root, "scripts", "render-campaign-posters.mjs");
const rendererUrl = pathToFileURL(rendererPath).href;
const sourceQrPath = resolve(
  root,
  "public",
  "images",
  "contact",
  "wechat-nay.webp",
);

const qrPlacement = {
  left: 860,
  top: 1238,
  width: 150,
  height: 150,
};

async function readRawQr(path, extract = false) {
  let image = sharp(path);
  if (extract) {
    image = image.extract(qrPlacement);
  } else {
    image = image.resize(qrPlacement.width, qrPlacement.height, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      kernel: "nearest",
    });
  }

  return image.removeAlpha().raw().toBuffer();
}

describe("campaign poster renderer", () => {
  it("provides one price and one no-price campaign", async () => {
    expect(existsSync(rendererPath)).toBe(true);
    const { campaigns } = await import(/* @vite-ignore */ rendererUrl);

    expect(campaigns.map(({ key, showPrice }) => ({ key, showPrice }))).toEqual(
      [
        { key: "launch-price", showPrice: true },
        { key: "capabilities", showPrice: false },
      ],
    );
  });

  it("renders four correctly sized assets and preserves the approved QR image", async () => {
    expect(existsSync(rendererPath)).toBe(true);
    const {
      POSTER_HEIGHT,
      POSTER_WIDTH,
      assertCampaignAssets,
      renderCampaignPosters,
    } = await import(/* @vite-ignore */ rendererUrl);
    const outputs = await renderCampaignPosters();

    await expect(assertCampaignAssets(outputs)).resolves.toBeUndefined();
    expect(outputs).toHaveLength(4);

    const sourceQr = await readRawQr(sourceQrPath);

    for (const output of outputs) {
      const metadata = await sharp(output.path).metadata();
      expect(metadata.width).toBe(POSTER_WIDTH);
      expect(metadata.height).toBe(POSTER_HEIGHT);

      if (output.format === "png") {
        const posterQr = await readRawQr(output.path, true);
        expect(posterQr.equals(sourceQr)).toBe(true);
      }
    }
  });
});
