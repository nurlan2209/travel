"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("mnu-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({
  className = "",
  darkText = false
}: {
  className?: string;
  darkText?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function onToggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("mnu-theme", next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={`liquid-glass-btn relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
        darkText ? "text-[#0A1022]" : "text-white"
      } ${className}`}
    >
      <span className="liquid-glass-btn__backdrop" />
      <span className="liquid-glass-btn__edge liquid-glass-btn__edge--top" />
      <span className="liquid-glass-btn__edge liquid-glass-btn__edge--bottom" />
      <span className="liquid-glass-btn__edge liquid-glass-btn__edge--left" />
      <span className="liquid-glass-btn__edge liquid-glass-btn__edge--right" />
      <span className="relative z-[2]">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}
