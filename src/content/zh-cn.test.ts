import { describe, expect, it } from "vitest";

import { getSiteContent } from "./index";
import type { Locale } from "./types";
import { zhCN } from "./zh-cn";

describe("Simplified Chinese site content", () => {
  it("contains exactly the approved six groups and 21 NOW / 3 NEXT items", () => {
    const items = zhCN.capabilityGroups.flatMap((group) => group.items);

    expect(zhCN.capabilityGroups).toHaveLength(6);
    expect(items.filter((item) => item.status === "NOW")).toHaveLength(21);
    expect(items.filter((item) => item.status === "NEXT")).toHaveLength(3);
  });

  it("owns the approved proof, package, and local-client boundary copy", () => {
    expect(zhCN.proofValues.map((proof) => proof.value)).toEqual([
      "Shopee 店群运营",
      "妙手 ERP 协同",
      "自动化精准控价",
    ]);
    expect(zhCN.hero.subtitle).toContain("Shopee");
    expect(zhCN.hero.description).toContain("妙手 ERP");
    expect(JSON.stringify(zhCN)).not.toMatch(/116 店|六站点|6 个 Shopee 站点/);
    expect(zhCN.packages.map((item) => item.name)).toEqual([
      "Starter",
      "Professional",
      "Enterprise",
    ]);
    expect(zhCN.footer.boundary).toBe(
      "本地 Windows 客户端执行，敏感凭证留在客户环境",
    );
    expect(zhCN.hero.secondaryCta.href).toBe("#capabilities");
  });

  it("rejects unsupported locales instead of mixing languages", () => {
    expect(getSiteContent()).toBe(zhCN);
    expect(() => getSiteContent("en-US" as Locale)).toThrowError(
      "Unsupported locale: en-US",
    );
  });
});
