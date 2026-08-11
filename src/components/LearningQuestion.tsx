"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { OptionKey, Question } from "@/lib/types";
import Progress from "./Progress";
import QuestionCard from "./QuestionCard";
import OptionButton from "./OptionButton";
import BackButton from "./BackButton";
import { track } from "@/lib/analytics";

interface Props {
  question: Question;
  index: number; // 0-based within learning phase
  total: number;
  previousAnswer?: OptionKey; // pre-highlight when the user went back
  onAnswer: (key: OptionKey) => void;
  onBack: () => void;
}

/**
 * Learning phase question (Q1–Q5 choice type).
 * No explanations after answering — just "Signal captured." then advance.
 * Q3 additionally supports swipe-right-to-choose (tap always works).
 */
export default function LearningQuestion({ question, index, total, previousAnswer, onAnswer, onBack }: Props) {
  const [captured, setCaptured] = useState<OptionKey | null>(null);

  const handle = (key: OptionKey) => {
    if (captured) return;
    setCaptured(key);
    track("learning_question_answered", { id: question.id, answer: key });
    setTimeout(() => onAnswer(key), 620);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col">
        <BackButton onBack={onBack} />
        <Progress label="LEARNING" current={index + 1} total={total} />

        <div className="flex flex-1 flex-col justify-between px-6 pt-8 pb-8">
        <QuestionCard question={question} />

        <div className="relative mt-8">
          <AnimatePresence mode="wait">
            {captured ? (
              <motion.div
                key="captured"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-[52px] items-center justify-center"
              >
                <span className="text-[11px] tracking-[0.35em] text-zinc-500 uppercase">
                  Signal captured.
                </span>
              </motion.div>
            ) : (
              <motion.div key="options" exit={{ opacity: 0 }} className="space-y-3">
                {question.options?.map((opt, i) =>
                  question.swipeHint ? (
                    <motion.div
                      key={opt.key}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(_e, info) => {
                        if (info.offset.x > 72) handle(opt.key);
                      }}
                    >
                      <OptionButton
                        optionKey={opt.key}
                        text={opt.text}
                        index={i}
                        selected={previousAnswer === opt.key}
                        onSelect={handle}
                      />
                    </motion.div>
                  ) : (
                    <OptionButton
                      key={opt.key}
                      optionKey={opt.key}
                      text={opt.text}
                      index={i}
                      selected={previousAnswer === opt.key}
                      onSelect={handle}
                    />
                  )
                )}
                {question.swipeHint && (
                  <p className="pt-1 text-center text-[10px] tracking-[0.25em] text-zinc-600 uppercase">
                    点选，或向右滑动确认 →
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </div>
  );
}
