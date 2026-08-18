import { render, screen, within } from "@testing-library/react";
import { demoVideos } from "@/content/videos";
import HomePage from "./page";

const watchDemoLabel = "\u89c2\u770b\u4ea7\u54c1\u6f14\u793a";

function expectImageSource(
  image: HTMLElement,
  expectedPath: string,
): HTMLImageElement {
  expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(
    expectedPath,
  );
  return image as HTMLImageElement;
}

it("renders the approved homepage identity, proof, and capability boundaries", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("heading", { level: 1, name: "AXIO 智核" }),
  ).toBeVisible();
  expect(
    screen.getByText("面向 Shopee 的跨境电商店群全自动化运营系统"),
  ).toBeVisible();
  expect(screen.getByRole("link", { name: "在线体验" })).toHaveAttribute(
    "href",
    "/preview",
  );
  expect(screen.getByRole("link", { name: "查看产品能力" })).toHaveAttribute(
    "href",
    "#capabilities",
  );
  expectImageSource(
    screen.getByRole("img", { name: "AXIO 店群运营控制台全景" }),
    "/images/product-evidence/control-center.webp",
  );
  expect(document.querySelector("canvas")).not.toBeInTheDocument();
  expect(screen.getAllByText("NOW")).toHaveLength(21);
  expect(screen.getAllByText("NEXT")).toHaveLength(3);
  expect(screen.getByText("Shopee 店群运营")).toBeVisible();
  expect(screen.getByText("妙手 ERP 协同")).toBeVisible();
  expect(screen.getByText("自动化精准控价")).toBeVisible();
  expect(screen.queryByText("116 家店铺")).not.toBeInTheDocument();
  expect(screen.queryByText("6 个 Shopee 站点")).not.toBeInTheDocument();
  expect(screen.queryByText("4 个市场信号平台")).not.toBeInTheDocument();
  const packageCtas = within(screen.getByTestId("package-band")).getAllByRole(
    "link",
    { name: watchDemoLabel },
  );
  expect(packageCtas).toHaveLength(3);
  const packageBand = screen.getByTestId("package-band");
  expect(within(packageBand).getByText("AXIO 启航版 Starter")).toBeVisible();
  expect(
    within(packageBand).getByText("AXIO 专业版 Professional"),
  ).toBeVisible();
  expect(within(packageBand).getByText("AXIO 团队版 Team")).toBeVisible();
  for (const link of packageCtas) {
    expect(link).toHaveAttribute("href", "/demo");
  }
  expect(
    screen.getByRole("link", { name: "全景查看 AXIO 店群运营控制台" }),
  ).toHaveAttribute(
    "href",
    expect.stringContaining("/images/product-evidence/control-center.webp"),
  );
  expect(
    screen.getByRole("heading", {
      name: "核心功能：新建任务采集上架流程",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("heading", { name: demoVideos.overview.title }),
  ).toBeVisible();
});

it("explains all six operating stages beyond their short labels", () => {
  render(<HomePage />);

  const loop = screen.getByTestId("operating-loop");
  expect(within(loop).getAllByRole("listitem")).toHaveLength(6);
  for (const detail of [
    "汇总 Shopee 经营数据与多平台趋势，识别需求变化、竞争强度与供给机会。",
    "把买家搜索词映射为供应链找品词，沉淀可追溯、可复核的商品候选。",
    "将站点、店铺、数量和运营策略拆成任务参数，并按成本公式反算目标售价。",
    "集中校验图片、SKU、风险词和利润边界，高风险写入在执行前人工确认。",
    "借助妙手 ERP 与受控脚本批量上架、改价和优化，过程持续记录任务状态。",
    "回收执行结果、异常和经营数据，形成下一轮选品、定价与库存处理依据。",
  ]) {
    expect(within(loop).getByText(detail)).toBeVisible();
  }
});

it("shows all four real product interfaces without a hidden gallery", () => {
  render(<HomePage />);

  const evidence = screen.getByTestId("product-evidence");
  const expectedImages = [
    ["AXIO AI 主管与任务编排界面", "/images/product-evidence/supervisor.webp"],
    [
      "AXIO 新建上架任务与精准定价界面",
      "/images/product-evidence/task-pricing.webp",
    ],
    [
      "AXIO 违禁管控与风险词库界面",
      "/images/product-evidence/risk-control.webp",
    ],
    [
      "AXIO 站点定价公式与利润反算界面",
      "/images/product-evidence/pricing-formula.webp",
    ],
  ] as const;

  for (const [name, path] of expectedImages) {
    expectImageSource(within(evidence).getByRole("img", { name }), path);
    expect(
      within(evidence).getByRole("link", {
        name: "查看" + name + "高清原图",
      }),
    ).toHaveAttribute("href", expect.stringContaining(path));
  }

  expect(within(evidence).getByText("透明公式批量精准控价")).toBeVisible();
  expect(
    within(evidence).getByText(
      "逐项反算站点费率、汇率、运费与目标利润，应用于自动化系统批量精准控价",
    ),
  ).toBeVisible();
  expect(within(evidence).getByText("违禁管控")).toBeVisible();
  expect(
    within(evidence).getByText(
      "高危品牌、危险关键词、安全替换与款式风险集中治理",
    ),
  ).toBeVisible();
});

it("offers direct WeChat contact from the homepage", () => {
  render(<HomePage />);

  expect(screen.getByText("微信咨询 · 楠 Nay")).toBeVisible();
  expectImageSource(
    screen.getByRole("img", { name: "楠 Nay 的微信二维码" }),
    "/images/contact/wechat-nay.webp",
  );
});

it("keeps both video positions in the approved homepage narrative order", () => {
  render(<HomePage />);

  const loop = screen.getByTestId("operating-loop");
  const core = screen.getByTestId("core-workflow-video");
  const safety = screen.getByTestId("safety-deployment");
  const overview = screen.getByTestId("overview-video");
  const packages = screen.getByTestId("package-band");

  expect(
    within(overview).getByText("FULL PRODUCT DEMO / 51 SEC"),
  ).toBeVisible();

  expect(loop.nextElementSibling).toBe(core);
  expect(
    safety.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    overview.compareDocumentPosition(packages) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

it("links every homepage product-demo CTA to the watch-only demo route", () => {
  render(<HomePage />);

  const links = screen.getAllByRole("link", { name: watchDemoLabel });
  expect(links).toHaveLength(5);
  for (const link of links) {
    expect(link).toHaveAttribute("href", "/demo");
  }
  expect(screen.queryByRole("form")).toBeNull();
});
