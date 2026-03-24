"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolved: "light",
  setTheme: () => {},
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Initialize from localStorage
  /* eslint-disable react-hooks/set-state-in-effect -- hydration from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const t = stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
    setThemeState(t);
    setResolved(resolve(t));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Apply dark class and listen for system changes
  /* eslint-disable react-hooks/set-state-in-effect -- syncing resolved from theme + system media query */
  useEffect(() => {
    const r = resolve(theme);
    setResolved(r);
    document.documentElement.classList.toggle("dark", r === "dark");

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? "dark" : "light";
        setResolved(newResolved);
        document.documentElement.classList.toggle("dark", newResolved === "dark");
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
