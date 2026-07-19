import { Env } from "../types";

// -----------------------------------------------------------------------------
// KV cache wrappers (§15). Geocode resolutions and full lookup payloads are
// cached aggressively so repeated lookups for the same neighborhood do not incur
// redundant spatial calculations or external Envirofacts calls.
// -----------------------------------------------------------------------------

const NS = {
  GEOCODE: "geo:",
  LOOKUP: "lookup:",
  SDWIS: "sdwis:",
} as const;

/** Normalize a free-text address into a stable, lowercase cache key fragment. */
export function normalizeAddressKey(address: string): string {
  return address
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ,#-]/g, "");
}

export async function getJson<T>(env: Env, key: string): Promise<T | null> {
  return env.CACHE.get<T>(key, "json");
}

export async function putJson(
  env: Env,
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  await env.CACHE.put(key, JSON.stringify(value), {
    expirationTtl: Math.max(60, ttlSeconds),
  });
}

export const cacheKeys = {
  geocode: (address: string) => NS.GEOCODE + normalizeAddressKey(address),
  lookup: (address: string, dwelling: string) =>
    NS.LOOKUP + normalizeAddressKey(address) + "|" + dwelling,
  sdwis: (pwsid: string) => NS.SDWIS + pwsid.toUpperCase(),
};

export function ttl(env: Env, which: "geocode" | "lookup" | "sdwis"): number {
  const raw =
    which === "geocode"
      ? env.GEOCODE_TTL
      : which === "lookup"
      ? env.LOOKUP_TTL
      : env.SDWIS_TTL;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 86_400;
}
