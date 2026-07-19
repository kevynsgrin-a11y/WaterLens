import type { ReactNode } from "react";
import { MatchTier, TIER_LABEL, TIER_CONFIDENCE } from "@/lib/constants";

// -----------------------------------------------------------------------------
// TierExplainer — an elegant, reusable visual for the three address→PWS
// confidence tiers. Tier 1 verdant, Tier 2 brand, Tier 3 amber (caution),
// mapping color to confidence, never to alarm (DESIGN.md).
// -----------------------------------------------------------------------------

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type TierTone = "verdant" | "brand" | "caution";

type TierRow = {
  tier: MatchTier;
  tone: TierTone;
  meaning: string;
  consequence: string;
  icon: ReactNode;
};

const toneStyles: Record<
  TierTone,
  { rail: string; chip: string; value: string; iconWrap: string; dot: string }
> = {
  verdant: {
    rail: "before:bg-verdant-400",
    chip: "bg-verdant-50 text-verdant-700 border-verdant-200",
    value: "text-verdant-700",
    iconWrap: "bg-verdant-50 text-verdant-600",
    dot: "bg-verdant-500",
  },
  brand: {
    rail: "before:bg-brand-400",
    chip: "bg-brand-50 text-brand-700 border-brand-200",
    value: "text-brand-700",
    iconWrap: "bg-brand-50 text-brand-600",
    dot: "bg-brand-500",
  },
  caution: {
    rail: "before:bg-caution-400",
    chip: "bg-caution-50 text-caution-800 border-caution-200",
    value: "text-caution-700",
    iconWrap: "bg-caution-50 text-caution-700",
    dot: "bg-caution-500",
  },
};

function BoundaryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6.5 9.5 4l5 2.5L20 4v13.5L14.5 20l-5-2.5L4 20V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.5 4v13.5M14.5 6.5V20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ProxyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RadiusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="3 3"
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path d="M12 12 17.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const ROWS: TierRow[] = [
  {
    tier: MatchTier.EXPLICIT,
    tone: "verdant",
    meaning:
      "Your address falls inside a published EPA service-area boundary — a point-in-polygon hit against a real utility footprint.",
    consequence:
      "The report is presented at full confidence, with no mapping caveat.",
    icon: <BoundaryIcon />,
  },
  {
    tier: MatchTier.MATCHED,
    tone: "brand",
    meaning:
      "No explicit polygon exists, so the address is matched to the most probable system using TEMM proxy layers and corroborating identifiers.",
    consequence:
      "The report is shown with a note to confirm the system name on your water bill.",
    icon: <ProxyIcon />,
  },
  {
    tier: MatchTier.MODELED,
    tone: "caution",
    meaning:
      "The serving utility is inferred from a modeled search radius when no boundary or proxy resolves — the least certain result.",
    consequence:
      "An amber banner recommends a physical lab test and verifying the utility on your bill before acting.",
    icon: <RadiusIcon />,
  },
];

function formatConfidence(tier: MatchTier): string {
  return TIER_CONFIDENCE[tier].toFixed(2);
}

export function TierExplainer({ className }: { className?: string }) {
  return (
    <ol
      className={cx("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-label="Address-to-utility confidence tiers"
    >
      {ROWS.map((row, i) => {
        const s = toneStyles[row.tone];
        return (
          <li
            key={row.tier}
            className={cx(
              "relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white p-6 shadow-card",
              "before:absolute before:inset-y-0 before:left-0 before:w-1",
              s.rail
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cx(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  s.iconWrap
                )}
                aria-hidden="true"
              >
                {row.icon}
              </span>
              <span className="font-mono text-sm font-semibold text-ink-300">
                Tier {i + 1}
              </span>
            </div>

            <h3 className="mt-5 text-lg font-semibold text-ink-900">
              {TIER_LABEL[row.tier]}
            </h3>

            <div className="mt-3 flex items-baseline gap-2">
              <span
                className={cx("font-mono text-3xl font-semibold", s.value)}
              >
                {formatConfidence(row.tier)}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                confidence
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              {row.meaning}
            </p>

            <div className="mt-5 flex items-start gap-2.5 border-t border-ink-100 pt-4">
              <span
                className={cx(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  s.dot
                )}
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-ink-500">
                <span className="font-medium text-ink-700">In the report: </span>
                {row.consequence}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
