/**
 * Analytics events — reserved funnel instrumentation.
 * Currently logs to console (and keeps a session buffer for debugging).
 * Wire to a real endpoint later without touching call sites.
 */

export const ANALYTICS_EVENTS = [
  "landing_view",
  "test_start",
  "learning_question_answered",
  "learning_complete",
  "prediction_locked",
  "prediction_answered",
  "prediction_match",
  "test_complete",
  "result_share_click",
  "challenge_open",
  "challenge_complete",
  "friend_start_own_test",
  "unlock_doppelganger_click",
  "kimi_redirect_click",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

type Payload = Record<string, unknown> | undefined;

export function track(event: AnalyticsEvent, payload?: Payload): void {
  if (typeof window === "undefined") return;
  const entry = { event, payload, ts: Date.now() };
  console.debug("[analytics]", entry);
  try {
    const key = "kd_analytics";
    const buf = JSON.parse(window.sessionStorage.getItem(key) ?? "[]") as unknown[];
    buf.push(entry);
    window.sessionStorage.setItem(key, JSON.stringify(buf.slice(-200)));
  } catch {
    /* storage full / unavailable — analytics must never break the game */
  }
  // TODO: forward to real analytics endpoint (Acquisition / Activation / Aha / Advocacy / Retention)
}
