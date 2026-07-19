import { Container } from "@/components/ui";
import type { ReactNode } from "react";

function DatabaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-6.5-5.7-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.3 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BadgeCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 14 5l2.4-.3.6 2.3 2 1.4-1 2.2 1 2.2-2 1.4-.6 2.3L14 19l-2 1.5L10 19l-2.4.3L7 17l-2-1.4 1-2.2-1-2.2 2-1.4.6-2.3L10 5l2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="m9.5 12 1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v16M7 20h10M4 8h16M4 8l-2 5a3 3 0 0 0 6 0L6 8m14 0-2 5a3 3 0 0 0 6 0l-2-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="4.5" r="1.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const SIGNALS: { icon: ReactNode; label: string }[] = [
  { icon: <DatabaseIcon />, label: "EPA SDWIS data" },
  { icon: <MapPinIcon />, label: "TEMM address-level boundaries" },
  { icon: <BadgeCheckIcon />, label: "Independent NSF/ANSI verification" },
  { icon: <ScaleIcon />, label: "No fear-based ratings" },
];

export function TrustStrip() {
  return (
    <section aria-label="Data sources and standards" className="border-y border-ink-100 bg-white">
      <Container className="py-6">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {SIGNALS.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span className="shrink-0 text-brand-500" aria-hidden="true">
                {s.icon}
              </span>
              <span className="text-sm font-medium text-ink-700">{s.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
