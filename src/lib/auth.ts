import { Env } from "../types";

// -----------------------------------------------------------------------------
// Minimal, dependency-free auth primitives built on Web Crypto (available in
// Workers). Passwords use PBKDF2-SHA256; sessions use a compact HMAC-signed JWT.
// -----------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 100_000;
const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64Url(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---- Password hashing --------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64Url(salt)}$${toB64Url(bits)}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = fromB64Url(parts[2]);
  const expected = parts[3];
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return timingSafeEqual(toB64Url(bits), expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---- JWT (HS256) -------------------------------------------------------------

export interface JwtClaims {
  sub: number; // user id
  email: string;
  tier: "free" | "premium";
  exp: number; // epoch seconds
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signJwt(
  env: Env,
  claims: Omit<JwtClaims, "exp">,
  ttlSeconds = 60 * 60 * 24 * 30
): Promise<string> {
  if (!env.JWT_SECRET) throw new Error("JWT_SECRET not configured");
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = { ...claims, exp };
  const head = toB64Url(enc.encode(JSON.stringify(header)));
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const data = `${head}.${body}`;
  const key = await hmacKey(env.JWT_SECRET);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return `${data}.${toB64Url(sig)}`;
}

export async function verifyJwt(
  env: Env,
  token: string
): Promise<JwtClaims | null> {
  if (!env.JWT_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const key = await hmacKey(env.JWT_SECRET);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromB64Url(sig),
    enc.encode(`${head}.${body}`)
  );
  if (!valid) return null;
  try {
    const claims = JSON.parse(dec.decode(fromB64Url(body))) as JwtClaims;
    if (claims.exp * 1000 < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

/** Extract & verify the bearer token from a request. */
export async function authenticate(
  env: Env,
  req: Request
): Promise<JwtClaims | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifyJwt(env, header.slice(7));
}
