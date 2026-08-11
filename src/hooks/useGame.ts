"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LearningAnswers, OptionKey, PredictResponse } from "@/lib/types";
import { completeSession, requestPrediction } from "@/lib/api";
import { loadSession, saveSession, clearSession } from "@/lib/storage";
import { track } from "@/lib/analytics";

export type GamePhase =
  | "learning"
  | "transition"
  | "prediction"
  | "computing"
  | "result";

export interface GameState {
  phase: GamePhase;
  learningIndex: number;
  learningAnswers: LearningAnswers;
  freeText: string;
  prediction: PredictResponse | null;
  roundIndex: number;
  predictionAnswers: Record<string, OptionKey>;
  kimiScore: number;
  humanScore: number;
  error: string | null;
}

const INITIAL: GameState = {
  phase: "learning",
  learningIndex: 0,
  learningAnswers: {},
  freeText: "",
  prediction: null,
  roundIndex: 0,
  predictionAnswers: {},
  kimiScore: 0,
  humanScore: 0,
  error: null,
};

/**
 * The game state machine.
 * PLAY → PROVE → SHARE → CLONE → UNLOCK → RETURN
 *
 * AI call discipline: exactly ONE request to /api/predict, fired once after Q6.
 * Predictions are generated BEFORE the user answers Q7–Q10 and never
 * regenerated. MATCH / MISS is computed locally.
 */
export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL);
  const predictStarted = useRef(false);

  // Restore mid-game progress (refresh-safe). Result state is not resumed —
  // the result depends on the server's session record; a fresh run is safer.
  useEffect(() => {
    const s = loadSession();
    if (Object.keys(s.learningAnswers).length > 0 || s.freeText) {
      setState((prev) => ({
        ...prev,
        learningAnswers: s.learningAnswers,
        freeText: s.freeText,
        learningIndex: Math.min(Object.keys(s.learningAnswers).length, 5),
      }));
    }
  }, []);

  useEffect(() => {
    track("test_start");
  }, []);

  const persist = useCallback((patch: Partial<Parameters<typeof saveSession>[0]>) => {
    const s = loadSession();
    saveSession({ ...s, ...patch });
  }, []);

  const answerLearning = useCallback(
    (questionId: string, key: OptionKey) => {
      setState((prev) => {
        const learningAnswers = { ...prev.learningAnswers, [questionId]: key };
        persist({ learningAnswers });
        return {
          ...prev,
          learningAnswers,
          learningIndex: Math.min(prev.learningIndex + 1, 5),
        };
      });
    },
    [persist]
  );

  const goBackLearning = useCallback(() => {
    setState((prev) => ({
      ...prev,
      learningIndex: Math.max(prev.learningIndex - 1, 0),
    }));
  }, []);

  const submitFreeText = useCallback(
    (text: string) => {
      persist({ freeText: text });
      setState((prev) => ({ ...prev, freeText: text, phase: "transition" }));
      track("learning_complete");
    },
    [persist]
  );

  /** Fire the single AI call while the transition animation plays. */
  const runPrediction = useCallback(async () => {
    if (predictStarted.current) return;
    predictStarted.current = true;
    setState((prev) => ({ ...prev, error: null }));
    try {
      const prediction = await requestPrediction({
        learningAnswers: state.learningAnswers,
        freeText: state.freeText,
      });
      persist({ prediction, sessionId: prediction.sessionId });
      setState((prev) => ({ ...prev, prediction }));
    } catch (err) {
      predictStarted.current = false;
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "prediction failed",
      }));
    }
  }, [state.learningAnswers, state.freeText, persist]);

  const startPredictionPhase = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "prediction", roundIndex: 0 }));
  }, []);

  const answerPrediction = useCallback(
    (questionId: string, pick: OptionKey, match: boolean) => {
      setState((prev) => {
        const predictionAnswers = { ...prev.predictionAnswers, [questionId]: pick };
        const kimiScore = prev.kimiScore + (match ? 1 : 0);
        const humanScore = prev.humanScore + (match ? 0 : 1);
        const last = prev.roundIndex >= 3;
        persist({ predictionAnswers, score: kimiScore });
        return {
          ...prev,
          predictionAnswers,
          kimiScore,
          humanScore,
          roundIndex: last ? prev.roundIndex : prev.roundIndex + 1,
          phase: last ? "computing" : prev.phase,
        };
      });
    },
    [persist]
  );

  /** Called when entering "computing": persist final answers, then reveal. */
  const finalize = useCallback(async () => {
    const s = loadSession();
    if (s.sessionId) {
      try {
        await completeSession(s.sessionId, state.predictionAnswers, state.kimiScore);
      } catch (err) {
        console.error("[finalize] failed to persist session:", err);
      }
    }
    track("test_complete", { score: state.kimiScore });
    setState((prev) => ({ ...prev, phase: "result" }));
  }, [state.predictionAnswers, state.kimiScore]);

  const restart = useCallback(() => {
    clearSession();
    predictStarted.current = false;
    setState(INITIAL);
  }, []);

  return {
    state,
    answerLearning,
    goBackLearning,
    submitFreeText,
    runPrediction,
    startPredictionPhase,
    answerPrediction,
    finalize,
    restart,
  };
}
