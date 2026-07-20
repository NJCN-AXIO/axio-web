import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "../theme/theme-provider";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/solutions",
}));

describe("SiteHeader", () => {
  it("exposes public navigation and conversion", () => {
    render(
      <ThemeProvider>
        <SiteHeader />
      </ThemeProvider>,
    );

    const wordmark = screen.getByRole("link", { name: "AXIO 智核" });
    expect(wordmark).toHaveAttribute("href", "/");
    expect(wordmark).toHaveTextContent(/^AXIO 智核$/);
    expect(screen.getByRole("link", { name: "产品能力" })).toHaveAttribute(
      "href",
      "/product",
    );
    const solutions = screen.getByRole("link", { name: "解决方案" });
    expect(solutions).toHaveAttribute("href", "/solutions");
    expect(solutions).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "产品能力" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "能力矩阵" })).toHaveAttribute(
      "href",
      "/#capabilities",
    );
    expect(screen.getByRole("link", { name: "版本方案" })).toHaveAttribute(
      "href",
      "/pricing",
    );
    expect(screen.queryByRole("link", { name: "预约演示" })).toBeNull();
    expect(screen.queryByRole("link", { name: "登录" })).toBeNull();
    expect(screen.getByRole("link", { name: "在线体验" })).toHaveAttribute(
      "href",
      "/preview",
    );
  });
});
