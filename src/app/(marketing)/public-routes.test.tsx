import { render, screen, within } from "@testing-library/react";

import DemoPage, { metadata as demoMetadata } from "./demo/page";
import DownloadPage, { metadata as downloadMetadata } from "./download/page";
import PricingPage, { metadata as pricingMetadata } from "./pricing/page";
import PrivacyPage, { metadata as privacyMetadata } from "./privacy/page";
import ProductPage, { metadata as productMetadata } from "./product/page";
import SolutionsPage, { metadata as solutionsMetadata } from "./solutions/page";
import TermsPage, { metadata as termsMetadata } from "./terms/page";
import { capabilityGroups, getSiteContent } from "../../content";
import { demoVideos } from "../../content/videos";
import { withBasePath } from "../../config/site-path";

const watchDemoLabel = "\u89c2\u770b\u4ea7\u54c1\u6f14\u793a";

const publicRoutes = [
  {
    Page: ProductPage,
    heading: "一套可验证的店群经营系统",
    metadata: productMetadata,
  },
  {
    Page: SolutionsPage,
    heading: "按经营阶段扩展自动化",
    metadata: solutionsMetadata,
  },
  {
    Page: PricingPage,
    heading: "首发版本方案",
    metadata: pricingMetadata,
  },
  {
    Page: DemoPage,
    heading: "AXIO 产品演示",
    metadata: demoMetadata,
  },
  {
    Page: DownloadPage,
    heading: "下载 AXIO 客户端",
    metadata: downloadMetadata,
  },
  {
    Page: PrivacyPage,
    heading: "隐私政策",
    metadata: privacyMetadata,
  },
  {
    Page: TermsPage,
    heading: "服务条款",
    metadata: termsMetadata,
  },
] as const;

describe("public marketing routes", () => {
  it.each(publicRoutes)(
    "renders one H1 and a final demo CTA for $heading",
    ({ Page, heading }) => {
      render(<Page />);

      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(
        screen.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      if (Page === DemoPage) return;
      const demoLinks = screen.getAllByRole("link", { name: watchDemoLabel });
      expect(demoLinks.length).toBeGreaterThan(0);
      for (const link of demoLinks)
        expect(link).toHaveAttribute("href", "/demo");
    },
  );

  it("exports a unique title and description for every route", () => {
    const titles = publicRoutes.map(({ metadata }) => metadata.title);

    expect(new Set(titles).size).toBe(publicRoutes.length);
    for (const { metadata } of publicRoutes) {
      expect(metadata.title).toEqual(expect.any(String));
      expect(metadata.description).toEqual(expect.any(String));
    }
  });
});

it("renders all approved capability groups and delivery statuses", () => {
  render(<ProductPage />);

  for (const group of capabilityGroups) {
    expect(
      screen.getByRole("heading", { level: 2, name: group.title }),
    ).toBeVisible();
  }
  expect(screen.getAllByText("NOW")).toHaveLength(21);
  expect(screen.getAllByText("NEXT")).toHaveLength(3);
});

it("segments solutions by seller operating stage", () => {
  render(<SolutionsPage />);

  expect(document.body).not.toHaveTextContent(
    /\d+\s*至\s*\d+\s*家店|从\s*\d+\s*家店到\s*\d+\s*家店|六站点/,
  );

  for (const audience of ["起步卖家", "成长团队", "店群与服务商"]) {
    expect(screen.getByRole("heading", { name: audience })).toBeVisible();
  }
});

it("publishes the approved launch prices without online checkout", () => {
  render(<PricingPage />);

  const hero = screen
    .getByRole("heading", {
      level: 1,
      name: "首发版本方案",
    })
    .closest(".marketing-hero");
  expect(hero).not.toBeNull();
  expect(
    within(hero as HTMLElement).getByText("Windows 本地客户端"),
  ).toBeVisible();
  expect(within(hero as HTMLElement).getByText("不支持在线付款")).toBeVisible();

  const comparison = screen.getByTestId("package-comparison");
  for (const option of getSiteContent().packages) {
    const card = within(comparison).getByTestId(
      "package-" + option.name.toLowerCase(),
    );
    expect(
      within(card).getByRole("heading", {
        level: 2,
        name: `AXIO ${option.chineseName} ${option.name}`,
      }),
    ).toBeVisible();
    expect(within(card).getByText(option.annualPrice)).toBeVisible();
    expect(within(card).getByText(option.launchPrice)).toBeVisible();
  }
  expect(screen.getByText("首发仅限 20 席")).toBeVisible();
  expect(screen.getByText("最多 10 店")).toBeVisible();
  expect(screen.getByText("最多 50 店")).toBeVisible();
  expect(screen.getByText("最多 200 店")).toBeVisible();
  expect(screen.getByText("定制部署 ¥6,800 起")).toBeVisible();
  expect(screen.getByText("源码交付单独报价")).toBeVisible();
  expect(screen.getAllByText("不支持在线付款")).toHaveLength(2);
  expect(screen.getByText("具体交付以确认范围为准")).toBeVisible();
  expect(screen.queryByRole("button", { name: /购买|付款|结算/ })).toBeNull();
});

it("publishes a fail-closed download center with installation boundaries", () => {
  render(<DownloadPage />);

  expect(
    screen.getByRole("heading", { level: 1, name: "下载 AXIO 客户端" }),
  ).toBeVisible();
  expect(
    screen.getByText("正式下载链接准备中，请联系 AXIO 获取"),
  ).toBeVisible();
  expect(screen.getAllByText("Windows 10/11 x64")).toHaveLength(2);
  expect(screen.getByText("不需要安装 Python")).toBeVisible();
  expect(screen.getByText(/API Key 由客户自行配置/)).toBeVisible();
  expect(screen.getByText("手动并排升级，失败时回滚旧版本")).toBeVisible();
  expect(screen.getByRole("link", { name: "查看客户 FAQ" })).toHaveAttribute(
    "href",
    "#faq",
  );
  expect(screen.getByTestId("wechat-contact")).toBeVisible();
  expect(screen.getByText("微信咨询 · 楠 Nay")).toBeVisible();
  expect(screen.getByRole("link", { name: "店铺导入模板" })).toHaveAttribute(
    "href",
    withBasePath(getSiteContent().publicRelease.templateUrl),
  );
  expect(
    screen.getByRole("link", { name: "查看客户安装手册" }),
  ).toHaveAttribute(
    "href",
    withBasePath(getSiteContent().publicRelease.manualUrl),
  );
  expect(
    screen.getByRole("heading", { level: 2, name: "客户常见问题" }),
  ).toBeVisible();
  expect(screen.queryByRole("link", { name: /下载 AXIO/ })).toBeNull();
});

it("orders the interactive preview, full product demo, then core workflow", () => {
  render(<DemoPage />);

  const preview = screen.getByTestId("demo-interactive-preview");
  const full = screen.getByTestId("demo-full-product");
  const core = screen.getByTestId("demo-core-workflow");

  expect(within(preview).getByRole("link")).toHaveAttribute(
    "href",
    withBasePath("/preview/"),
  );
  expect(within(full).getByText(demoVideos.overview.title)).toBeVisible();
  expect(
    within(full).getByLabelText(new RegExp(demoVideos.overview.title)),
  ).toBeVisible();
  expect(preview.nextElementSibling).toBe(full);
  expect(full.nextElementSibling).toBe(core);
  expect(screen.queryByRole("form")).toBeNull();
  expect(screen.queryByTestId("demo-booking-form")).toBeNull();
});
it("states the privacy boundary for marketplace credentials", () => {
  render(<PrivacyPage />);

  expect(
    screen.getByText("官网不收集任何电商平台账号、密码、Cookie 或浏览器配置。"),
  ).toBeVisible();
});

it("states local-client responsibility and the no-payment boundary", () => {
  render(<TermsPage />);

  expect(
    screen.getByText("自动化任务由客户环境中的本地 Windows 客户端执行。"),
  ).toBeVisible();
  expect(screen.getByText("官网不提供在线付款或自动成交功能。")).toBeVisible();
});

it("renders the demo route as a watch-only product demonstration", () => {
  render(<DemoPage />);

  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByTestId("demo-full-product")).toBeVisible();
  expect(document.querySelectorAll("video")).toHaveLength(2);
  expect(screen.queryByTestId("demo-booking-form")).toBeNull();
  expect(screen.queryByRole("form")).toBeNull();
});
