"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LearningAnswers, PredictResponse } from "@/lib/types";
import { buildDoppelgangerPrompt } from "@/lib/doppelgangerPrompt";
import { copyText } from "@/lib/clipboard";
import { track } from "@/lib/analytics";

/**
 * Deep link / context handoff to the real Kimi app.
 * If NEXT_PUBLIC_KIMI_DEEP_LINK contains "{q}", it is replaced with the
 * URL-encoded memory prompt (for future prefill support); otherwise the
 * prompt travels via clipboard — paste it into Kimi to restore memory.
 */
const KIMI_DEEP_LINK = process.env.NEXT_PUBLIC_KIMI_DEEP_LINK ?? "https://www.kimi.com/";

interface Props {
  prediction: PredictResponse;
  learningAnswers: LearningAnswers;
  freeText: string;
  onClose: () => void;
}

/** Bottom sheet — 它现在只会猜你。 */
export default function UnlockSheet({ prediction, learningAnswers, freeText, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);

  const prompt = useMemo(
    () => buildDoppelgangerPrompt(prediction, learningAnswers, freeText),
    [prediction, learningAnswers, freeText]
  );

  const copyPrompt = async (): Promise<boolean> => {
    return copyText(prompt);
  };

  const wakeUp = async () => {
    track("kimi_redirect_click");
    const ok = await copyPrompt();
    setCopied(ok);
    if (!ok) setManual(true);
    const url = KIMI_DEEP_LINK.includes("{q}")
      ? KIMI_DEEP_LINK.replace("{q}", encodeURIComponent(prompt))
      : KIMI_DEEP_LINK;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const exportContext = () => {
    const payload = {
      product: "kimi-doppelganger",
      version: 1,
      sessionId: prediction.sessionId,
      doppelganger_type: prediction.type,
      traits: prediction.traits,
      observation: prediction.observation,
      learning_answers: learningAnswers,
      free_text_q6: freeText,
      memory_prompt: prompt,
      // TODO: when Kimi exposes an official handoff endpoint, POST this
      // payload instead of relying on clipboard transfer.
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "doppelganger-context.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92%] overflow-y-auto rounded-t-3xl border-t border-zinc-800 bg-zinc-950 px-6 pt-8 pb-10"
      >
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-zinc-800" />

        <h3 className="text-[22px] font-semibold text-zinc-50">它现在只会猜你。</h3>
        <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
          如果这个“你”，真的开始替你思考呢？
        </p>

        <div className="mt-6 space-y-3">
          {[
            "「这条微信，我会怎么回？」",
            "「两个 Offer，我到底会选哪个？」",
            "「如果按照我的性格，我现在应该怎么办？」",
          ].map((line) => (
            <div
              key={line}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-[13px] text-zinc-300"
            >
              {line}
            </div>
          ))}
        </div>

        {/* memory handoff notice */}
        <div className="mt-6 rounded-xl border border-zinc-800 px-4 py-3">
          <p className="text-[12px] leading-relaxed text-zinc-400">
            唤醒时会自动复制你的<span className="text-zinc-50">分身档案</span>
            （6 道题答案 + 人格类型 + 性格强度），
            到 Kimi 里<span className="text-zinc-50">粘贴发送</span>，它就拥有刚才的记忆了。
          </p>
        </div>

        <button
          type="button"
          onClick={() => void wakeUp()}
          className="mt-5 min-h-[52px] w-full rounded-full bg-zinc-50 text-[15px] font-medium text-zinc-950"
        >
          {copied ? "档案已复制 ✓ 去 Kimi 粘贴" : "在 Kimi 中唤醒我的分身 →"}
        </button>
        {copied && (
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            已在新标签页打开 Kimi，粘贴（长按输入框 → 粘贴）发送即可
          </p>
        )}
        {manual && !copied && (
          <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-900/70 p-3">
            <p className="mb-2 text-[11px] text-zinc-400">
              当前浏览器禁止自动复制，请长按全选下方档案手动复制：
            </p>
            <textarea
              readOnly
              value={prompt}
              rows={5}
              onFocus={(e) => e.target.select()}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-[11px] leading-relaxed text-zinc-100 outline-none"
            />
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() =>
              void copyPrompt().then((ok) => {
                setCopied(ok);
                if (!ok) setManual(true);
              })
            }
            className="min-h-[44px] text-[12px] tracking-widest text-zinc-500 uppercase"
          >
            复制分身档案
          </button>
          <button
            type="button"
            onClick={exportContext}
            className="min-h-[44px] text-[12px] tracking-widest text-zinc-500 uppercase"
          >
            导出 Context (JSON)
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
