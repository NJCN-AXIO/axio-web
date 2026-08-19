import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getSiteContent } from "../../content";
import { FaqList } from "./faq-list";

const groups = getSiteContent().faqGroups;

describe("FaqList", () => {
  it("renders 15 priority questions before the remaining categorized FAQ", () => {
    const { container } = render(<FaqList groups={groups} />);

    const priority = screen.getByTestId("faq-priority");
    expect(within(priority).getAllByRole("group")).toHaveLength(15);
    expect(priority.querySelectorAll("details[open]")).toHaveLength(5);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      groups.length,
    );
    expect(container.querySelectorAll("details")).toHaveLength(
      groups.flatMap((group) => group.items).length,
    );
    expect(container.querySelectorAll("summary")).toHaveLength(
      groups.flatMap((group) => group.items).length,
    );
  });

  it("publishes the required privacy, fee, and fail-closed boundaries", () => {
    render(<FaqList groups={groups} />);

    expect(document.body).toHaveTextContent(
      "不保证盈利、流量、订单量或平台权重",
    );
    expect(document.body).toHaveTextContent(
      "不会向 AXIO 官网或 Founder 电脑上传客户业务数据",
    );
    expect(document.body).toHaveTextContent("平台写入结果未知时不会自动重试");
    expect(document.body).toHaveTextContent(
      "妙手 ERP、Shopee、模型/API、代理、电脑和网盘费用不包含在 AXIO 套餐内",
    );
    expect(document.body).toHaveTextContent("最多 300 字符且已经脱敏");
    expect(document.body).toHaveTextContent("理论利润不等于妙手已结算净利润");
  });

  it("keeps every native summary keyboard available", () => {
    const { container } = render(<FaqList groups={groups} />);

    for (const summary of container.querySelectorAll("summary")) {
      expect(summary).not.toHaveAttribute("aria-hidden", "true");
      expect(summary.closest("details")).not.toHaveAttribute("inert");
    }
  });
});
