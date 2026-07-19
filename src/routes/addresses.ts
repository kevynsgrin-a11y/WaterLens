import { DwellingType, Env } from "../types";
import { error, json } from "../lib/http";
import { authenticate } from "../lib/auth";
import { geocode } from "../lib/geocode";
import { resolvePws } from "../services/spatial";

// -----------------------------------------------------------------------------
// Saved addresses & alert opt-in (§11 V1 retention loop).
//   GET    /api/addresses                 -> list saved addresses
//   POST   /api/addresses                 -> save an address (resolves PWSID)
//   DELETE /api/addresses/:id             -> remove a saved address
//   PUT    /api/addresses/:id/alerts      -> toggle email/SMS alert opt-in
// -----------------------------------------------------------------------------

export async function handleListAddresses(req: Request, env: Env): Promise<Response> {
  const claims = await authenticate(env, req);
  if (!claims) return error("Unauthorized", 401, "UNAUTHORIZED");

  const { results } = await env.DB.prepare(
    `SELECT id, pwsid, label, address, dwelling_type, alert_email, alert_sms, last_notified_at
       FROM saved_addresses WHERE user_id = ?1 ORDER BY created_at DESC`
  )
    .bind(claims.sub)
    .all();
  return json({ addresses: results ?? [] });
}

export async function handleSaveAddress(req: Request, env: Env): Promise<Response> {
  const claims = await authenticate(env, req);
  if (!claims) return error("Unauthorized", 401, "UNAUTHORIZED");

  let body: { address?: string; label?: string; dwelling_type?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return error("Invalid JSON body", 400, "BAD_JSON");
  }
  const address = (body.address ?? "").trim();
  if (address.length < 5) return error("Valid address required", 422, "INVALID_ADDRESS");

  const geo = await geocode(env, address);
  if (!geo) return error("Address could not be geocoded", 422, "GEOCODE_FAILED");
  const match = await resolvePws(env, geo);

  const dwelling: DwellingType =
    body.dwelling_type === "SINGLE_FAMILY" || body.dwelling_type === "MULTI_FAMILY_RENTAL"
      ? body.dwelling_type
      : "UNKNOWN";

  const res = await env.DB.prepare(
    `INSERT INTO saved_addresses
        (user_id, pwsid, label, address, dwelling_type, alert_email, alert_sms, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, 1, 0, ?6)`
  )
    .bind(
      claims.sub,
      match.pwsid,
      body.label ?? null,
      geo.matched_address,
      dwelling,
      new Date().toISOString()
    )
    .run();

  return json(
    {
      id: res.meta.last_row_id,
      pwsid: match.pwsid,
      match_tier: match.tier,
      confidence: match.confidence,
    },
    201
  );
}

export async function handleDeleteAddress(req: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const claims = await authenticate(env, req);
  if (!claims) return error("Unauthorized", 401, "UNAUTHORIZED");

  const res = await env.DB.prepare(
    `DELETE FROM saved_addresses WHERE id = ?1 AND user_id = ?2`
  )
    .bind(Number(params.id), claims.sub)
    .run();

  if (!res.meta.changes) return error("Address not found", 404, "NOT_FOUND");
  return json({ deleted: true });
}

export async function handleToggleAlerts(req: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const claims = await authenticate(env, req);
  if (!claims) return error("Unauthorized", 401, "UNAUTHORIZED");

  let body: { alert_email?: boolean; alert_sms?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return error("Invalid JSON body", 400, "BAD_JSON");
  }

  const res = await env.DB.prepare(
    `UPDATE saved_addresses
        SET alert_email = ?3, alert_sms = ?4
      WHERE id = ?1 AND user_id = ?2`
  )
    .bind(
      Number(params.id),
      claims.sub,
      body.alert_email === false ? 0 : 1,
      body.alert_sms === true ? 1 : 0
    )
    .run();

  if (!res.meta.changes) return error("Address not found", 404, "NOT_FOUND");
  return json({ updated: true });
}
