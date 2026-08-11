"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChallengePublic } from "@/lib/types";
import Leaderboard from "./Leaderboard";

/**
 * Owner's live view of their challenge link: friends' scores appear here
 * in near-real time (15s poll + refresh on window focus).
 */
export default function OwnerBoard({ challengeUrl }: { challengeUrl: string }) {
  const id = challengeUrl.split("/").filter(Boolean).pop();
  const [data, setData] = useState<ChallengePublic | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/challenge/${id}`, { cache: "no-store" });
      if (res.ok) setData((await res.json()) as ChallengePublic);
    } catch {
      /* keep stale data — transient network issues must not blank the board */
    }
  }, [id]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 15_000);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const count = data?.attempt_count ?? 0;

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
          朋友战绩 · 实时
        </p>
        <span className="text-[11px] text-zinc-600 tabular-nums">{count} 人已玩</span>
      </div>
      {data && data.board.length > 0 ? (
        <Leaderboard board={data.board} title="谁最懂你" />
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-800 px-4 py-5 text-center text-[12px] leading-relaxed text-zinc-600">
          还没有朋友玩。把链接发出去，
          <br />
          他们的成绩会自动出现在这里。
        </p>
      )}
    </div>
  );
}
