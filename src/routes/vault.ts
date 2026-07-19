import { Env } from "../types";
import { error, json } from "../lib/http";
import { authenticate } from "../lib/auth";
import {
  addLabResult,
  buildVaultReport,
  importTapScoreResults,
  requirePremium,
  trackCartridge,
} from "../services/vault";

// -----------------------------------------------------------------------------
// Premium "Household Water Vault" endpoints (§11 Premium tier).
//   GET  /api/vault/report                 -> printable report payload
//   POST /api/vault/lab-results            -> add a manual lab result
//   POST /api/vault/lab-results/import     -> import from Tap Score API
//   POST /api/vault/cartridges             -> track a cartridge schedule
// -----------------------------------------------------------------------------

async function gatePremium(req: Request, env: Env): Promise<{ userId: number } | Response> {
  const claims = await authenticate(env, req);
  if (!claims) return error("Unauthorized", 401, "UNAUTHORIZED");
  if (!(await requirePremium(env, claims.sub))) {
    return error("Premium subscription required (Household Water Vault)", 402, "PREMIUM_REQUIRED");
  }
  return { userId: claims.sub };
}

export async function handleVaultReport(req: Request, env: Env): Promise<Response> {
  const gate = await gatePremium(req, env);
  if (gate instanceof Response) return gate;
  return json(await buildVaultReport(env, gate.userId));
}

export async function handleAddLabResult(req: Request, env: Env): Promise<Response> {
  const gate = await gatePremium(req, env);
  if (gate instanceof Response) return gate;

  let body: {
    saved_address_id?: number;
    provider?: string;
    external_id?: string;
    analyte?: string;
    value?: number;
    unit?: string;
    sampled_at?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return error("Invalid JSON body", 400, "BAD_JSON");
  }
  if (!body.analyte || typeof body.value !== "number" || !body.unit) {
    return error("analyte, value and unit are required", 422, "INVALID_LAB_RESULT");
  }

  const id = await addLabResult(env, {
    user_id: gate.userId,
    saved_address_id: body.saved_address_id ?? null,
    provider: body.provider ?? "MANUAL",
    external_id: body.external_id ?? null,
    analyte: body.analyte,
    value: body.value,
    unit: body.unit,
    sampled_at: body.sampled_at ?? null,
  });
  return json({ id }, 201);
}

export async function handleImportTapScore(req: Request, env: Env): Promise<Response> {
  const gate = await gatePremium(req, env);
  if (gate instanceof Response) return gate;

  let body: { order_id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return error("Invalid JSON body", 400, "BAD_JSON");
  }
  if (!body.order_id) return error("order_id is required", 422, "MISSING_ORDER_ID");

  try {
    const count = await importTapScoreResults(env, gate.userId, body.order_id);
    return json({ imported: count });
  } catch (err) {
    return error((err as Error).message, 502, "TAPSCORE_IMPORT_FAILED");
  }
}

export async function handleTrackCartridge(req: Request, env: Env): Promise<Response> {
  const gate = await gatePremium(req, env);
  if (gate instanceof Response) return gate;

  let body: {
    filter_id?: number;
    installed_at?: string;
    capacity_gallons?: number;
    estimated_daily_gallons?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return error("Invalid JSON body", 400, "BAD_JSON");
  }
  if (!body.filter_id || !body.installed_at) {
    return error("filter_id and installed_at are required", 422, "INVALID_CARTRIDGE");
  }

  const result = await trackCartridge(env, {
    user_id: gate.userId,
    filter_id: body.filter_id,
    installed_at: body.installed_at,
    capacity_gallons: body.capacity_gallons ?? null,
    estimated_daily_gallons: body.estimated_daily_gallons ?? 3,
  });
  return json(result, 201);
}
