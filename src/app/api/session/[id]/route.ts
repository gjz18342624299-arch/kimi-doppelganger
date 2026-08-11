import { NextResponse } from "next/server";
import type { OptionKey } from "@/lib/types";
import { PREDICTION_QUESTIONS } from "@/lib/questions";
import { getSession, updateSession } from "@/server/store";

const VALID: OptionKey[] = ["A", "B", "C", "D"];

/**
 * POST /api/session/[id]
 * Stores the user's real Q7–Q10 answers + final prediction score.
 * Predictions themselves are NEVER touched here — blind prediction stays real.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: { answers?: Record<string, OptionKey>; score?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const answers: Record<string, OptionKey> = {};
  for (const q of PREDICTION_QUESTIONS) {
    const v = body.answers?.[q.id];
    if (v && VALID.includes(v)) answers[q.id] = v;
  }
  const score = Math.max(0, Math.min(4, Math.round(body.score ?? 0)));

  await updateSession(id, { answers_q7_q10: answers, prediction_score: score });
  return NextResponse.json({ ok: true });
}
