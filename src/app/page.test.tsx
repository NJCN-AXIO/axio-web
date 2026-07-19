import { render, screen } from "@testing-library/react";
import HomePage from "./page";

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
  const productEvidence = screen.getByRole("img", {
    name: "AXIO 新建上架任务与精准定价工作台",
  });
  expect(
    decodeURIComponent(productEvidence.getAttribute("src") ?? ""),
  ).toContain("/images/product-evidence/task-pricing.webp");
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
