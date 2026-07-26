"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "wql-theme";

/**
 * Light/dark switch. The chosen theme is stamped on <html data-theme> and read
 * back before first paint by the bootstrap script in app/layout.tsx, so there
 * is no flash. With nothing stored, the OS preference governs (globals.css).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // The bootstrap script in app/layout.tsx has already resolved and stamped
    // the effective theme; read it back rather than re-deriving it.
    const stamped = document.documentElement.getAttribute("data-theme");
    setTheme(stamped === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private modes — the toggle still works
      // for this page view, it just will not persist.
    }
  }

  // Render a stable placeholder until the effect resolves, so the button does
  // not claim the wrong state during hydration.
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/10"
    >
      {theme === null ? (
        <span className="h-[18px] w-[18px]" />
      ) : isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
