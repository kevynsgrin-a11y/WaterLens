import { Env } from "./types";
import { error, preflight } from "./lib/http";

// Tiny path-pattern router. Patterns use ":param" segments, e.g. "/api/pws/:pwsid".

export type Handler = (
  req: Request,
  env: Env,
  params: Record<string, string>,
  ctx: ExecutionContext
) => Promise<Response> | Response;

interface Route {
  method: string;
  segments: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  private add(method: string, pattern: string, handler: Handler): void {
    this.routes.push({
      method,
      segments: pattern.split("/").filter(Boolean),
      handler,
    });
  }

  get(p: string, h: Handler) { this.add("GET", p, h); return this; }
  post(p: string, h: Handler) { this.add("POST", p, h); return this; }
  put(p: string, h: Handler) { this.add("PUT", p, h); return this; }
  delete(p: string, h: Handler) { this.add("DELETE", p, h); return this; }

  async handle(
    req: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (req.method === "OPTIONS") return preflight();

    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);

    let methodMismatch = false;
    for (const route of this.routes) {
      if (route.segments.length !== parts.length) continue;
      const params: Record<string, string> = {};
      let matched = true;
      for (let i = 0; i < route.segments.length; i++) {
        const seg = route.segments[i];
        if (seg.startsWith(":")) {
          params[seg.slice(1)] = decodeURIComponent(parts[i]);
        } else if (seg !== parts[i]) {
          matched = false;
          break;
        }
      }
      if (!matched) continue;
      if (route.method !== req.method) {
        methodMismatch = true;
        continue;
      }
      try {
        return await route.handler(req, env, params, ctx);
      } catch (err) {
        const message =
          env.ENVIRONMENT === "production"
            ? "Internal error"
            : (err as Error).message;
        return error(message, 500, "INTERNAL");
      }
    }

    return methodMismatch
      ? error("Method not allowed", 405, "METHOD_NOT_ALLOWED")
      : error("Not found", 404, "NOT_FOUND");
  }
}
