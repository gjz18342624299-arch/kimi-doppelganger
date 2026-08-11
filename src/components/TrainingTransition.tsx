"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onContinue: () => void;
}

const LINES = [
  "够了。",
  "我觉得我已经有点认识你了。",
  "接下来四道题，你先别选。",
];

/**
 * The pivotal transition: fade to black → scan → TRAINING COMPLETE →
 * Kimi speaks, line by line → 我先猜 → CTA.
 */
export default function TrainingTransition({ onContinue }: Props) {
  const [step, setStep] = useState(0); // 0 = black/scan, 1 = title, 2+ = lines, final = 我先猜 + CTA

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1400),
      setTimeout(() => setStep(2), 2400),
      setTimeout(() => setStep(3), 3600),
      setTimeout(() => setStep(4), 4800),
      setTimeout(() => setStep(5), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="scanline relative flex h-full flex-col items-center justify-center bg-black px-8">
      {step >= 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-24 text-center"
        >
          <p className="text-[11px] tracking-[0.5em] text-zinc-500 uppercase">Training</p>
          <p className="mt-1 text-[11px] tracking-[0.5em] text-zinc-500 uppercase">Complete</p>
        </motion.div>
      )}

      <div className="w-full max-w-[300px] space-y-5">
        {step >= 2 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[13px] text-zinc-500"
          >
            Kimi：
          </motion.p>
        )}
        {LINES.slice(0, Math.max(0, step - 2)).map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={
              i === 0
                ? "text-[22px] font-semibold text-zinc-50"
                : "text-[17px] leading-relaxed text-zinc-300"
            }
          >
            {line}
          </motion.p>
        ))}
        {step >= 5 && (
          <motion.p
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="pt-2 text-[34px] font-bold text-zinc-50"
          >
            我先猜。
          </motion.p>
        )}
      </div>

      {step >= 5 && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={onContinue}
          className="absolute bottom-12 min-h-[52px] w-[calc(100%-4rem)] max-w-[340px] rounded-full bg-zinc-50 text-[15px] font-medium text-zinc-950"
        >
          开始验证 →
        </motion.button>
      )}
    </div>
  );
}
