"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark-blue" | "light" | "purple-blue" | "warm";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark-blue",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const THEME_KEY = "script-review-theme";

const THEMES: { value: Theme; label: string }[] = [
  { value: "dark-blue", label: "深蓝" },
  { value: "light", label: "亮色" },
  { value: "purple-blue", label: "紫蓝" },
  { value: "warm", label: "暖色" },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark-blue");
  const [mounted, setMounted] = useState(false);

  // 初始化：从 localStorage 读取主题
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved && THEMES.some((t) => t.value === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  // 防止 hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
