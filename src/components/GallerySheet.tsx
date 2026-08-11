"use client";

import { motion } from "framer-motion";
import type { PersonalityTypeId } from "@/lib/types";
import { PERSONALITY_TYPES, TYPE_IDS } from "@/lib/personalityTypes";
import TypeSigil from "./TypeSigil";

interface Props {
  /** the type unlocked in this session (null when CLONING FAILED) */
  unlockedType: PersonalityTypeId | null;
  /** true when score <= 1 — the hidden HUMAN state was reached */
  humanUnlocked: boolean;
  onClose: () => void;
}

/**
 * 人格图鉴 — full-screen overlay.
 * Unlocked types are lit; locked ones show only a silhouette.
 * No capture/trade mechanics — pure collection curiosity.
 */
export default function GallerySheet({ unlockedType, humanUnlocked, onClose }: Props) {
  const unlockedCount = (unlockedType ? 1 : 0) + (humanUnlocked ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex flex-col bg-zinc-950"
    >
      <div className="flex items-center justify-between px-6 pt-8">
        <div>
          <p className="text-[10px] tracking-[0.35em] text-zinc-500 uppercase">Collection</p>
          <h3 className="mt-1 text-[20px] font-semibold text-zinc-50">人格图鉴</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-zinc-500 tabular-nums">
            已解锁 {unlockedCount} / 8
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[13px] text-zinc-400"
          >
            关闭
          </button>
        </div>
      </div>

      <div className="mt-6 grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto px-6 pb-10">
        {TYPE_IDS.map((id, i) => {
          const t = PERSONALITY_TYPES[id];
          const unlocked = id === unlockedType;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border px-4 py-5 text-center ${
                unlocked ? "border-zinc-600 bg-zinc-900/70" : "border-zinc-900 bg-zinc-950"
              }`}
            >
              <div className={`flex justify-center ${unlocked ? "" : "opacity-15 grayscale"}`}>
                <TypeSigil type={id} size={64} />
              </div>
              <p
                className={`mt-3 text-[10px] tracking-[0.35em] uppercase ${
                  unlocked ? "text-zinc-500" : "text-zinc-700"
                }`}
              >
                {t.id}
              </p>
              <p
                className={`mt-1 text-[20px] font-bold tracking-wide ${
                  unlocked ? "text-zinc-50" : "text-zinc-600"
                }`}
              >
                {unlocked ? t.nameZh : "？？？"}
              </p>
              <p className={`mt-1 text-[11px] leading-snug ${unlocked ? "text-zinc-400" : "text-zinc-700"}`}>
                {unlocked ? t.subtitle : "未解锁"}
              </p>
              {unlocked && (
                <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">{t.observation}</p>
              )}
              {unlocked && (
                <p className="mt-2 text-[9px] tracking-[0.3em] text-zinc-500 uppercase">Unlocked</p>
              )}
            </motion.div>
          );
        })}

        {/* hidden HUMAN card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: TYPE_IDS.length * 0.05 }}
          className={`rounded-2xl border px-4 py-5 text-center ${
            humanUnlocked ? "border-zinc-600 bg-zinc-900/70" : "border-dashed border-zinc-900 bg-zinc-950"
          }`}
        >
          <div className={`flex justify-center ${humanUnlocked ? "" : "opacity-15 grayscale"}`}>
            <TypeSigil type="HUMAN" size={64} />
          </div>
          <p
            className={`mt-3 text-[10px] tracking-[0.35em] uppercase ${
              humanUnlocked ? "text-zinc-500" : "text-zinc-700"
            }`}
          >
            HUMAN
          </p>
          <p
            className={`mt-1 text-[20px] font-bold tracking-wide ${
              humanUnlocked ? "text-zinc-50" : "text-zinc-600"
            }`}
          >
            {humanUnlocked ? "人类" : "？？？"}
          </p>
          <p className={`mt-1 text-[11px] leading-snug ${humanUnlocked ? "text-zinc-400" : "text-zinc-700"}`}>
            {humanUnlocked ? "克隆失败 · 你目前仍然不可预测" : "隐藏人格 · 未解锁"}
          </p>
          {humanUnlocked && (
            <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
              Kimi 暂时没有找到你的稳定模式。恭喜，你目前仍然不可预测。
            </p>
          )}
        </motion.div>
      </div>

      <p className="px-6 pb-8 text-center text-[11px] leading-relaxed text-zinc-600">
        每一次克隆只会解锁一种人格。
        <br />
        剩下的 7 种，藏在别人的结果页里。
      </p>
    </motion.div>
  );
}
