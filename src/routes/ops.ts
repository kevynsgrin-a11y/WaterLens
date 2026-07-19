import { Env } from "../types";
import { json } from "../lib/http";
import { runSdwisIngestion } from "../ingest/sdwisIngest";
import { evaluateAlerts } from "../services/alerts";

// -----------------------------------------------------------------------------
// Operational endpoints.
//   GET  /api/health              -> liveness + binding sanity
//   POST /api/admin/ingest        -> manually trigger SDWIS ingestion (guarded)
//   POST /api/admin/alerts        -> manually trigger alert evaluation (guarded)
//
// Admin routes require the X-Admin-Token header to equal JWT_SECRET (a simple
// shared-secret guard suitable for cron-adjacent manual operations).
// -----------------------------------------------------------------------------

export async function handleHealth(_req: Request, env: Env): Promise<Response> {
  let dbOk = false;
  try {
    await env.DB.prepare("SELECT 1").first();
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return json({
    status: "ok",
    environment: env.ENVIRONMENT,
    db: dbOk,
    time: new Date().toISOString(),
  });
}

function isAdmin(req: Request, env: Env): boolean {
  const token = req.headers.get("x-admin-token");
  return Boolean(env.JWT_SECRET && token && token === env.JWT_SECRET);
}

export async function handleAdminIngest(req: Request, env: Env): Promise<Response> {
  if (!isAdmin(req, env)) return json({ error: "Forbidden" }, 403);
  const url = new URL(req.url);
  const max = Number(url.searchParams.get("max")) || 500;
  const summary = await runSdwisIngestion(env, max);
  return json({ ingested: summary });
}

export async function handleAdminAlerts(req: Request, env: Env): Promise<Response> {
  if (!isAdmin(req, env)) return json({ error: "Forbidden" }, 403);
  const enqueued = await evaluateAlerts(env);
  return json({ enqueued });
}
