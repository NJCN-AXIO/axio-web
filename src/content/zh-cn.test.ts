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

  it("expands every operating stage with actionable detail", () => {
    expect(zhCN.operatingLoop).toEqual([
      {
        title: "市场信号",
        detail:
          "汇总 Shopee 经营数据与多平台趋势，识别需求变化、竞争强度与供给机会。",
      },
      {
        title: "关键词与商品",
        detail:
          "把买家搜索词映射为供应链找品词，沉淀可追溯、可复核的商品候选。",
      },
      {
        title: "任务与定价",
        detail:
          "将站点、店铺、数量和运营策略拆成任务参数，并按成本公式反算目标售价。",
      },
      {
        title: "预览与确认",
        detail:
          "集中校验图片、SKU、风险词和利润边界，高风险写入在执行前人工确认。",
      },
      {
        title: "脚本执行",
        detail:
          "借助妙手 ERP 与受控脚本批量上架、改价和优化，过程持续记录任务状态。",
      },
      {
        title: "结果回读",
        detail:
          "回收执行结果、异常和经营数据，形成下一轮选品、定价与库存处理依据。",
      },
    ]);
  });

  it("rejects unsupported locales instead of mixing languages", () => {
    expect(getSiteContent()).toBe(zhCN);
    expect(() => getSiteContent("en-US" as Locale)).toThrowError(
      "Unsupported locale: en-US",
    );
  });
});
