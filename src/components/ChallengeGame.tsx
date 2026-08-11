"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { OptionKey } from "@/lib/types";
import { PREDICTION_QUESTIONS } from "@/lib/questions";
import Progress from "./Progress";
import QuestionCard from "./QuestionCard";
import OptionButton from "./OptionButton";

interface Props {
  onComplete: (answers: Record<string, OptionKey>) => void;
  submitting: boolean;
}

/**
 * Friend answers the SAME Q7–Q10, blind.
 * Friend can never see the owner's answers or Kimi's predictions here.
 */
export default function ChallengeGame({ onComplete, submitting }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [picked, setPicked] = useState<OptionKey | null>(null);

  const raw = PREDICTION_QUESTIONS[index];
  const last = index === PREDICTION_QUESTIONS.length - 1;

  // Friend guesses the OWNER's behavior — third person, never "你"
  const q = {
    ...raw,
    scenario: raw.scenario.map((line) => line.replace(/你/g, "TA")),
    prompt: raw.prompt.replace(/你/g, "TA"),
  };

  const handle = (key: OptionKey) => {
    if (picked || submitting) return;
    setPicked(key);
    const next = { ...answers, [raw.id]: key };
    setAnswers(next);
    setTimeout(() => {
      setPicked(null);
      if (last) onComplete(next);
      else setIndex(index + 1);
    }, 500);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col">
        <Progress label="YOU vs KIMI" current={index + 1} total={PREDICTION_QUESTIONS.length} />
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="flex flex-1 flex-col justify-between px-6 pt-10 pb-8"
        >
          <div>
            <p className="mb-4 text-[11px] tracking-[0.25em] text-zinc-600 uppercase">
              TA 会怎么选？
            </p>
            <QuestionCard question={q} />
          </div>
          <div className="mt-8 space-y-3">
            {q.options?.map((opt, i) => (
              <OptionButton
                key={opt.key}
                optionKey={opt.key}
                text={opt.text}
                index={i}
                disabled={submitting}
                selected={picked === opt.key}
                onSelect={handle}
              />
            ))}
            {submitting && (
              <p className="breathe pt-2 text-center text-[11px] tracking-[0.35em] text-zinc-500 uppercase">
                Revealing…
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
