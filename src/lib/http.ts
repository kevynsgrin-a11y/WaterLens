// Small HTTP/JSON helpers shared by every route.

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "cache-control": "no-store",
};

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

export function error(message: string, status = 400, code?: string): Response {
  return json({ error: message, code: code ?? null }, status);
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: JSON_HEADERS });
}

/** Fetch JSON with a timeout and typed result. Throws on non-2xx. */
export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10_000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { accept: "application/json", ...(init.headers ?? {}) },
    });
    if (!res.ok) {
      throw new Error(`Upstream ${res.status} for ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Retry with exponential backoff — used for resilient SDWIS/Envirofacts calls. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 500
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
      }
    }
  }
  throw lastErr;
}
