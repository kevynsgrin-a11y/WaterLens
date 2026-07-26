"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Adds a single restrained fade-and-rise the first time a
 * block enters the viewport, then stops observing — DESIGN.md asks for restraint,
 * so this fires once per element and never re-animates.
 *
 * Degrades safely: if IntersectionObserver is unavailable, or the visitor asks
 * for reduced motion, content renders in its final state immediately.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  /** Stagger offset in milliseconds. */
  delay?: number;
  as?: "div" | "section" | "li";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    // Already in view on mount (above the fold) — show without waiting.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-revealed={shown ? "true" : "false"}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`wql-reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
