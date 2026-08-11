"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ChallengePublic } from "@/lib/types";
import { PERSONALITY_TYPES } from "@/lib/personalityTypes";
import Leaderboard from "./Leaderboard";
import { track } from "@/lib/analytics";

interface Props {
  challenge: ChallengePublic;
  onStart: (knownDuration: string, nickname: string) => void;
}

/** KIMI VS YOU — challenge intro. No login, no download. */
export default function ChallengeIntro({ challenge, onStart }: Props) {
  const [duration, setDuration] = useState("");
  const [nickname, setNickname] = useState("");
  const type = PERSONALITY_TYPES[challenge.owner_type];

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col px-8 pt-14 pb-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase">Kimi vs You</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 text-center"
      >
        <p className="text-[14px] text-zinc-400">Kimi 只认识 TA：</p>
        <p className="mt-2 text-[40px] font-bold text-zinc-50">6 道题</p>
        <p className="mt-5 text-[14px] text-zinc-400">它猜中了：</p>
        <p className="mt-2 text-[40px] font-bold text-zinc-50 tabular-nums">
          {challenge.owner_score} / 4
        </p>
        <p className="mt-5 text-[12px] tracking-widest text-zinc-600 uppercase">
          TA 的分身 · {type.nameZh} {type.id} — {type.subtitle}
        </p>
      </motion.div>

      {challenge.board.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Leaderboard board={challenge.board} limit={5} />
          {challenge.attempt_count > 5 && (
            <p className="mt-2 text-center text-[11px] text-zinc-600">
              共 {challenge.attempt_count} 位朋友挑战过
            </p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 space-y-6"
      >
        <div>
          <p className="text-center text-[14px] text-zinc-400">
            你的名字：<span className="text-zinc-600">（上榜用，可匿）</span>
          </p>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 12))}
            placeholder="匿名朋友"
            className="mt-3 w-full border-b border-zinc-800 bg-transparent pb-3 text-center text-[17px] text-zinc-50 placeholder-zinc-700 outline-none focus:border-zinc-400"
          />
        </div>
        <div>
          <p className="text-center text-[14px] text-zinc-400">
            你认识 TA：<span className="text-zinc-50">多久？</span>
          </p>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value.slice(0, 20))}
            placeholder="比如 4 年（可不填）"
            className="mt-3 w-full border-b border-zinc-800 bg-transparent pb-3 text-center text-[17px] text-zinc-50 placeholder-zinc-700 outline-none focus:border-zinc-400"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-auto pt-8"
      >
        <button
          type="button"
          onClick={() => {
            track("challenge_open", { id: challenge.challenge_id });
            onStart(duration.trim(), nickname.trim());
          }}
          className="min-h-[56px] w-full rounded-full bg-zinc-50 text-[16px] font-medium text-zinc-950"
        >
          挑战 Kimi →
        </button>
        <p className="mt-4 text-center text-[10px] tracking-[0.25em] text-zinc-600 uppercase">
          猜猜 TA 会怎么选 · 4 题
        </p>
      </motion.div>
      </div>
    </div>
  );
}
