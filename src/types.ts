// -----------------------------------------------------------------------------
// Shared types & the Cloudflare Worker environment binding contract.
// -----------------------------------------------------------------------------

export interface Env {
  // Bindings (wrangler.toml)
  DB: D1Database;
  CACHE: KVNamespace;
  ALERT_QUEUE: Queue<AlertJob>;

  // Vars
  ENVIROFACTS_BASE: string;
  CENSUS_GEOCODER_BASE: string;
  MODEL_RADIUS_KM: string;
  GEOCODE_TTL: string;
  LOOKUP_TTL: string;
  SDWIS_TTL: string;
  ENVIRONMENT: string;

  // Secrets (wrangler secret put)
  JWT_SECRET?: string;
  TAPSCORE_API_KEY?: string;
  RESEND_API_KEY?: string;
}

// -----------------------------------------------------------------------------
// Geospatial primitives
// -----------------------------------------------------------------------------

/** A geocoded coordinate C(lat, lon) — §12. */
export interface Coordinate {
  lat: number;
  lon: number;
}

/**
 * TEMM confidence tiers (§12 / §22). The numeric confidence is emitted verbatim
 * to the UI so legal expectations about mapping accuracy can be managed (§4).
 */
export enum MatchTier {
  /** Tier 1: coordinate intersects an explicit, verified utility service polygon. */
  EXPLICIT = "TIER_1_EXPLICIT",
  /** Tier 2: coordinate intersects a TIGER place polygon matched to a utility proxy. */
  MATCHED = "TIER_2_MATCHED",
  /** Tier 3: nearest modeled centroid radius (Haversine d < R_model). */
  MODELED = "TIER_3_MODELED",
  /** No match within any tier. */
  NONE = "NONE",
}

export interface SpatialMatch {
  pwsid: string | null;
  tier: MatchTier;
  /** 1.0 | 0.85 | 0.50 | 0 — see §12. */
  confidence: number;
  /** Human-readable tier label for the UI banner logic. */
  tierLabel: string;
  /** Only present for Tier 3 — distance to modeled centroid (km). */
  distanceKm?: number;
  /** True when the UI must show the ambiguity/lab-testing warning banner (§13). */
  requiresLabTestWarning: boolean;
}

/** A ring is an ordered list of [lon, lat] vertices (GeoJSON order). */
export type Ring = [number, number][];

/** Simplified polygon geometry stored in D1 (GeoJSON-style, flattened). */
export interface Polygon {
  /** Outer ring first, followed by any holes. */
  rings: Ring[];
}

// -----------------------------------------------------------------------------
// Municipal / SDWIS domain
// -----------------------------------------------------------------------------

export interface WaterSystem {
  pwsid: string;
  name: string;
  state: string | null;
  county: string | null;
  population_served: number | null;
  pws_type: string | null;
  primary_source: string | null;
}

export interface ContaminantDefinition {
  code: string;
  name: string;
  category: string;
  /** Legal Maximum Contaminant Level (regulatory limit). */
  mcl: number | null;
  /** Maximum Contaminant Level Goal / Public Health Goal (health target). */
  health_goal: number | null;
  unit: string;
  /** Certification standards that legitimately reduce this contaminant. */
  aliases?: string[];
}

/** A contaminant detection sourced from SDWIS for a given PWS. */
export interface Detection {
  code: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  mcl: number | null;
  health_goal: number | null;
  /** value / mcl — > 1.0 means the legal limit is exceeded. */
  mcl_ratio: number | null;
  exceeds_mcl: boolean;
  exceeds_health_goal: boolean;
  sample_date: string | null;
  sampling_agency: string | null;
  source: string;
}

export interface Violation {
  pwsid: string;
  violation_id: string;
  contaminant_code: string | null;
  violation_code: string | null;
  violation_category: string | null;
  is_health_based: boolean;
  begin_date: string | null;
  status: string | null;
}

// -----------------------------------------------------------------------------
// Hardware / certification domain (§10, §12, §14)
// -----------------------------------------------------------------------------

/** NSF/ANSI standards. Only health standards may back a health remediation claim. */
export type NsfStandard = "42" | "53" | "58" | "401" | "372" | "P473";

export type FormFactor =
  | "PITCHER"
  | "FAUCET"
  | "COUNTERTOP_RO"
  | "UNDERSINK_RO"
  | "WHOLE_HOUSE"
  | "REFRIGERATOR";

export interface Filter {
  id: number;
  brand: string;
  model: string;
  sku: string;
  form_factor: FormFactor;
  price_usd: number | null;
  capacity_gallons: number | null;
  affiliate_url: string | null;
  active: number; // 0/1
}

/** A single verified reduction claim: SKU × standard × contaminant. */
export interface FilterClaim {
  filter_id: number;
  standard: NsfStandard;
  contaminant_code: string;
  certifier: string; // NSF | WQA | IAPMO
  verified: number; // 0/1
}

export interface RecommendedFilter {
  id: number;
  brand: string;
  model: string;
  sku: string;
  form_factor: FormFactor;
  price_usd: number | null;
  capacity_gallons: number | null;
  affiliate_url: string | null;
  /** Standards under which this SKU is verified to reduce the detected hazards. */
  certified_standards: NsfStandard[];
  /** The exact detected contaminants this SKU is verified to neutralize. */
  neutralizes: string[];
  /** True when this SKU covers the entire detected hazard set (full set-cover). */
  full_coverage: boolean;
  /** Rank score used for ordering (form-factor fit + coverage + price). */
  score: number;
}

// -----------------------------------------------------------------------------
// API output contract (§22 Output Contract)
// -----------------------------------------------------------------------------

export type DwellingType = "SINGLE_FAMILY" | "MULTI_FAMILY_RENTAL" | "UNKNOWN";

export interface LookupResult {
  query: {
    address: string;
    normalized_address: string | null;
    dwelling_type: DwellingType;
  };
  coordinate: Coordinate | null;
  match: SpatialMatch;
  utility: WaterSystem | null;
  /** Contaminants exceeding public health goals (§22). */
  detected_contaminants: Detection[];
  active_violations: Violation[];
  /** SKU-verified hardware solutions (§22). */
  recommended_filters: RecommendedFilter[];
  /** Present only when nitrate/nitrite is detected — RO-only guidance. */
  nitrate_warning: string | null;
  /** True when the address/ZIP resolved to more than one candidate water system. */
  multi_system_warning: boolean;
  /** Total candidate systems found (may exceed the one reported). */
  multi_system_count: number;
  data_freshness: {
    sdwis_fetched_at: string | null;
    generated_at: string;
  };
  disclaimers: string[];
  meta: {
    cache_hit: boolean;
    engine_version: string;
    /** How the PWSID was resolved: geospatial TEMM or ZIP registry fallback. */
    resolution: "TEMM" | "ZIP_REGISTRY" | "NONE";
  };
}

// -----------------------------------------------------------------------------
// Alerts / users / vault (V1 & Premium — §11)
// -----------------------------------------------------------------------------

export interface AlertJob {
  type: "VIOLATION" | "BOIL_WATER" | "UCMR5_BREACH";
  user_id: number;
  email: string;
  pwsid: string;
  subject: string;
  body: string;
}
