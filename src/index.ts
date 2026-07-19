import { AlertJob, Env } from "./types";
import { Router } from "./router";
import { json } from "./lib/http";

import { handleLookupGet, handleLookupPost } from "./routes/lookup";
import {
  handleContaminant,
  handleContaminantList,
  handlePws,
} from "./routes/entities";
import { handleFilterRegistry } from "./routes/filters";
import { handleLogin, handleRegister } from "./routes/auth";
import {
  handleDeleteAddress,
  handleListAddresses,
  handleSaveAddress,
  handleToggleAlerts,
} from "./routes/addresses";
import {
  handleAddLabResult,
  handleImportTapScore,
  handleTrackCartridge,
  handleVaultReport,
} from "./routes/vault";
import {
  handleAdminAlerts,
  handleAdminIngest,
  handleHealth,
} from "./routes/ops";

import { runSdwisIngestion } from "./ingest/sdwisIngest";
import { evaluateAlerts, deliverAlert } from "./services/alerts";

// -----------------------------------------------------------------------------
// Route table.
// -----------------------------------------------------------------------------
const router = new Router()
  // Core lookup (MVP)
  .post("/api/lookup", handleLookupPost)
  .get("/api/lookup", handleLookupGet)
  // SEO entity endpoints
  .get("/api/pws/:pwsid", handlePws)
  .get("/api/contaminants", handleContaminantList)
  .get("/api/contaminants/:code", handleContaminant)
  .get("/api/filters", handleFilterRegistry)
  // Auth (V1)
  .post("/api/auth/register", handleRegister)
  .post("/api/auth/login", handleLogin)
  // Saved addresses + alerts (V1)
  .get("/api/addresses", handleListAddresses)
  .post("/api/addresses", handleSaveAddress)
  .delete("/api/addresses/:id", handleDeleteAddress)
  .put("/api/addresses/:id/alerts", handleToggleAlerts)
  // Premium vault
  .get("/api/vault/report", handleVaultReport)
  .post("/api/vault/lab-results", handleAddLabResult)
  .post("/api/vault/lab-results/import", handleImportTapScore)
  .post("/api/vault/cartridges", handleTrackCartridge)
  // Ops / admin
  .get("/api/health", handleHealth)
  .post("/api/admin/ingest", handleAdminIngest)
  .post("/api/admin/alerts", handleAdminAlerts);

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/" || url.pathname === "") {
      return json({
        name: "WaterQualityLens API",
        description:
          "Deterministic address-to-PWS lookup + NSF/ANSI-verified filtration matching.",
        endpoints: [
          "POST /api/lookup",
          "GET  /api/pws/:pwsid",
          "GET  /api/contaminants",
          "GET  /api/filters",
          "GET  /api/health",
        ],
      });
    }
    return router.handle(req, env, ctx);
  },

  // ---- Cron Triggers (§15) --------------------------------------------------
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // "0 7 * * 1" -> weekly SDWIS ingestion; "0 12 * * *" -> daily alert scan.
    if (event.cron === "0 7 * * 1") {
      ctx.waitUntil(
        runSdwisIngestion(env).then((s) =>
          console.log("SDWIS ingestion", JSON.stringify(s))
        )
      );
    } else if (event.cron === "0 12 * * *") {
      ctx.waitUntil(
        evaluateAlerts(env).then((n) => console.log(`Alerts enqueued: ${n}`))
      );
    }
  },

  // ---- Queue consumer: async alert delivery (§15) ---------------------------
  async queue(batch: MessageBatch<AlertJob>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        await deliverAlert(env, message.body);
        message.ack();
      } catch (err) {
        console.error("Alert delivery failed", (err as Error).message);
        message.retry();
      }
    }
  },
};
