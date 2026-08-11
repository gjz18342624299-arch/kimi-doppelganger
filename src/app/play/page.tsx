"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import GameShell from "@/components/GameShell";
import LearningQuestion from "@/components/LearningQuestion";
import FreeTextQuestion from "@/components/FreeTextQuestion";
import TrainingTransition from "@/components/TrainingTransition";
import PredictionQuestion from "@/components/PredictionQuestion";
import ResultCard from "@/components/ResultCard";
import { useGame } from "@/hooks/useGame";
import { LEARNING_QUESTIONS, PREDICTION_QUESTIONS } from "@/lib/questions";
import { createChallenge } from "@/lib/api";
import { loadSession } from "@/lib/storage";
import type { OptionKey } from "@/lib/types";

export default function PlayPage() {
  const router = useRouter();
  const {
    state,
    answerLearning,
    goBackLearning,
    submitFreeText,
    runPrediction,
    startPredictionPhase,
    answerPrediction,
    finalize,
    restart,
  } = useGame();

  // Fire the single AI call as soon as the transition starts.
  useEffect(() => {
    if (state.phase === "transition") void runPrediction();
  }, [state.phase, runPrediction]);

  // Persist final answers, then reveal the result.
  useEffect(() => {
    if (state.phase !== "computing") return;
    const t = setTimeout(() => void finalize(), 1400);
    return () => clearTimeout(t);
  }, [state.phase, finalize]);

  const learningQ = LEARNING_QUESTIONS[state.learningIndex];
  const predictionQ = PREDICTION_QUESTIONS[state.roundIndex];

  return (
    <GameShell>
      <AnimatePresence mode="wait">
        {state.phase === "learning" && learningQ?.kind === "choice" && (
          <motion.div
            key={`learning-${learningQ.id}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <LearningQuestion
              question={learningQ}
              index={state.learningIndex}
              total={LEARNING_QUESTIONS.length}
              previousAnswer={state.learningAnswers[learningQ.id]}
              onAnswer={(key: OptionKey) => answerLearning(learningQ.id, key)}
              onBack={() =>
                state.learningIndex === 0 ? router.push("/") : goBackLearning()
              }
            />
          </motion.div>
        )}

        {state.phase === "learning" && learningQ?.kind === "freetext" && (
          <motion.div
            key="learning-q6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <FreeTextQuestion
              question={learningQ}
              index={state.learningIndex}
              total={LEARNING_QUESTIONS.length}
              initialValue={state.freeText}
              onSubmit={submitFreeText}
              onBack={goBackLearning}
            />
          </motion.div>
        )}

        {state.phase === "transition" && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <TrainingTransition onContinue={startPredictionPhase} />
            {state.error && (
              <div className="absolute inset-x-6 bottom-28 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-center">
                <p className="text-[13px] text-zinc-400">连接有点慢，再试一次。</p>
                <button
                  type="button"
                  onClick={() => void runPrediction()}
                  className="mt-2 min-h-[44px] rounded-full border border-zinc-600 px-6 text-[13px] text-zinc-200"
                >
                  重试
                </button>
              </div>
            )}
          </motion.div>
        )}

        {state.phase === "prediction" && state.prediction && predictionQ && (
          <motion.div
            key={`prediction-${predictionQ.id}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <PredictionQuestion
              question={predictionQ}
              roundIndex={state.roundIndex}
              total={PREDICTION_QUESTIONS.length}
              kimiPick={state.prediction.predictions[predictionQ.id]}
              kimiReasoning={state.prediction.reasoning[predictionQ.id] ?? ""}
              kimiScore={state.kimiScore}
              humanScore={state.humanScore}
              onResult={(pick, match) => answerPrediction(predictionQ.id, pick, match)}
            />
          </motion.div>
        )}

        {state.phase === "prediction" && !state.prediction && (
          <motion.div
            key="waiting-prediction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full items-center justify-center"
          >
            <span className="breathe text-[11px] tracking-[0.35em] text-zinc-500 uppercase">
              Kimi is thinking…
            </span>
          </motion.div>
        )}

        {state.phase === "computing" && (
          <motion.div
            key="computing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="scanline relative flex h-full items-center justify-center"
          >
            <span className="breathe text-[11px] tracking-[0.4em] text-zinc-500 uppercase">
              Comparing…
            </span>
          </motion.div>
        )}

        {state.phase === "result" && state.prediction && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="h-full"
          >
            <ResultCard
              prediction={state.prediction}
              score={state.kimiScore}
              learningAnswers={state.learningAnswers}
              freeText={state.freeText}
              challengeUrl={loadSession().challengeId}
              onCreateChallenge={async () => {
                const id = await createChallenge(state.prediction!.sessionId);
                const s = loadSession();
                s.challengeId = `${window.location.origin}/challenge/${id}`;
                const { saveSession } = await import("@/lib/storage");
                saveSession(s);
                return id;
              }}
              onRestart={restart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
