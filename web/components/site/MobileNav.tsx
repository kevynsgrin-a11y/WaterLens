"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Mobile navigation. Below the `md` breakpoint the primary links were previously
 * `hidden` with no replacement, which left the entire site unreachable from the
 * header on a phone. This is the disclosure that replaces them.
 */
export function MobileNav({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on route change — otherwise the panel survives the navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 transition-colors hover:bg-ink-100 md:hidden dark:text-ink-200 dark:hover:bg-white/10"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full border-b border-t border-ink-100 bg-white shadow-card md:hidden dark:border-white/10 dark:bg-surface-raised"
        >
          <nav aria-label="Primary (mobile)" className="mx-auto w-full max-w-content px-6 py-2">
            <ul>
              {links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`block border-b border-ink-100 py-3.5 text-base font-medium last:border-0 dark:border-white/10 ${
                        active
                          ? "text-brand-700 dark:text-brand-200"
                          : "text-ink-700 dark:text-ink-200"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
