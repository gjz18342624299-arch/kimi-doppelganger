import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import type { ChallengeRecord } from "@/lib/types";
import { createChallenge, getSession } from "@/server/store";

/**
 * POST /api/challenge  { sessionId }
 * Creates a challenge link from a completed session.
 * Stores: owner's real Q7–Q10 answers, Kimi's original predictions,
 * prediction score, doppelgänger type.
 */
export async function POST(req: Request) {
  let body: { sessionId?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = await getSession(body.sessionId);
  if (
    !session ||
    !session.predictions_q7_q10 ||
    !session.answers_q7_q10 ||
    session.prediction_score === null ||
    !session.doppelganger_type
  ) {
    return NextResponse.json({ error: "session incomplete" }, { status: 409 });
  }

  const challenge: ChallengeRecord = {
    challenge_id: randomUUID().replace(/-/g, "").slice(0, 12),
    owner_session_id: session.session_id,
    created_at: new Date().toISOString(),
    owner_type: session.doppelganger_type,
    owner_score: session.prediction_score,
    kimi_predictions: session.predictions_q7_q10,
    owner_answers: session.answers_q7_q10,
    friend_answers: null,
    friend_score: null,
  };
  await createChallenge(challenge);

  return NextResponse.json({ challengeId: challenge.challenge_id });
}
