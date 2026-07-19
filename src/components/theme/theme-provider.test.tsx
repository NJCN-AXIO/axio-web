import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeProvider", () => {
  it("renders on the server without accessing document", () => {
    const browserDocument = globalThis.document;
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: undefined,
    });

    try {
      expect(() =>
        renderToString(
          <ThemeProvider>
            <ThemeToggle />
          </ThemeProvider>,
        ),
      ).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: browserDocument,
      });
    }
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  });

  it("starts in deterministic light mode without a stored preference", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(
      screen.getByRole("button", { name: "切换到深色模式" }),
    ).toBeVisible();
  });

  it("adopts a dark theme already applied by ThemeScript after hydration", () => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("button", { name: "切换到浅色模式" }),
    ).toBeVisible();
  });

  it("persists a complete dark-mode selection", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "切换到深色模式" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem("axio-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "切换到浅色模式" }),
    ).toBeVisible();
  });

  it("still toggles when browser storage is unavailable", () => {
    const storage = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Storage blocked", "SecurityError");
      });

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "切换到深色模式" })),
    ).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe("dark");

    storage.mockRestore();
  });
});
