"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const scriptedTheme =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    // ThemeScript owns the pre-hydration DOM value; mirror that external state once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(scriptedTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const setTheme = (nextTheme: Theme) => {
      applyTheme(nextTheme);
      try {
        localStorage.setItem("axio-theme", nextTheme);
      } catch {
        // The in-page theme remains usable when browser storage is blocked.
      }
      setThemeState(nextTheme);
    };

    return {
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
