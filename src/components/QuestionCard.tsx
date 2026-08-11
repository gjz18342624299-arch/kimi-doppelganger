"use client";

import { motion } from "framer-motion";
import type { Question } from "@/lib/types";

/** Dark card presenting the scenario + prompt of a question. */
export default function QuestionCard({ question }: { question: Question }) {
  return (
    <div>
      {question.scenario.length > 0 && (
        <div className="space-y-1.5">
          {question.scenario.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.35 }}
              className="text-[15px] leading-relaxed text-zinc-400"
            >
              {line}
            </motion.p>
          ))}
        </div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: question.scenario.length * 0.12 + 0.05, duration: 0.4 }}
        className="mt-5 text-[26px] leading-snug font-semibold text-zinc-50"
      >
        {question.prompt}
      </motion.h2>
    </div>
  );
}
