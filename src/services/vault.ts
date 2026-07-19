import { Env } from "../types";

// -----------------------------------------------------------------------------
// Premium "Household Water Vault" (§11 Premium tier — $9.99/year).
//
// Stores baseline mail-in lab results (Tap Score / SimpleLab), tracks filter
// cartridge replacement schedules based on per-SKU gallon lifespans, and provides
// the data used to generate printable PDF environmental safety reports.
//
// PDF *rendering* is a frontend/worker concern; this service produces the fully
// resolved report payload the renderer consumes.
// -----------------------------------------------------------------------------

export interface LabResult {
  id?: number;
  user_id: number;
  saved_address_id: number | null;
  provider: string; // 'TAP_SCORE' | 'SIMPLELAB' | 'MANUAL'
  external_id: string | null;
  analyte: string;
  value: number;
  unit: string;
  sampled_at: string | null;
}

export interface CartridgeSchedule {
  id?: number;
  user_id: number;
  filter_id: number;
  installed_at: string;
  capacity_gallons: number | null;
  estimated_daily_gallons: number;
}

export async function requirePremium(
  env: Env,
  userId: number
): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT subscription_tier FROM users WHERE id = ?1`
  )
    .bind(userId)
    .first<{ subscription_tier: string }>();
  return row?.subscription_tier === "premium";
}

export async function addLabResult(env: Env, r: LabResult): Promise<number> {
  const res = await env.DB.prepare(
    `INSERT INTO lab_results
        (user_id, saved_address_id, provider, external_id, analyte, value, unit, sampled_at, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
  )
    .bind(
      r.user_id,
      r.saved_address_id,
      r.provider,
      r.external_id,
      r.analyte,
      r.value,
      r.unit,
      r.sampled_at,
      new Date().toISOString()
    )
    .run();
  return res.meta.last_row_id as number;
}

/**
 * Pull baseline lab results from the Tap Score / SimpleLab API for a user who has
 * linked their account (§11 "seamless Tap Score API integration").
 */
export async function importTapScoreResults(
  env: Env,
  userId: number,
  tapScoreOrderId: string
): Promise<number> {
  if (!env.TAPSCORE_API_KEY) {
    throw new Error("TAPSCORE_API_KEY not configured");
  }
  const res = await fetch(
    `https://api.mytapscore.com/v1/orders/${encodeURIComponent(tapScoreOrderId)}/results`,
    { headers: { authorization: `Bearer ${env.TAPSCORE_API_KEY}` } }
  );
  if (!res.ok) throw new Error(`Tap Score import failed: ${res.status}`);

  const payload = (await res.json()) as {
    results?: Array<{ analyte: string; value: number; unit: string; sampled_at?: string }>;
  };

  let count = 0;
  for (const r of payload.results ?? []) {
    await addLabResult(env, {
      user_id: userId,
      saved_address_id: null,
      provider: "TAP_SCORE",
      external_id: tapScoreOrderId,
      analyte: r.analyte,
      value: r.value,
      unit: r.unit,
      sampled_at: r.sampled_at ?? null,
    });
    count++;
  }
  return count;
}

export async function trackCartridge(
  env: Env,
  s: CartridgeSchedule
): Promise<{ id: number; replace_by: string | null }> {
  const res = await env.DB.prepare(
    `INSERT INTO cartridge_schedules
        (user_id, filter_id, installed_at, capacity_gallons, estimated_daily_gallons, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  )
    .bind(
      s.user_id,
      s.filter_id,
      s.installed_at,
      s.capacity_gallons,
      s.estimated_daily_gallons,
      new Date().toISOString()
    )
    .run();

  return {
    id: res.meta.last_row_id as number,
    replace_by: estimateReplacement(s),
  };
}

/** Estimate the cartridge replacement date from capacity ÷ daily usage. */
export function estimateReplacement(s: CartridgeSchedule): string | null {
  if (!s.capacity_gallons || s.estimated_daily_gallons <= 0) return null;
  const days = Math.floor(s.capacity_gallons / s.estimated_daily_gallons);
  const installed = new Date(s.installed_at);
  if (Number.isNaN(installed.getTime())) return null;
  const replaceBy = new Date(installed.getTime() + days * 86_400_000);
  return replaceBy.toISOString().slice(0, 10);
}

export interface VaultReport {
  generated_at: string;
  saved_addresses: unknown[];
  lab_results: LabResult[];
  cartridge_schedules: Array<CartridgeSchedule & { replace_by: string | null }>;
}

/** Assemble the printable-report payload for a premium user. */
export async function buildVaultReport(
  env: Env,
  userId: number
): Promise<VaultReport> {
  const [addresses, labs, cartridges] = await Promise.all([
    env.DB.prepare(
      `SELECT id, pwsid, label, address, dwelling_type FROM saved_addresses WHERE user_id = ?1`
    )
      .bind(userId)
      .all(),
    env.DB.prepare(
      `SELECT id, user_id, saved_address_id, provider, external_id, analyte, value, unit, sampled_at
         FROM lab_results WHERE user_id = ?1 ORDER BY sampled_at DESC`
    )
      .bind(userId)
      .all<LabResult>(),
    env.DB.prepare(
      `SELECT id, user_id, filter_id, installed_at, capacity_gallons, estimated_daily_gallons
         FROM cartridge_schedules WHERE user_id = ?1`
    )
      .bind(userId)
      .all<CartridgeSchedule>(),
  ]);

  return {
    generated_at: new Date().toISOString(),
    saved_addresses: addresses.results ?? [],
    lab_results: labs.results ?? [],
    cartridge_schedules: (cartridges.results ?? []).map((c) => ({
      ...c,
      replace_by: estimateReplacement(c),
    })),
  };
}
