"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LearningAnswers, PredictResponse } from "@/lib/types";
import { PERSONALITY_TYPES } from "@/lib/personalityTypes";
import { copyText } from "@/lib/clipboard";
import { track } from "@/lib/analytics";
import ShareCard from "./ShareCard";
import GallerySheet from "./GallerySheet";
import TypeSigil from "./TypeSigil";
import UnlockSheet from "./UnlockSheet";
import OwnerBoard from "./OwnerBoard";

interface Props {
  prediction: PredictResponse;
  score: number;
  learningAnswers: LearningAnswers;
  freeText: string;
  challengeUrl: string | null;
  onCreateChallenge: () => Promise<string>;
  onRestart: () => void;
}

/**
 * Result page. Longitudinal scroll allowed.
 * Score <= 1 → CLONING FAILED. Score == 4 → 你不是 AI 吗？
 */
export default function ResultCard({
  prediction,
  score,
  learningAnswers,
  freeText,
  challengeUrl,
  onCreateChallenge,
  onRestart,
}: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(challengeUrl);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualLink, setManualLink] = useState<string | null>(null);

  const type = PERSONALITY_TYPES[prediction.type];

  const ensureUrl = async (): Promise<string> => {
    if (shareUrl) return shareUrl;
    setCreating(true);
    try {
      const id = await onCreateChallenge();
      const url = `${window.location.origin}/challenge/${id}`;
      setShareUrl(url);
      return url;
    } finally {
      setCreating(false);
    }
  };

  const handleChallenge = async () => {
    track("result_share_click", { kind: "challenge" });
    const url = await ensureUrl();
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setManualLink(null);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // WebView / http://LAN — clipboard blocked; show selectable link box
      setManualLink(url);
    }
  };

  const handleShareCard = async () => {
    track("result_share_click", { kind: "card" });
    await ensureUrl();
    setShareOpen(true);
  };

  const hiddenFail = score <= 1;
  const hiddenPerfect = score === 4;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex min-h-full flex-col px-6 pt-14 pb-10">
        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase">
            Kimi Prediction Score
          </p>
          <p className="mt-4 text-[84px] leading-none font-bold text-zinc-50 tabular-nums">
            {score} <span className="text-[34px] text-zinc-600">/ 4</span>
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
            它只用了 6 道题认识你。
            <br />
            然后猜中了你 4 次选择中的 {score} 次。
          </p>
        </motion.div>

        <div className="my-10 h-px bg-zinc-900" />

        {/* Hidden results */}
        {hiddenFail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase">Human</p>
            <div className="mt-5 flex justify-center">
              <TypeSigil type="HUMAN" size={96} />
            </div>
            <p className="mt-4 text-[56px] leading-none font-bold text-zinc-50">人类</p>
            <p className="mt-2 text-[16px] tracking-wide text-zinc-500">克隆失败。</p>
            <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
              Kimi 暂时没有找到你的稳定模式。
              <br />
              恭喜。
              <br />
              <span className="text-zinc-50">你目前仍然不可预测。</span>
            </p>
          </motion.div>
        )}
        {hiddenPerfect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase">Kimi</p>
            <p className="mt-3 text-[48px] leading-none font-bold text-zinc-50">异常。</p>
            <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
              你确定：
              <br />
              <span className="text-[16px] text-zinc-50">你不是 AI 吗？</span>
            </p>
          </motion.div>
        )}

        {/* Personality identity — hidden when CLONING FAILED */}
        {!hiddenFail && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase">
              Kimi Doppelgänger
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <TypeSigil type={type.id} size={104} />
            </motion.div>
            <p className="mt-4 text-[11px] tracking-[0.5em] text-zinc-500 uppercase">{type.id}</p>
            <h2 className="mt-1 text-[52px] leading-none font-bold tracking-tight text-zinc-50">
              {type.nameZh}
            </h2>
            <p className="mt-2 text-[14px] text-zinc-400">{type.subtitle}</p>
          </motion.div>
        )}

        {/* Observation + traits — always shown, even for HUMAN (Kimi still
            learned something about you, it just couldn't predict you) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="mt-8 text-center text-[14px] leading-relaxed text-zinc-300">
            {prediction.observation}
          </p>

          <div className="mt-8 space-y-5">
            {prediction.traits.map((t, i) => (
              <div key={t.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-zinc-300">{t.label}</span>
                  <span className="text-[12px] text-zinc-500 tabular-nums">{t.value}%</span>
                </div>
                <div className="mt-2 h-[3px] w-full bg-zinc-900">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.value}%` }}
                    transition={{ delay: 0.6 + i * 0.15, duration: 0.7, ease: "easeOut" }}
                    className="h-full bg-zinc-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 space-y-3"
        >
          <button
            type="button"
            onClick={handleChallenge}
            disabled={creating}
            className="min-h-[52px] w-full rounded-full bg-zinc-50 text-[15px] font-medium text-zinc-950 disabled:opacity-40"
          >
            {creating ? "生成中…" : copied ? "链接已复制 ✓" : "叫朋友来挑战 Kimi"}
          </button>
          {manualLink && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-3"
            >
              <p className="mb-2 text-[11px] text-zinc-400">
                当前浏览器禁止自动复制，请长按下方链接手动复制：
              </p>
              <input
                readOnly
                value={manualLink}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-[13px] break-all text-zinc-100 outline-none select-all"
              />
              <button
                type="button"
                onClick={() => setManualLink(null)}
                className="mt-2 min-h-[36px] w-full text-[11px] tracking-widest text-zinc-500 uppercase"
              >
                收起
              </button>
            </motion.div>
          )}
          <button
            type="button"
            onClick={() => {
              track("unlock_doppelganger_click");
              setUnlockOpen(true);
            }}
            className="min-h-[52px] w-full rounded-full border border-zinc-700 text-[15px] text-zinc-200"
          >
            让我的分身活起来
          </button>
          <button
            type="button"
            onClick={handleShareCard}
            disabled={creating}
            className="min-h-[48px] w-full text-[13px] tracking-widest text-zinc-500 uppercase disabled:opacity-40"
          >
            生成分享卡
          </button>
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="min-h-[48px] w-full text-[13px] tracking-widest text-zinc-500 uppercase"
          >
            人格图鉴 · 已解锁 1 / 8
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="min-h-[44px] w-full text-[12px] text-zinc-600"
          >
            重新开始 / 清除本次数据
          </button>
        </motion.div>

        {/* Owner's live leaderboard — appears once a challenge link exists */}
        {shareUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <OwnerBoard challengeUrl={shareUrl} />
          </motion.div>
        )}
      </div>

      {galleryOpen && (
        <GallerySheet
          unlockedType={hiddenFail ? null : prediction.type}
          humanUnlocked={hiddenFail}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {shareOpen && shareUrl && (
        <ShareCard
          prediction={prediction}
          score={score}
          challengeUrl={shareUrl}
          humanFailed={hiddenFail}
          onClose={() => setShareOpen(false)}
        />
      )}
      {unlockOpen && (
        <UnlockSheet
          prediction={prediction}
          learningAnswers={learningAnswers}
          freeText={freeText}
          onClose={() => setUnlockOpen(false)}
        />
      )}
    </div>
  );
}
