# WaterQualityLens — Design System (read before building any page)

The brand is **clinical objectivity** (Build Plan §13). We are the calm, credible
auditor — the opposite of alarmist advocacy sites. Every screen must feel like a
precision instrument, not a scare campaign.

## Non-negotiables (§13, §14)

- **Palette:** muted blues (`brand`), calm teal/green (`verdant`), slate grays
  (`ink`). Amber (`caution`) ONLY for the Tier-3 mapping-ambiguity banner.
  **Never** use alarmist red/black or skull/toxic iconography.
- **Every data point shows provenance.** A contaminant value must surface its
  sample date, testing agency, unit, and the legal MCL (use `<Tooltip>` / a
  definition row). No naked numbers.
- **Affiliate hardware is visually delineated** from objective data — distinct
  bounding box + "Verified Partner" badge (FTC disclosure). Commercial ranking
  never precedes scientific data.
- **Persistent disclaimers**: the medical-claims disclaimer is always reachable;
  Tier-3 matches show the lab-test recommendation banner.
- **No medical claims** anywhere in copy. We report engineering + certification
  data; we do not diagnose exposure or predict health outcomes.

## Visual language

- **Type scale:** hero `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight`;
  section headings `text-2xl sm:text-3xl font-semibold`; body `text-base
  text-ink-600 leading-relaxed`; data/labels use `font-mono` for numeric values.
- **Rhythm:** generous whitespace. Section vertical padding `py-16 sm:py-24`.
  Page content constrained to `max-w-content mx-auto px-6`.
- **Surfaces:** white cards on `ink-50` canvas, `rounded-2xl`, `shadow-card`,
  `border border-ink-100`. Hover lifts use `shadow-lift`.
- **Motion:** restrained. `animate-fade-up` for first paint of hero/section
  content. No bounce, no parallax gimmicks.
- **Iconography:** thin line icons only. Prefer inline SVG (no icon-font/CDN).
- **Accessibility:** WCAG AA contrast, semantic landmarks (`header/main/footer`,
  `nav`, `section` with headings), visible focus rings (`focus-visible:ring-2
  ring-brand-400`), all interactive elements keyboard-reachable, `alt`/aria labels.

## Shared building blocks (import from `@/components/ui`)

`Container, Section, Card, Badge, Stat, Tooltip, Pill, Button, Eyebrow` — use
these; do not re-implement. `Button` supports `variant="primary|secondary|ghost"`.
`Badge` supports `tone="brand|verdant|ink|caution"`.

## Confidence tiers (map to color, never alarm)

| Tier | Label | Tone |
|---|---|---|
| 1 Explicit | "Explicit Boundary" | `verdant` (high confidence) |
| 2 Matched | "Matched Proxy" | `brand` |
| 3 Modeled | "Modeled Radius" | `caution` + lab-test banner |

## Voice

Plain, exact, unhurried. "Your utility reported lead at 27 µg/L on May 15, 2026 —
above the 15 µg/L federal action level." Never "TOXIC!" Never emoji in product UI.
