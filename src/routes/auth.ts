import { Env } from "../types";
import { error, json } from "../lib/http";
import { hashPassword, signJwt, verifyPassword } from "../lib/auth";

// -----------------------------------------------------------------------------
// V1 user registration & login (§11). Unlocks saved addresses and alerts.
//   POST /api/auth/register  { email, password }
//   POST /api/auth/login     { email, password }
// -----------------------------------------------------------------------------

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface Credentials {
  email?: string;
  password?: string;
}

async function readCreds(req: Request): Promise<Credentials | null> {
  try {
    return (await req.json()) as Credentials;
  } catch {
    return null;
  }
}

export async function handleRegister(req: Request, env: Env): Promise<Response> {
  if (!env.JWT_SECRET) return error("Auth not configured", 503, "NO_AUTH");
  const creds = await readCreds(req);
  const email = creds?.email?.trim().toLowerCase();
  const password = creds?.password ?? "";
  if (!email || !EMAIL_RE.test(email)) return error("Valid email required", 422, "INVALID_EMAIL");
  if (password.length < 8) return error("Password must be at least 8 characters", 422, "WEAK_PASSWORD");

  const existing = await env.DB.prepare(`SELECT id FROM users WHERE email = ?1`)
    .bind(email)
    .first();
  if (existing) return error("Email already registered", 409, "EMAIL_TAKEN");

  const password_hash = await hashPassword(password);
  const res = await env.DB.prepare(
    `INSERT INTO users (email, password_hash, subscription_tier, created_at)
       VALUES (?1, ?2, 'free', ?3)`
  )
    .bind(email, password_hash, new Date().toISOString())
    .run();

  const userId = res.meta.last_row_id as number;
  const token = await signJwt(env, { sub: userId, email, tier: "free" });
  return json({ user: { id: userId, email, tier: "free" }, token }, 201);
}

export async function handleLogin(req: Request, env: Env): Promise<Response> {
  if (!env.JWT_SECRET) return error("Auth not configured", 503, "NO_AUTH");
  const creds = await readCreds(req);
  const email = creds?.email?.trim().toLowerCase();
  const password = creds?.password ?? "";
  if (!email || !password) return error("Email and password required", 422, "MISSING_CREDS");

  const user = await env.DB.prepare(
    `SELECT id, email, password_hash, subscription_tier FROM users WHERE email = ?1`
  )
    .bind(email)
    .first<{ id: number; email: string; password_hash: string; subscription_tier: string }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return error("Invalid email or password", 401, "BAD_CREDENTIALS");
  }

  const tier = user.subscription_tier === "premium" ? "premium" : "free";
  const token = await signJwt(env, { sub: user.id, email: user.email, tier });
  return json({ user: { id: user.id, email: user.email, tier }, token });
}
