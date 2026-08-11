"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { BoardEntry } from "@/lib/types";
import Leaderboard from "./Leaderboard";
import { track } from "@/lib/analytics";

interface Props {
  kimiScore: number;
  friendScore: number;
  knownDuration: string;
  board?: BoardEntry[];
  yourRank?: number;
  onRetry: () => void;
}

/** Final duel settlement. */
export default function ChallengeResult({ kimiScore, friendScore, knownDuration, board, yourRank, onRetry }: Props) {
  const router = useRouter();
  const friendWins = friendScore > kimiScore;
  const tie = friendScore === kimiScore;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col px-8 pt-14 pb-12">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-[10px] tracking-[0.4em] text-zinc-500 uppercase"
      >
        Final Score
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
        className="mt-10 text-center"
      >
        <p className="text-[44px] font-bold text-zinc-50 tabular-nums">
          {friendWins || tie ? "YOU" : "KIMI"} {Math.max(friendScore, kimiScore)}{" "}
          <span className="text-zinc-600">:</span> {Math.min(friendScore, kimiScore)}{" "}
          {friendWins || tie ? "KIMI" : "YOU"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center text-[14px] leading-relaxed text-zinc-400"
      >
        {friendWins ? (
          <>
            <p className="text-[18px] font-semibold text-zinc-50">人类友情保卫成功。</p>
            <p className="mt-3">
              至少今天，
              <br />
              AI 还没取代你。
            </p>
          </>
        ) : tie ? (
          <>
            <p className="text-[18px] font-semibold text-zinc-50">平手。</p>
            <p className="mt-3">
              你和 Kimi 打了个平手。
              <br />
              这已经有点危险了。
            </p>
          </>
        ) : (
          <>
            <p>你认识 TA {knownDuration || "这么久"}。</p>
            <p>Kimi 认识 TA 6 道题。</p>
            <p className="mt-3 text-[18px] font-semibold text-zinc-50">解释一下？</p>
          </>
        )}
      </motion.div>

      {board && board.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-8"
        >
          <Leaderboard board={board} yourRank={yourRank} />
          {yourRank !== undefined && yourRank > 0 && (
            <p className="mt-3 text-center text-[12px] text-zinc-500">
              你目前排在第 <span className="font-semibold text-zinc-50">{yourRank}</span> 名
              {yourRank === 1 ? "，最懂 TA 的人就是你" : ""}
            </p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-auto space-y-3 pt-8"
      >
        <button
          type="button"
          onClick={() => {
            track("friend_start_own_test");
            router.push("/");
          }}
          className="min-h-[56px] w-full rounded-full bg-zinc-50 text-[16px] font-medium text-zinc-950"
        >
          让 Kimi 也来认识我 →
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[48px] w-full text-[13px] tracking-widest text-zinc-500 uppercase"
        >
          重新挑战
        </button>
      </motion.div>
      </div>
    </div>
  );
}
