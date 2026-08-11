import { promises as fs } from "fs";
import path from "path";
import type { ChallengeAttempt, ChallengeRecord, SessionRecord } from "@/lib/types";

/**
 * Storage layer with two backends:
 * - PRODUCTION (Cloudflare Workers): KV namespace bound as KD_STORE.
 *   Key layout: `session:{id}` / `challenge:{id}` → JSON record.
 * - LOCAL DEV (plain `next dev`): file-backed JSON under ./data.
 *
 * The KV binding is resolved lazily per call; any failure to resolve the
 * Cloudflare context (i.e. we are in plain next dev) falls back to files.
 */

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

async function getKv(): Promise<KVLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    const kv = (env as unknown as Record<string, unknown>).KD_STORE as KVLike | undefined;
    return kv ?? null;
  } catch {
    return null;
  }
}

/* ----------------------------- file backend ----------------------------- */

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

/* ------------------------------- sessions ------------------------------- */

export async function createSession(record: SessionRecord): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.put(`session:${record.session_id}`, JSON.stringify(record));
    return;
  }
  const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
  sessions[record.session_id] = record;
  await writeJson(SESSIONS_FILE, sessions);
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(`session:${id}`);
    return raw ? (JSON.parse(raw) as SessionRecord) : null;
  }
  const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
  return sessions[id] ?? null;
}

export async function updateSession(
  id: string,
  patch: Partial<SessionRecord>
): Promise<SessionRecord | null> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(`session:${id}`);
    if (!raw) return null;
    const merged = { ...(JSON.parse(raw) as SessionRecord), ...patch };
    await kv.put(`session:${id}`, JSON.stringify(merged));
    return merged;
  }
  const sessions = await readJson<Record<string, SessionRecord>>(SESSIONS_FILE, {});
  if (!sessions[id]) return null;
  sessions[id] = { ...sessions[id], ...patch };
  await writeJson(SESSIONS_FILE, sessions);
  return sessions[id];
}

/* ------------------------------ challenges ------------------------------ */

export async function createChallenge(record: ChallengeRecord): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.put(`challenge:${record.challenge_id}`, JSON.stringify(record));
    return;
  }
  const challenges = await readJson<Record<string, ChallengeRecord>>(CHALLENGES_FILE, {});
  challenges[record.challenge_id] = record;
  await writeJson(CHALLENGES_FILE, challenges);
}

export async function getChallenge(id: string): Promise<ChallengeRecord | null> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(`challenge:${id}`);
    return raw ? (JSON.parse(raw) as ChallengeRecord) : null;
  }
  const challenges = await readJson<Record<string, ChallengeRecord>>(CHALLENGES_FILE, {});
  return challenges[id] ?? null;
}

export async function updateChallenge(
  id: string,
  patch: Partial<ChallengeRecord>
): Promise<ChallengeRecord | null> {
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(`challenge:${id}`);
    if (!raw) return null;
    const merged = { ...(JSON.parse(raw) as ChallengeRecord), ...patch };
    await kv.put(`challenge:${id}`, JSON.stringify(merged));
    return merged;
  }
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
  const kv = await getKv();
  if (kv) {
    const raw = await kv.get(`challenge:${id}`);
    if (!raw) return null;
    const c = JSON.parse(raw) as ChallengeRecord;
    c.attempts = [...(c.attempts ?? []), attempt];
    await kv.put(`challenge:${id}`, JSON.stringify(c));
    return c;
  }
  const challenges = await readJson<Record<string, ChallengeRecord>>(CHALLENGES_FILE, {});
  const c = challenges[id];
  if (!c) return null;
  c.attempts = [...(c.attempts ?? []), attempt];
  await writeJson(CHALLENGES_FILE, challenges);
  return c;
}
