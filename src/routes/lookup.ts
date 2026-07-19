import { DwellingType, Env } from "../types";
import { error, json } from "../lib/http";
import { runLookup, runZipLookup } from "../services/lookup";

// -----------------------------------------------------------------------------
// POST /api/lookup      { address, dwelling_type? }
// GET  /api/lookup?address=...&dwelling_type=...&nocache=1
// GET  /api/lookup?zip=48503                     (coarse ZIP fallback)
//
// The primary MVP endpoint (§11): frictionless, anonymous lookup returning the
// §22 unified output contract.
// -----------------------------------------------------------------------------

const ZIP_RE = /^\d{5}(-\d{4})?$/;

function normalizeDwelling(raw: unknown): DwellingType {
  const v = String(raw ?? "").toUpperCase();
  if (v === "SINGLE_FAMILY" || v === "MULTI_FAMILY_RENTAL") return v;
  return "UNKNOWN";
}

export async function handleLookupPost(req: Request, env: Env): Promise<Response> {
  let body: { address?: string; zip?: string; dwelling_type?: string; nocache?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return error("Invalid JSON body", 400, "BAD_JSON");
  }
  const dwelling = normalizeDwelling(body.dwelling_type);
  const noCache = body.nocache === true;

  if (body.zip && ZIP_RE.test(body.zip.trim())) {
    return json(await runZipLookup(env, body.zip.trim().slice(0, 5), { dwelling, noCache }));
  }

  const address = (body.address ?? "").trim();
  if (address.length < 5) {
    return error("A valid US residential address or ZIP is required", 422, "INVALID_ADDRESS");
  }
  return json(await runLookup(env, address, { dwelling, noCache }));
}

export async function handleLookupGet(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const dwelling = normalizeDwelling(url.searchParams.get("dwelling_type"));
  const noCache = url.searchParams.get("nocache") === "1";

  const zip = (url.searchParams.get("zip") ?? "").trim();
  if (zip && ZIP_RE.test(zip)) {
    return json(await runZipLookup(env, zip.slice(0, 5), { dwelling, noCache }));
  }

  const address = (url.searchParams.get("address") ?? "").trim();
  if (address.length < 5) {
    return error("A valid US residential address or ZIP is required", 422, "INVALID_ADDRESS");
  }
  return json(await runLookup(env, address, { dwelling, noCache }));
}
