// Shared types for Kimi Doppelgänger

export type OptionKey = "A" | "B" | "C" | "D";

export type QuestionKind = "choice" | "freetext";

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: string; // "q1" ... "q10"
  phase: "learning" | "prediction";
  kind: QuestionKind;
  scenario: string[]; // scenario lines, editorial style
  prompt: string;
  options?: QuestionOption[];
  placeholder?: string;
  maxLength?: number;
  swipeHint?: boolean;
}

export type PersonalityTypeId =
  | "GHOST"
  | "LATE"
  | "CTRL"
  | "CHAOS"
  | "PLAN"
  | "MAIN"
  | "NPC";

export interface PersonalityType {
  id: PersonalityTypeId;
  /** Chinese display name — the hero text on result / share card */
  nameZh: string;
  subtitle: string;
  observation: string;
}

export type LearningAnswers = Partial<Record<string, OptionKey>>;

export interface PredictRequest {
  learningAnswers: LearningAnswers; // q1..q5
  freeText: string; // q6
}

export interface PredictResponse {
  sessionId: string;
  predictions: Record<string, OptionKey>; // q7..q10
  /** Kimi's one-line rationale per prediction (q7..q10), shown at reveal */
  reasoning: Record<string, string>;
  type: PersonalityTypeId;
  observation: string;
  traits: { label: string; value: number }[];
  /** true when DEMO_MODE engine was used instead of Moonshot API */
  demoMode?: boolean;
}

export interface SessionRecord {
  session_id: string;
  created_at: string;
  answers_q1_q6: LearningAnswers;
  free_text_q6: string;
  predictions_q7_q10: Record<string, OptionKey> | null;
  answers_q7_q10: Record<string, OptionKey> | null;
  prediction_score: number | null;
  doppelganger_type: PersonalityTypeId | null;
  traits: { label: string; value: number }[] | null;
  observation: string | null;
}

export interface ChallengeAttempt {
  friend_answers: Record<string, OptionKey>;
  friend_score: number;
  known_duration: string;
  created_at: string;
  /** optional display name for the leaderboard ("" = anonymous) */
  nickname?: string;
}

export interface ChallengeRecord {
  challenge_id: string;
  owner_session_id: string;
  created_at: string;
  owner_type: PersonalityTypeId;
  owner_score: number;
  kimi_predictions: Record<string, OptionKey>;
  owner_answers: Record<string, OptionKey>;
  /** @deprecated single-friend fields from v1 — kept for back-compat reads */
  friend_answers: Record<string, OptionKey> | null;
  /** @deprecated single-friend fields from v1 — kept for back-compat reads */
  friend_score: number | null;
  known_duration?: string;
  /** Multi-friend attempts (v2). A challenge link is reusable. */
  attempts?: ChallengeAttempt[];
}

/** One row on the public leaderboard — no answers, just the outcome. */
export interface BoardEntry {
  nickname: string; // "" = 匿名
  known_duration: string;
  score: number;
  created_at: string;
}

/** Public view of a challenge — never leaks owner answers or kimi predictions */
export interface ChallengePublic {
  challenge_id: string;
  owner_type: PersonalityTypeId;
  owner_score: number;
  created_at: string;
  /** how many friends have played this link */
  attempt_count: number;
  /** public leaderboard, best first */
  board: BoardEntry[];
}
