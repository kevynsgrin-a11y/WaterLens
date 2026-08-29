import type { FormFactor } from "@/lib/types";

/**
 * Thin-line marks for each hardware form factor. Product photography would mean
 * remote assets and vendor imagery in the objective-data zone; a consistent
 * line glyph keeps the commercial block on-brand and self-contained.
 */
const PATHS: Record<FormFactor, string> = {
  // Pitcher with a pour spout and handle
  PITCHER: "M6 8h10l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H8.5A1.5 1.5 0 0 1 7 19.5L6 8Zm10-1.5 2.6-1.6M16 11h2.2a2 2 0 0 1 0 4H15.6",
  // Faucet mount
  FAUCET: "M5 6h5v3H5zM10 7.5h5.5A2.5 2.5 0 0 1 18 10v1.5M18 13.5v3M15.5 16.5h5l-1 4h-3l-1-4Z",
  // Countertop unit with tank
  COUNTERTOP_RO: "M5.5 6.5h13v11a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-11Zm0 4.5h13M9 3.5h6v3H9z",
  // Under-sink canisters
  UNDERSINK_RO: "M4 4h4v7H4zM10 4h4v7h-4zM16 4h4v7h-4zM4 14h16M8 14v6M16 14v6",
  // Whole-house housing on a main
  WHOLE_HOUSE: "M3 12h4m10 0h4M8.5 5.5h7v13h-7zM12 5.5V3M9.5 9h5",
  // Refrigerator cartridge
  REFRIGERATOR: "M8 4h8v16H8zM8 10h8M11 6.5h2M11 13.5h2",
};

export function FormFactorGlyph({ form }: { form: FormFactor }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-300/10 dark:text-brand-200"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d={PATHS[form]}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
