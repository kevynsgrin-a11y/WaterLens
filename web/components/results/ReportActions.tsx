"use client";

import { useEffect, useState } from "react";

/**
 * Share / print affordances for the report. This document is the thing a tenant
 * forwards to a landlord or brings to a council meeting, so it needs to leave
 * the browser. The URL already encodes the full query, so a copied link
 * reproduces the report exactly.
 */

function Icon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 transition-[background-color,border-color,color,transform] duration-150 hover:border-ink-300 hover:bg-ink-50 active:scale-[0.97] motion-reduce:active:scale-100 dark:border-white/15 dark:bg-white/5 dark:text-ink-200 dark:hover:bg-white/10";

export function ReportActions() {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard can be blocked by permissions policy; fail quietly rather
      // than throwing an error at someone who just wanted a link.
    }
  }

  async function share() {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch {
      // User dismissed the share sheet — not an error.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-print-hide>
      <button type="button" onClick={copy} className={BTN}>
        <Icon d="M9 9V5.5A1.5 1.5 0 0 1 10.5 4h8A1.5 1.5 0 0 1 20 5.5v8a1.5 1.5 0 0 1-1.5 1.5H15M5.5 9h8A1.5 1.5 0 0 1 15 10.5v8a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 18.5v-8A1.5 1.5 0 0 1 5.5 9Z" />
        {copied ? "Link copied" : "Copy link"}
      </button>

      <button type="button" onClick={() => window.print()} className={BTN}>
        <Icon d="M7 9V4h10v5M7 19h10v-5H7v5ZM7 14H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
        Print / PDF
      </button>

      {canShare ? (
        <button type="button" onClick={share} className={BTN}>
          <Icon d="M12 16V4m0 0L8 8m4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
          Share
        </button>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {copied ? "Report link copied to clipboard" : ""}
      </span>
    </div>
  );
}
