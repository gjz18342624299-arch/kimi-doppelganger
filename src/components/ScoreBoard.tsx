"use client";

import { motion } from "framer-motion";

/** Live duel score: KIMI x : y HUMAN */
export default function ScoreBoard({ kimi, human }: { kimi: number; human: number }) {
  return (
    <div className="flex items-center justify-center gap-3 text-[12px] tracking-[0.25em] text-zinc-500 uppercase">
      <span>Kimi</span>
      <motion.span
        key={kimi}
        initial={{ scale: 1.4, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-[16px] font-semibold text-zinc-50 tabular-nums"
      >
        {kimi}
      </motion.span>
      <span className="text-zinc-700">:</span>
      <motion.span
        key={human}
        initial={{ scale: 1.4, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-[16px] font-semibold text-zinc-50 tabular-nums"
      >
        {human}
      </motion.span>
      <span>Human</span>
    </div>
  );
}
