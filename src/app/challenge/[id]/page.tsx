"use client";

import { use, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameShell from "@/components/GameShell";
import ChallengeIntro from "@/components/ChallengeIntro";
import ChallengeGame from "@/components/ChallengeGame";
import ChallengeResult from "@/components/ChallengeResult";
import type { ChallengePublic, OptionKey } from "@/lib/types";
import { track } from "@/lib/analytics";

type Stage = "loading" | "intro" | "game" | "result" | "error";

/**
 * /challenge/[id] — friend-facing viral loop.
 * 0 AI calls. Friend answers blind, server settles Kimi vs Friend.
 */
export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stage, setStage] = useState<Stage>("loading");
  const [challenge, setChallenge] = useState<ChallengePublic | null>(null);
  const [knownDuration, setKnownDuration] = useState("");
  const [nickname, setNickname] = useState("");
  const [result, setResult] = useState<{
    kimi_score: number;
    friend_score: number;
    board?: ChallengePublic["board"];
    your_rank?: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/challenge/${id}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as ChallengePublic;
      setChallenge(data);
      // Links are reusable — every visitor starts at the intro and plays
      // their own round, even if friends already completed theirs.
      setStage("intro");
    } catch {
      setStage("error");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (answers: Record<string, OptionKey>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/challenge/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, knownDuration, nickname }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as {
        kimi_score: number;
        friend_score: number;
        board?: ChallengePublic["board"];
        your_rank?: number;
      };
      setResult(data);
      track("challenge_complete", { id, kimi: data.kimi_score, friend: data.friend_score });
      setStage("result");
    } catch {
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GameShell>
      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            className="flex h-full items-center justify-center"
          >
            <span className="breathe text-[11px] tracking-[0.4em] text-zinc-500 uppercase">
              Loading…
            </span>
          </motion.div>
        )}

        {stage === "intro" && challenge && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            <ChallengeIntro
              challenge={challenge}
              onStart={(d, n) => {
                setKnownDuration(d);
                setNickname(n);
                setStage("game");
              }}
            />
          </motion.div>
        )}

        {stage === "game" && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            <ChallengeGame onComplete={submit} submitting={submitting} />
          </motion.div>
        )}

        {stage === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <ChallengeResult
              kimiScore={result.kimi_score}
              friendScore={result.friend_score}
              knownDuration={knownDuration}
              board={result.board}
              yourRank={result.your_rank}
              onRetry={() => setStage("game")}
            />
          </motion.div>
        )}

        {stage === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col items-center justify-center px-8 text-center">
            <p className="text-[16px] text-zinc-300">这个挑战不存在，或已经失效。</p>
            <button
              type="button"
              onClick={() => {
                track("friend_start_own_test");
                window.location.href = "/";
              }}
              className="mt-6 min-h-[52px] w-full rounded-full bg-zinc-50 text-[15px] font-medium text-zinc-950"
            >
              生成我自己的分身 →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
