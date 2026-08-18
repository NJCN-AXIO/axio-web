import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const downloadRoot = join(process.cwd(), "public", "downloads");

const templates = [
  [
    "stores.csv",
    "store_id,name,group,site,platform,timezone,currency,capacity,status",
  ],
  [
    "products.csv",
    "product_id,sku,model,title,description,cost,category,image_reference,status",
  ],
  [
    "categories.csv",
    "category_group,platform,level_1,level_2,site,mapping_status",
  ],
  [
    "keywords.csv",
    "keyword,type,site,category,source,review_status,availability_status",
  ],
  [
    "pricing.csv",
    "product_id,sku,purchase_cost,domestic_shipping,international_shipping,platform_fee,exchange_rate,target_profit,target_price",
  ],
] as const;

const manuals = ["customer-installation.md", "api-configuration.md"] as const;

const sensitivePatterns = [
  /sk-[a-z0-9_-]{8,}/i,
  /api[_ -]?key\s*[:=]\s*\S+/i,
  /\.axlic\b/i,
  /cookie\s*[:=]/i,
  /(?:chrome|edge)[\\/](?:user data|profiles?)/i,
  /D:\\shopee-auto-lister/i,
  /Founder|ACCIO|116 店/i,
  /内部 URL|私有备注|内部店铺/i,
];

function readAsset(...segments: string[]) {
  const path = join(downloadRoot, ...segments);
  expect(existsSync(path), `missing public asset: ${path}`).toBe(true);
  return readFileSync(path, "utf8");
}

describe("public download assets", () => {
  it.each(templates)("keeps %s header-only", (filename, expectedHeader) => {
    const text = readAsset("templates", filename);
    const lines = text.trim().split(/\r?\n/);

    expect(lines).toEqual([expectedHeader]);
  });

  it.each(manuals)("publishes the customer manual %s", (filename) => {
    const text = readAsset("manual", filename);

    expect(text).toMatch(/^# AXIO /);
    expect(text.length).toBeGreaterThan(300);
  });

  it("rejects secrets, customer records, and internal identifiers", () => {
    const assetTexts = [
      ...templates.map(([filename]) => readAsset("templates", filename)),
      ...manuals.map((filename) => readAsset("manual", filename)),
    ];

    for (const text of assetTexts) {
      for (const pattern of sensitivePatterns) {
        expect(text).not.toMatch(pattern);
      }
    }
  });

  it.each([
    "api_key=sk-example-secret",
    "license.axlic",
    "Cookie: session=secret",
    "Chrome/User Data/Profile 1",
    "D:\\shopee-auto-lister\\data",
    "Founder 内部店铺私有备注",
  ])("detects forbidden fixture content: %s", (fixture) => {
    expect(sensitivePatterns.some((pattern) => pattern.test(fixture))).toBe(
      true,
    );
  });
});
