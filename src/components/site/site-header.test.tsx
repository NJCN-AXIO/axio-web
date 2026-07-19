import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "../theme/theme-provider";
import { SiteHeader } from "./site-header";

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
    expect(screen.getByRole("link", { name: "解决方案" })).toHaveAttribute(
      "href",
      "/solutions",
    );
    expect(screen.getByRole("link", { name: "能力矩阵" })).toHaveAttribute(
      "href",
      "/#capabilities",
    );
    expect(screen.getByRole("link", { name: "版本方案" })).toHaveAttribute(
      "href",
      "/pricing",
    );
    expect(screen.getByRole("link", { name: "预约演示" })).toHaveAttribute(
      "href",
      "/demo",
    );
    expect(screen.getByRole("link", { name: "登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "预约产品演示" })).toHaveAttribute(
      "href",
      "/demo",
    );
  });
});
