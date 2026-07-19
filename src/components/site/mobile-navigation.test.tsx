import { fireEvent, render, screen } from "@testing-library/react";
import Link from "next/link";
import { afterEach, describe, expect, it } from "vitest";

import { MobileNavigation } from "./mobile-navigation";

describe("MobileNavigation", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("isolates the background and restores every prior state on Escape", () => {
    document.body.style.overflow = "clip";
    render(
      <>
        <header>
          <Link aria-hidden="false" className="site-header__brand" href="/">
            AXIO 智核
          </Link>
          <nav className="site-header__desktop-nav">
            <Link href="/product">产品</Link>
          </nav>
          <button className="theme-toggle" type="button">
            主题
          </button>
          <Link className="site-header__cta" href="/demo">
            演示
          </Link>
          <MobileNavigation />
        </header>
        <main aria-hidden="false">内容</main>
        <footer className="site-footer" inert>
          页脚
        </footer>
      </>,
    );

    const selectors = [
      "main",
      ".site-footer",
      ".site-header__brand",
      ".site-header__desktop-nav",
      ".theme-toggle",
      ".site-header__cta",
    ];
    const elements = selectors.map((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    const previousStates = elements.map((element) => ({
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.hasAttribute("inert"),
    }));

    fireEvent.click(screen.getByRole("button", { name: "打开导航菜单" }));

    expect(document.body.style.overflow).toBe("hidden");
    for (const element of elements) {
      expect(element).toHaveAttribute("inert");
      expect(element).toHaveAttribute("aria-hidden", "true");
    }
    const dialog = screen.getByRole("dialog", { name: "网站导航" });
    expect(dialog).not.toHaveAttribute("inert");
    expect(dialog).not.toHaveAttribute("aria-hidden", "true");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(document.body.style.overflow).toBe("clip");
    elements.forEach((element, index) => {
      expect(element.getAttribute("aria-hidden")).toBe(
        previousStates[index].ariaHidden,
      );
      expect(element.hasAttribute("inert")).toBe(previousStates[index].inert);
    });
  });

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
