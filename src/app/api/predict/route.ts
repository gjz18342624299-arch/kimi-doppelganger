import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import type { PredictRequest, PredictResponse, SessionRecord } from "@/lib/types";
import { sanitizePrediction } from "@/lib/prediction";
import { callMoonshot } from "@/server/moonshot";
import { createSession } from "@/server/store";

/**
 * POST /api/predict
 * Called exactly ONCE per session — right after Q6.
 * Blind prediction: generates & stores Q7–Q10 predictions BEFORE the user
 * answers them. Predictions are never regenerated afterwards.
 */
export async function POST(req: Request) {
  let body: PredictRequest;
  try {
    body = (await req.json()) as PredictRequest;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const learningAnswers = body.learningAnswers ?? {};
  const freeText = (body.freeText ?? "").slice(0, 40);

  let raw: unknown = null;
  let demoMode = !process.env.MOONSHOT_API_KEY;
  if (!demoMode) {
    try {
      raw = await callMoonshot(learningAnswers, freeText);
    } catch (err) {
      // DEMO_MODE fallback — game must remain fully playable without the API.
      console.error("[predict] Moonshot failed, falling back to DEMO_MODE:", err);
      demoMode = true;
    }
  }

  const prediction = sanitizePrediction(raw, learningAnswers, freeText);

  const session: SessionRecord = {
    session_id: randomUUID(),
    created_at: new Date().toISOString(),
    answers_q1_q6: learningAnswers,
    free_text_q6: freeText,
    predictions_q7_q10: prediction.predictions,
    answers_q7_q10: null,
    prediction_score: null,
    doppelganger_type: prediction.type,
    traits: prediction.traits,
    observation: prediction.observation,
  };
  await createSession(session);

  const res: PredictResponse = {
    sessionId: session.session_id,
    predictions: prediction.predictions,
    reasoning: prediction.reasoning,
    type: prediction.type,
    observation: prediction.observation,
    traits: prediction.traits,
    demoMode: demoMode || prediction.demoMode,
  };
  return NextResponse.json(res);
}
