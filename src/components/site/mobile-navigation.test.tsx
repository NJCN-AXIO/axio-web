import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileNavigation } from "./mobile-navigation";

describe("MobileNavigation", () => {
  it("closes on Escape and restores focus to its trigger", () => {
    render(<MobileNavigation />);
    const trigger = screen.getByRole("button", { name: "打开导航菜单" });

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "网站导航" })).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", { name: "网站导航" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("traps keyboard focus and closes after route activation", () => {
    render(<MobileNavigation />);
    const trigger = screen.getByRole("button", { name: "打开导航菜单" });
    fireEvent.click(trigger);

    const closeButton = screen.getByRole("button", { name: "关闭导航菜单" });
    const demoLink = screen.getByRole("link", { name: "预约产品演示" });

    demoLink.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(demoLink).toHaveFocus();

    const productLink = screen.getByRole("link", { name: "产品能力" });
    productLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(productLink);
    expect(
      screen.queryByRole("dialog", { name: "网站导航" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
