import type { LearningAnswers, OptionKey, PredictResponse } from "./types";

/**
 * Client-side session persistence (sessionStorage).
 * Lets a user refresh mid-game without losing progress.
 * Server remains the source of truth for predictions & challenges.
 */

const KEY = "kd_session_v1";

export interface ClientSession {
  sessionId: string | null;
  learningAnswers: LearningAnswers;
  freeText: string;
  prediction: PredictResponse | null;
  predictionAnswers: Record<string, OptionKey>;
  score: number;
  challengeId: string | null;
}

export const EMPTY_SESSION: ClientSession = {
  sessionId: null,
  learningAnswers: {},
  freeText: "",
  prediction: null,
  predictionAnswers: {},
  score: 0,
  challengeId: null,
};

export function loadSession(): ClientSession {
  if (typeof window === "undefined") return EMPTY_SESSION;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return EMPTY_SESSION;
    return { ...EMPTY_SESSION, ...(JSON.parse(raw) as Partial<ClientSession>) };
  } catch {
    return EMPTY_SESSION;
  }
}

export function saveSession(s: ClientSession): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
