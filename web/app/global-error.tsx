"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches errors thrown in the root layout itself, where
 * the normal error.tsx cannot render because the layout never mounted. It must
 * supply its own <html>/<body>, and it cannot rely on the app's stylesheet
 * having loaded — so the styling here is deliberately inline and minimal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#f6f7f9",
          color: "#3a414b",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.75rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#2b3038",
            }}
          >
            WaterQualityLens is temporarily unavailable
          </h1>
          <p style={{ marginTop: "1rem", lineHeight: 1.65, color: "#515d6c" }}>
            An unexpected fault stopped the page from loading. This is a problem
            with our application, not a finding about any water system.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "1rem",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
                color: "#667485",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              border: 0,
              borderRadius: "0.75rem",
              background: "#1f5c86",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
