"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "light" ? "切换到深色模式" : "切换到浅色模式";

  return (
    <button
      aria-label={label}
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      {theme === "light" ? (
        <Moon aria-hidden="true" size={20} />
      ) : (
        <Sun aria-hidden="true" size={20} />
      )}
    </button>
  );
}
