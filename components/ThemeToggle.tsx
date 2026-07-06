"use client";

import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type Theme = "dark-blue" | "light" | "purple-blue" | "warm";

const THEME_OPTIONS: { value: Theme; label: string; color: string }[] = [
  { value: "dark-blue", label: "深蓝", color: "#0f172a" },
  { value: "light", label: "亮色", color: "#f8fafc" },
  { value: "purple-blue", label: "紫蓝", color: "#1a1035" },
  { value: "warm", label: "暖色", color: "#fef7ed" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const current = THEME_OPTIONS.find((t) => t.value === theme);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="切换主题"
      >
        <Palette className="h-3.5 w-3.5" />
        {current?.label ?? "主题"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border bg-card p-2 shadow-xl z-50">
          <div className="mb-1.5 px-2 text-xs font-medium text-muted-foreground">页面风格</div>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                theme === opt.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border shrink-0"
                style={{
                  backgroundColor: opt.color,
                  borderColor:
                    opt.value === "light" || opt.value === "warm"
                      ? "rgba(0,0,0,0.15)"
                      : "rgba(255,255,255,0.15)",
                }}
              />
              {opt.label}
              {theme === opt.value && (
                <span className="ml-auto text-xs text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
