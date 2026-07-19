import { DwellingType, Env } from "../types";
import { error, json } from "../lib/http";
import { runLookup } from "../services/lookup";

// -----------------------------------------------------------------------------
// POST /api/lookup      { address, dwelling_type? }
// GET  /api/lookup?address=...&dwelling_type=...
//
// The primary MVP endpoint (§11): frictionless, anonymous address lookup that
// returns the §22 unified output contract.
// -----------------------------------------------------------------------------

function normalizeDwelling(raw: unknown): DwellingType {
  const v = String(raw ?? "").toUpperCase();
  if (v === "SINGLE_FAMILY" || v === "MULTI_FAMILY_RENTAL") return v;
  return "UNKNOWN";
}

export async function handleLookupPost(req: Request, env: Env): Promise<Response> {
  let body: { address?: string; dwelling_type?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return error("Invalid JSON body", 400, "BAD_JSON");
  }
  const address = (body.address ?? "").trim();
  if (address.length < 5) {
    return error("A valid US residential address is required", 422, "INVALID_ADDRESS");
  }
  const result = await runLookup(env, address, normalizeDwelling(body.dwelling_type));
  return json(result);
}

export async function handleLookupGet(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const address = (url.searchParams.get("address") ?? "").trim();
  if (address.length < 5) {
    return error("A valid US residential address is required", 422, "INVALID_ADDRESS");
  }
  const dwelling = normalizeDwelling(url.searchParams.get("dwelling_type"));
  const result = await runLookup(env, address, dwelling);
  return json(result);
}
