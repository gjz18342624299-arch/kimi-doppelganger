"use client";

import type { BoardEntry } from "@/lib/types";

interface Props {
  board: BoardEntry[];
  /** 1-based rank of the current player — that row gets highlighted */
  yourRank?: number;
  /** how many rows to show (intro preview vs full result view) */
  limit?: number;
  /** section title — "谁最懂 TA" for friends, "谁最懂你" for the owner */
  title?: string;
}

/**
 * Public leaderboard for a challenge link.
 * Rows are answers-free — only nickname / how-long-known / score.
 */
export default function Leaderboard({ board, yourRank, limit, title = "谁最懂 TA" }: Props) {
  const rows = limit ? board.slice(0, limit) : board;
  if (rows.length === 0) return null;

  return (
    <div className="w-full">
      <p className="text-center text-[10px] tracking-[0.3em] text-zinc-600 uppercase">
        {title}
      </p>
      <div className="mt-3 space-y-1.5">
        {rows.map((e, i) => {
          const mine = yourRank === i + 1;
          return (
            <div
              key={`${e.created_at}-${i}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] ${
                mine ? "bg-zinc-50 font-medium text-zinc-950" : "text-zinc-400"
              }`}
            >
              <span className="w-5 shrink-0 tabular-nums">{i + 1}</span>
              <span className="flex-1 truncate">
                {e.nickname || "匿名朋友"}
                {e.known_duration && (
                  <span className="text-zinc-600"> · 认识 {e.known_duration}</span>
                )}
                {mine && "（你）"}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{e.score}/4</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
