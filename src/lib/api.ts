import type { OptionKey, PredictRequest, PredictResponse } from "./types";

/** Client-side API helpers. All AI calls happen server-side via these routes. */

export async function requestPrediction(body: PredictRequest): Promise<PredictResponse> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`predict failed: ${res.status}`);
  return (await res.json()) as PredictResponse;
}

export async function completeSession(
  sessionId: string,
  answers: Record<string, OptionKey>,
  score: number
): Promise<void> {
  const res = await fetch(`/api/session/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, score }),
  });
  if (!res.ok) throw new Error(`complete failed: ${res.status}`);
}

export async function createChallenge(sessionId: string): Promise<string> {
  const res = await fetch("/api/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) throw new Error(`challenge failed: ${res.status}`);
  const data = (await res.json()) as { challengeId: string };
  return data.challengeId;
}
