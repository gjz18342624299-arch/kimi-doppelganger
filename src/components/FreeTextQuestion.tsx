"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/lib/types";
import Progress from "./Progress";
import BackButton from "./BackButton";
import { track } from "@/lib/analytics";

interface Props {
  question: Question;
  index: number;
  total: number;
  initialValue?: string;
  onSubmit: (text: string) => void;
  onBack: () => void;
}

/**
 * Q6 — the only free-input question.
 * The page goes quieter: no options, generous whitespace, one input.
 */
export default function FreeTextQuestion({ question, index, total, initialValue, onSubmit, onBack }: Props) {
  const [text, setText] = useState(initialValue ?? "");
  const max = question.maxLength ?? 40;

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    track("learning_question_answered", { id: question.id, free: true });
    onSubmit(v);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col">
        <BackButton onBack={onBack} />
        <Progress label="LEARNING" current={index + 1} total={total} />

        <div className="flex flex-1 flex-col px-6 pt-12 pb-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[13px] tracking-wide text-zinc-500"
        >
          最后，给我一句真正属于你的话。
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-4 text-[26px] leading-snug font-semibold text-zinc-50"
        >
          {question.prompt}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, max))}
            placeholder={question.placeholder}
            maxLength={max}
            autoFocus
            enterKeyHint="send"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full border-b border-zinc-800 bg-transparent pt-1 pb-3 text-[19px] text-zinc-50 placeholder-zinc-700 outline-none focus:border-zinc-400"
          />
          <div className="mt-2 flex justify-end">
            <span className="text-[10px] tracking-widest text-zinc-600 tabular-nums">
              {text.length} / {max}
            </span>
          </div>
        </motion.div>

        <div className="mt-auto">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={submit}
            disabled={!text.trim()}
            className="min-h-[52px] w-full rounded-full bg-zinc-50 text-[15px] font-medium text-zinc-950 transition-opacity disabled:opacity-30"
          >
            交给 Kimi →
          </motion.button>
        </div>
        </div>
      </div>
    </div>
  );
}
