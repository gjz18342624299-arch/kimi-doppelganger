import { NextResponse } from "next/server";
import type { BoardEntry, ChallengePublic, OptionKey } from "@/lib/types";
import { PREDICTION_QUESTIONS } from "@/lib/questions";
import { getChallenge, addAttempt } from "@/server/store";

const VALID: OptionKey[] = ["A", "B", "C", "D"];

type Challenge = NonNullable<Awaited<ReturnType<typeof getChallenge>>>;

function attemptCount(c: Challenge): number {
  // v1 links stored a single friend_answers record; count it too.
  return (c.attempts?.length ?? 0) + (c.friend_answers ? 1 : 0);
}

function toBoard(c: Challenge): BoardEntry[] {
  const entries: BoardEntry[] = (c.attempts ?? []).map((a) => ({
    nickname: a.nickname ?? "",
    known_duration: a.known_duration,
    score: a.friend_score,
    created_at: a.created_at,
  }));
  // v1 legacy single-friend record joins the board as an anonymous entry.
  if (c.friend_answers && c.friend_score !== null) {
    entries.push({
      nickname: "",
      known_duration: c.known_duration ?? "",
      score: c.friend_score,
      created_at: c.created_at,
    });
  }
  // Best first; ties broken by who played earlier.
  entries.sort((a, b) => b.score - a.score || a.created_at.localeCompare(b.created_at));
  return entries.slice(0, 20);
}

function toPublic(c: Challenge): ChallengePublic {
  return {
    challenge_id: c.challenge_id,
    owner_type: c.owner_type,
    owner_score: c.owner_score,
    created_at: c.created_at,
    attempt_count: attemptCount(c),
    board: toBoard(c),
  };
}

/**
 * GET /api/challenge/[id]
 * Public view — NEVER leaks owner answers or Kimi predictions.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const challenge = await getChallenge(id);
  if (!challenge) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(toPublic(challenge));
}

/**
 * POST /api/challenge/[id]  { answers, knownDuration? }
 * Friend submits Q7–Q10 answers (0 AI calls). The link is REUSABLE:
 * every friend gets their own attempt recorded, no 409 lockout.
 * Friend score = how many of the friend's answers match the OWNER's real answers.
 * Kimi score = owner's original prediction score (computed at owner's test time).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const challenge = await getChallenge(id);
  if (!challenge) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: { answers?: Record<string, OptionKey>; knownDuration?: string; nickname?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const answers: Record<string, OptionKey> = {};
  for (const q of PREDICTION_QUESTIONS) {
    const v = body.answers?.[q.id];
    if (!v || !VALID.includes(v)) {
      return NextResponse.json({ error: `missing answer for ${q.id}` }, { status: 400 });
    }
    answers[q.id] = v;
  }

  let friendScore = 0;
  for (const q of PREDICTION_QUESTIONS) {
    if (answers[q.id] === challenge.owner_answers[q.id]) friendScore += 1;
  }

  const createdAt = new Date().toISOString();
  const updated = await addAttempt(id, {
    friend_answers: answers,
    friend_score: friendScore,
    known_duration: (body.knownDuration ?? "").slice(0, 20),
    created_at: createdAt,
    nickname: (body.nickname ?? "").trim().slice(0, 12),
  });

  const board = updated ? toBoard(updated) : [];
  const yourRank = board.findIndex((e) => e.created_at === createdAt) + 1;

  return NextResponse.json({
    kimi_score: challenge.owner_score,
    friend_score: friendScore,
    attempt_count: updated ? attemptCount(updated) : 1,
    board,
    your_rank: yourRank > 0 ? yourRank : board.length,
  });
}
