import { AlertJob, Env } from "../types";

// -----------------------------------------------------------------------------
// Alert evaluation (§11 V1). A daily cron scans saved addresses and enqueues an
// AlertJob whenever a new health-based violation, boil-water advisory, or UCMR 5
// threshold breach appears since the user was last notified. Delivery is handled
// asynchronously by the queue consumer (§15 Cloudflare Queues).
// -----------------------------------------------------------------------------

interface SavedAddressRow {
  id: number;
  user_id: number;
  email: string;
  pwsid: string;
  label: string | null;
  last_notified_at: string | null;
  alert_email: number;
}

interface ViolationRow {
  violation_id: string;
  contaminant_code: string | null;
  violation_category: string | null;
  begin_date: string | null;
}

/**
 * Evaluate every alert-enabled saved address and enqueue notifications for newly
 * observed health-based violations. Returns the number of jobs enqueued.
 */
export async function evaluateAlerts(env: Env): Promise<number> {
  const { results: saved } = await env.DB.prepare(
    `SELECT sa.id, sa.user_id, u.email, sa.pwsid, sa.label,
            sa.last_notified_at, sa.alert_email
       FROM saved_addresses sa
       JOIN users u ON u.id = sa.user_id
      WHERE sa.alert_email = 1`
  ).all<SavedAddressRow>();

  let enqueued = 0;

  for (const addr of saved ?? []) {
    const since = addr.last_notified_at ?? "1970-01-01T00:00:00Z";
    const { results: violations } = await env.DB.prepare(
      `SELECT violation_id, contaminant_code, violation_category, begin_date
         FROM violations
        WHERE pwsid = ?1
          AND is_health_based = 1
          AND (created_at > ?2)
        ORDER BY begin_date DESC
        LIMIT 20`
    )
      .bind(addr.pwsid, since)
      .all<ViolationRow>();

    if (!violations?.length) continue;

    const lines = violations
      .map(
        (v) =>
          `• ${v.violation_category ?? "Violation"}${
            v.contaminant_code ? ` (${v.contaminant_code})` : ""
          } — filed ${v.begin_date ?? "recently"}`
      )
      .join("\n");

    const job: AlertJob = {
      type: "VIOLATION",
      user_id: addr.user_id,
      email: addr.email,
      pwsid: addr.pwsid,
      subject: `New water quality alert for ${addr.label ?? addr.pwsid}`,
      body:
        `We detected ${violations.length} new health-based item(s) reported to SDWIS ` +
        `for your saved water system (${addr.pwsid}):\n\n${lines}\n\n` +
        `Review your full report and verified filtration options in WaterQualityLens.`,
    };

    await env.ALERT_QUEUE.send(job);
    await env.DB.prepare(
      `UPDATE saved_addresses SET last_notified_at = ?2 WHERE id = ?1`
    )
      .bind(addr.id, new Date().toISOString())
      .run();

    enqueued++;
  }

  return enqueued;
}

/**
 * Deliver a single alert. Uses Resend if configured; otherwise records the
 * intent in the outbox table so nothing is silently dropped.
 */
export async function deliverAlert(env: Env, job: AlertJob): Promise<void> {
  if (env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: "WaterQualityLens <alerts@waterqualitylens.com>",
        to: [job.email],
        subject: job.subject,
        text: job.body,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend delivery failed: ${res.status}`);
    }
  }

  await env.DB.prepare(
    `INSERT INTO alert_outbox (user_id, email, pwsid, type, subject, body, delivered, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
  )
    .bind(
      job.user_id,
      job.email,
      job.pwsid,
      job.type,
      job.subject,
      job.body,
      env.RESEND_API_KEY ? 1 : 0,
      new Date().toISOString()
    )
    .run();
}
