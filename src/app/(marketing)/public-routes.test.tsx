import { render, screen, within } from "@testing-library/react";

import DemoPage, { metadata as demoMetadata } from "./demo/page";
import PricingPage, { metadata as pricingMetadata } from "./pricing/page";
import PrivacyPage, { metadata as privacyMetadata } from "./privacy/page";
import ProductPage, { metadata as productMetadata } from "./product/page";
import SolutionsPage, { metadata as solutionsMetadata } from "./solutions/page";
import TermsPage, { metadata as termsMetadata } from "./terms/page";
import { capabilityGroups, getSiteContent } from "../../content";
import { demoVideos } from "../../content/videos";

const publicRoutes = [
  {
    Page: ProductPage,
    heading: "一套可验证的店群经营系统",
    metadata: productMetadata,
  },
  {
    Page: SolutionsPage,
    heading: "从 1 家店到 200 家店",
    metadata: solutionsMetadata,
  },
  {
    Page: PricingPage,
    heading: "按经营规模选择交付方式",
    metadata: pricingMetadata,
  },
  {
    Page: DemoPage,
    heading: "预约 AXIO 产品演示",
    metadata: demoMetadata,
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
      expect(
        screen.getByRole("link", { name: "预约产品演示" }),
      ).toHaveAttribute("href", "/demo");
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

it("segments solutions by seller operating scale", () => {
  render(<SolutionsPage />);

  for (const audience of ["起步卖家", "成长团队", "店群与服务商"]) {
    expect(screen.getByRole("heading", { name: audience })).toBeVisible();
  }
});

it("compares three contact-led packages without currency pricing", () => {
  render(<PricingPage />);

  const comparison = screen.getByTestId("package-comparison");
  for (const option of getSiteContent().packages) {
    expect(within(comparison).getByText(option.name)).toBeVisible();
  }
  expect(screen.getByText("不支持在线付款")).toBeVisible();
  expect(comparison).not.toHaveTextContent(/[¥￥$€£]\s*\d|\d\s*(元|美元)/);
  expect(screen.queryByRole("button", { name: /购买|付款|结算/ })).toBeNull();
});

it("orders the overview position, core workflow video, then booking form", () => {
  render(<DemoPage />);

  const overview = screen.getByTestId("demo-overview-position");
  const core = screen.getByTestId("demo-core-workflow");
  const form = screen.getByTestId("demo-booking-form");

  expect(within(overview).getByText(demoVideos.overview.title)).toBeVisible();
  expect(
    within(overview).queryByLabelText(/播放 AXIO 全局功能演示/),
  ).toBeNull();
  expect(within(core).getByText(demoVideos.coreWorkflow.title)).toBeVisible();
  expect(
    within(core).getByLabelText(`播放${demoVideos.coreWorkflow.title}`),
  ).toHaveAttribute("poster", demoVideos.coreWorkflow.poster);
  expect(overview.nextElementSibling).toBe(core);
  expect(core.nextElementSibling).toBe(form);
  expect(
    within(form).getByRole("form", { name: "预约产品演示" }),
  ).toHaveAttribute("action", "/api/demo-requests");
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
