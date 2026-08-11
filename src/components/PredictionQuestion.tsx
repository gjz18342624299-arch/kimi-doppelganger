"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { OptionKey, Question } from "@/lib/types";
import Progress from "./Progress";
import QuestionCard from "./QuestionCard";
import OptionButton from "./OptionButton";
import ScoreBoard from "./ScoreBoard";
import { MATCH_COMMENTS, MISS_COMMENTS, pickComment } from "@/lib/comments";
import { vibrateMatch, vibrateMiss } from "@/lib/vibrate";
import { track } from "@/lib/analytics";

interface Props {
  question: Question;
  roundIndex: number; // 0-3
  total: number;
  kimiPick: OptionKey; // blind prediction, generated before user answered
  kimiReasoning: string; // why Kimi picked it — shown at reveal
  kimiScore: number;
  humanScore: number;
  onResult: (userPick: OptionKey, match: boolean) => void;
}

type Stage = "thinking" | "locked" | "revealed";

/**
 * Prediction round: question appears, options disabled → KIMI IS THINKING →
 * KIMI LOCKED IN → user picks → simultaneous reveal → MATCH / MISS.
 */
export default function PredictionQuestion({
  question,
  roundIndex,
  total,
  kimiPick,
  kimiReasoning,
  kimiScore,
  humanScore,
  onResult,
}: Props) {
  const [stage, setStage] = useState<Stage>("thinking");
  const [userPick, setUserPick] = useState<OptionKey | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setStage("locked");
      track("prediction_locked", { id: question.id });
    }, 1300);
    return () => clearTimeout(t);
  }, [question.id]);

  const match = userPick !== null && userPick === kimiPick;
  const comment = useMemo(
    () =>
      pickComment(match ? MATCH_COMMENTS : MISS_COMMENTS, roundIndex * 7 + (userPick?.charCodeAt(0) ?? 0)),
    [match, roundIndex, userPick]
  );

  const handlePick = (key: OptionKey) => {
    if (stage !== "locked" || userPick) return;
    setUserPick(key);
    setStage("revealed");
    const isMatch = key === kimiPick;
    if (isMatch) vibrateMatch();
    else vibrateMiss();
    track("prediction_answered", { id: question.id, answer: key, kimi: kimiPick });
    if (isMatch) track("prediction_match", { id: question.id });
  };

  const revealFor = (key: OptionKey): "kimi" | "human" | "both" | "none" | null => {
    if (stage !== "revealed") return null;
    const isKimi = key === kimiPick;
    const isHuman = key === userPick;
    if (isKimi && isHuman) return "both";
    if (isKimi) return "kimi";
    if (isHuman) return "human";
    return "none";
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col">
        <Progress label="PREDICTION" current={roundIndex + 1} total={total} />
        <div className="mt-4">
          <ScoreBoard kimi={kimiScore} human={humanScore} />
        </div>

      <div className="flex flex-1 flex-col justify-between px-6 pt-8 pb-8">
        <QuestionCard question={question} />

        <div className="mt-6 space-y-3">
          {question.options?.map((opt, i) => (
            <OptionButton
              key={opt.key}
              optionKey={opt.key}
              text={opt.text}
              index={i}
              disabled={stage !== "locked" || userPick !== null}
              reveal={revealFor(opt.key)}
              onSelect={handlePick}
            />
          ))}
        </div>

        <div className="mt-4 flex min-h-[120px] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage === "thinking" && (
              <motion.div
                key="thinking"
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="breathe h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-[11px] tracking-[0.35em] text-zinc-500 uppercase">
                  Kimi is thinking…
                </span>
              </motion.div>
            )}
            {stage === "locked" && (
              <motion.div
                key="locked"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-[13px] tracking-[0.3em] text-zinc-50 uppercase">
                  🔒 Kimi locked in
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">它已经选择了答案。现在，你选。</p>
              </motion.div>
            )}
            {stage === "revealed" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="text-center"
              >
                <p
                  className={`text-[30px] font-bold tracking-wide ${
                    match ? "text-zinc-50" : "text-zinc-400"
                  }`}
                >
                  {match ? "MATCH." : "MISS."}
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-1"
                >
                  <p className="text-[13px] text-zinc-500">Kimi：「{comment}」</p>
                  <p className="mx-auto mt-2 max-w-[300px] text-[12px] leading-relaxed text-zinc-600">
                    它选 {kimiPick} 的理由：{kimiReasoning}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {stage === "revealed" && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={() => userPick && onResult(userPick, match)}
              className="mt-4 min-h-[48px] w-full rounded-full bg-zinc-50 text-[14px] font-medium text-zinc-950"
            >
              {roundIndex + 1 === total ? "查看结果 →" : "下一题 →"}
            </motion.button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
