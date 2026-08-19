import { describe, expect, it } from "vitest";

import { getSiteContent } from "./index";
import type { Locale } from "./types";
import { zhCN } from "./zh-cn";

describe("Simplified Chinese site content", () => {
  it("routes the primary action to the static online experience", () => {
    expect(zhCN.hero.primaryCta).toEqual({
      label: "在线体验",
      href: "/preview/",
    });
  });

  it("links the download center and states the public delivery boundary", () => {
    expect(zhCN.navigation).toContainEqual({
      label: "下载中心",
      href: "/download",
    });
    expect(zhCN.footer.boundary).toBe(
      "不提供账号鉴权下载；仅提供需设备许可激活的通用客户包",
    );
  });

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
    expect(
      zhCN.packages.map((item) => ({
        name: item.name,
        chineseName: item.chineseName,
        annualPrice: item.annualPrice,
        launchPrice: item.launchPrice,
        featured: item.featured,
      })),
    ).toEqual([
      {
        name: "Starter",
        chineseName: "启航版",
        annualPrice: "¥999",
        launchPrice: "¥399",
        featured: false,
      },
      {
        name: "Professional",
        chineseName: "专业版",
        annualPrice: "¥1,999",
        launchPrice: "¥699",
        featured: true,
      },
      {
        name: "Team",
        chineseName: "团队版",
        annualPrice: "¥4,999",
        launchPrice: "¥1,999",
        featured: false,
      },
    ]);
    expect(zhCN.footer.boundary).toContain("需设备许可激活的通用客户包");
    expect(zhCN.hero.secondaryCta.href).toBe("#capabilities");
  });

  it("publishes explicit package capacity boundaries", () => {
    expect(zhCN.packages.map((item) => item.limits)).toEqual([
      ["最多 10 店", "6 站点 · 并发 1", "单人使用"],
      ["最多 50 店", "6 站点 · 并发 3", "单人专业运营"],
      ["最多 200 店", "12 站点 · 并发 10", "3 席位协作"],
    ]);
  });

  it("keeps exactly one promoted public package", () => {
    expect(
      zhCN.packages.map((item) => `${item.chineseName} ${item.name}`),
    ).toEqual(["启航版 Starter", "专业版 Professional", "团队版 Team"]);
    expect(zhCN.packages.filter((item) => item.featured)).toHaveLength(1);
    expect(zhCN.packages.find((item) => item.featured)?.name).toBe(
      "Professional",
    );
  });

  it("keeps unreleased public download URLs empty", () => {
    expect(zhCN.publicRelease).toMatchObject({
      releaseVersion: "待发布",
      downloadUrl: "",
      templateUrl: "/downloads/templates/stores.csv",
      manualUrl: "/downloads/manual/customer-installation.md",
    });
  });

  it("owns the complete categorized customer FAQ minimum", () => {
    const items = zhCN.faqGroups.flatMap((group) => group.items);

    expect(zhCN.faqGroups).toHaveLength(5);
    expect(items.length).toBeGreaterThanOrEqual(45);
    expect(items.filter((item) => item.priority)).toHaveLength(15);
    expect(new Set(items.map((item) => item.question)).size).toBe(items.length);
    for (const question of [
      "试用版有哪些限制，能否执行平台写入？",
      "店铺、站点、并发和团队席位如何计算？",
      "定制部署和源码交付包含什么，为什么单独报价？",
      "Excel 与 CSV 如何选择，重复或错误数据如何处理？",
      "是否支持妙手/Shopee 导出文件和分批导入？",
      "能否配置多个 Provider、备用路由、本地模型或私有 API？",
      "是否支持每日上新、分类、改价、营销、清理和商品优化？",
      "如何限制店铺、任务数量、并发、每日额度和自动化能力？",
      "理论利润与妙手结算净利润有何区别，缺少成本时能否自动改价？",
      "如何查看和下载最新版，网盘链接失效怎么办？",
      "哪些更新可以延后，未来是否支持自动更新？",
      "哪些问题属于 AXIO，哪些属于平台、妙手、网络或 Provider？",
    ]) {
      expect(items.map((item) => item.question)).toContain(question);
    }
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
