"use client";

import { motion } from "framer-motion";
import type { OptionKey } from "@/lib/types";
import { vibratePress } from "@/lib/vibrate";

interface Props {
  optionKey: OptionKey;
  text: string;
  index: number;
  disabled?: boolean;
  selected?: boolean;
  /** reveal state for prediction rounds */
  reveal?: "kimi" | "human" | "both" | "none" | null;
  onSelect?: (key: OptionKey) => void;
}

/**
 * Minimal option button. Tap always works; swipe affordance is layered
 * on top by the parent where needed (Q3).
 */
export default function OptionButton({
  optionKey,
  text,
  index,
  disabled,
  selected,
  reveal,
  onSelect,
}: Props) {
  let border = "border-zinc-800";
  let bg = "bg-transparent";
  let textColor = "text-zinc-200";

  if (reveal === "both") {
    border = "border-zinc-50";
    bg = "bg-zinc-50";
    textColor = "text-zinc-950";
  } else if (reveal === "kimi") {
    border = "border-zinc-400";
    bg = "bg-zinc-900";
  } else if (reveal === "human") {
    border = "border-zinc-600";
    bg = "bg-zinc-900";
  } else if (selected) {
    border = "border-zinc-50";
    bg = "bg-zinc-50";
    textColor = "text-zinc-950";
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.3 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      disabled={disabled}
      onClick={() => {
        vibratePress();
        onSelect?.(optionKey);
      }}
      className={`flex min-h-[52px] w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${border} ${bg} ${textColor} ${
        disabled ? "cursor-default opacity-60" : "cursor-pointer"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
          reveal === "both" || selected ? "border-zinc-950" : "border-zinc-600"
        }`}
      >
        {optionKey}
      </span>
      <span className="text-[15px] leading-snug">{text}</span>
      {reveal === "both" && (
        <span className="ml-auto text-[10px] tracking-widest">KIMI · YOU</span>
      )}
      {reveal === "kimi" && (
        <span className="ml-auto text-[10px] tracking-widest text-zinc-400">KIMI</span>
      )}
      {reveal === "human" && (
        <span className="ml-auto text-[10px] tracking-widest text-zinc-400">YOU</span>
      )}
    </motion.button>
  );
}
