import { promises as fs } from "fs";
import path from "path";
import type { ChallengeAttempt, ChallengeRecord, SessionRecord } from "@/lib/types";

/**
 * Minimal file-backed JSON store (server-only).
 * Good enough for the demo / MVP; swap for Supabase / SQLite later.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const CHALLENGES_FILE = path.join(DATA_DIR, "challenges.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function createSession(record: SessionRecord): Promise<void> {
  const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
  sessions[record.session_id] = record;
  await writeJson(SESSIONS_FILE, sessions);
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
  return sessions[id] ?? null;
}

export async function updateSession(
  id: string,
  patch: Partial<SessionRecord>
): Promise<SessionRecord | null> {
  const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
  if (!sessions[id]) return null;
  sessions[id] = { ...sessions[id], ...patch };
  await writeJson(SESSIONS_FILE, sessions);
  return sessions[id];
}

export async function createChallenge(record: ChallengeRecord): Promise<void> {
  const challenges = await readJson<Record<string, ChallengeRecord>>(CHALLENGES_FILE, {});
  challenges[record.challenge_id] = record;
  await writeJson(CHALLENGES_FILE, challenges);
}

export async function getChallenge(id: string): Promise<ChallengeRecord | null> {
  const challenges = await readJson<Record<string, ChallengeRecord>>(CHALLENGES_FILE, {});
  return challenges[id] ?? null;
}

export async function updateChallenge(
  id: string,
  patch: Partial<ChallengeRecord>
): Promise<ChallengeRecord | null> {
  const challenges = await readJson<Record<string, ChallengeRecord>>(CHALLENGES_FILE, {});
  if (!challenges[id]) return null;
  challenges[id] = { ...challenges[id], ...patch };
  await writeJson(CHALLENGES_FILE, challenges);
  return challenges[id];
}

/** Append one friend's play-through. Challenge links are reusable by many friends. */
export async function addAttempt(
  id: string,
  attempt: ChallengeAttempt
): Promise<ChallengeRecord | null> {
  const challenges = await readJson<Record<string, ChallengeRecord>>(CHALLENGES_FILE, {});
  const c = challenges[id];
  if (!c) return null;
  c.attempts = [...(c.attempts ?? []), attempt];
  await writeJson(CHALLENGES_FILE, challenges);
  return c;
}
