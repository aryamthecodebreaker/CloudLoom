/**
 * Optional webhook notifications (Slack-compatible payload shape).
 * Set WEBHOOK_URL to receive alerts on high-signal security events:
 *   - suspicious exposure drift (internal → public)
 *   - critical findings created by real ingestion
 * Fire-and-forget: notification failures never block ingestion.
 */
export async function notify(text: string): Promise<void> {
  const url = process.env.WEBHOOK_URL ?? "";
  if (url === "") return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* never block the security pipeline on notification failures */
  }
}
