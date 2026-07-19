import { render, screen, within } from "@testing-library/react";
import HomePage from "./page";

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
  expect(screen.getByText("跨境电商店群全自动化运营系统")).toBeVisible();
  expect(screen.getByRole("link", { name: "预约产品演示" })).toHaveAttribute(
    "href",
    "/demo",
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
  expect(screen.getByText("116 家店铺")).toBeVisible();
  expect(screen.getByText("6 个 Shopee 站点")).toBeVisible();
  expect(screen.getByText("4 个市场信号平台")).toBeVisible();
  expect(
    screen.getByRole("heading", {
      name: "核心功能：新建任务采集上架流程",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("heading", { name: "AXIO 全局功能演示" }),
  ).toBeVisible();
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
      "AXIO 图片工作台与身份校验界面",
      "/images/product-evidence/image-workspace.webp",
    ],
    ["AXIO 六站点矩阵定价界面", "/images/product-evidence/matrix-pricing.webp"],
  ] as const;

  for (const [name, path] of expectedImages) {
    expectImageSource(within(evidence).getByRole("img", { name }), path);
  }
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

  expect(loop.nextElementSibling).toBe(core);
  expect(
    safety.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    overview.compareDocumentPosition(packages) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
