"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import type { PredictResponse } from "@/lib/types";
import { PERSONALITY_TYPES } from "@/lib/personalityTypes";
import { sigilDataUrl } from "@/lib/sigils";

interface Props {
  prediction: PredictResponse;
  score: number;
  challengeUrl: string;
  /** true when score <= 1 — CLONING FAILED, card shows HUMAN instead of a type */
  humanFailed?: boolean;
  onClose: () => void;
}

const W = 900;
const H = 1200; // 3:4 — 朋友圈 / 小红书 / 微信群

/**
 * Share card — black/white/gray only, 3:4.
 * Rendered on canvas, downloadable as PNG, includes QR of the challenge URL.
 */
export default function ShareCard({ prediction, score, challengeUrl, humanFailed, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [png, setPng] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const qrData = await QRCode.toDataURL(challengeUrl, {
        margin: 1,
        width: 220,
        color: { dark: "#f5f5f4", light: "#0a0a0a" },
      });
      const qr = new Image();
      qr.src = qrData;
      const sigil = new Image();
      sigil.src = sigilDataUrl(humanFailed ? "HUMAN" : prediction.type, 200);
      await Promise.all(
        [qr, sigil].map(
          (img) =>
            new Promise((r) => {
              img.onload = r;
              img.onerror = r;
            })
        )
      );
      if (cancelled) return;

      // bg
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);
      // dot grid
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let x = 40; x < W; x += 26) {
        for (let y = 40; y < H; y += 26) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
      // frame
      ctx.strokeStyle = "#262626";
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      const center = W / 2;
      ctx.textAlign = "center";

      ctx.fillStyle = "#8a8a8a";
      ctx.font = "500 26px Arial";
      ctx.fillText("K I M I   D O P P E L G Ä N G E R", center, 150);

      // type sigil
      ctx.drawImage(sigil, center - 60, 185, 120, 120);

      // small english code + big chinese name
      ctx.fillStyle = "#8a8a8a";
      ctx.font = "500 26px Arial";
      ctx.fillText(humanFailed ? "H U M A N" : prediction.type.split("").join(" "), center, 380);
      ctx.fillStyle = "#f5f5f4";
      ctx.font = "bold 92px Arial";
      ctx.fillText(humanFailed ? "人类" : PERSONALITY_TYPES[prediction.type].nameZh, center, 478);

      ctx.fillStyle = "#c9c9c9";
      ctx.font = humanFailed ? "28px Arial" : "30px Arial";
      ctx.fillText(
        humanFailed ? "克隆失败 · 你目前仍然不可预测" : PERSONALITY_TYPES[prediction.type].subtitle,
        center,
        532
      );

      ctx.strokeStyle = "#262626";
      ctx.beginPath();
      ctx.moveTo(180, 580);
      ctx.lineTo(W - 180, 580);
      ctx.stroke();

      ctx.fillStyle = "#8a8a8a";
      ctx.font = "500 24px Arial";
      ctx.fillText("KIMI PREDICTION", center, 645);
      ctx.fillStyle = "#f5f5f4";
      ctx.font = "bold 96px Arial";
      ctx.fillText(`${score} / 4`, center, 770);

      ctx.fillStyle = "#c9c9c9";
      ctx.font = "30px Arial";
      if (humanFailed) {
        ctx.fillText("它 6 道题也没看懂我。", center, 842);
        ctx.fillText("你认识我这么久，", center, 884);
        ctx.fillStyle = "#f5f5f4";
        ctx.font = "bold 34px Arial";
        ctx.fillText("你能比它更懂我吗？", center, 930);
      } else {
        ctx.fillText("它只认识我 6 道题。", center, 842);
        ctx.fillText("你认识我这么久，", center, 884);
        ctx.fillStyle = "#f5f5f4";
        ctx.font = "bold 34px Arial";
        ctx.fillText("能赢它吗？", center, 930);
      }

      // QR + url
      ctx.drawImage(qr, center - 75, 965, 150, 150);
      ctx.fillStyle = "#8a8a8a";
      ctx.font = "20px Arial";
      const short = challengeUrl.replace(/^https?:\/\//, "");
      ctx.fillText(short.length > 40 ? short.slice(0, 40) + "…" : short, center, 1150);

      setPng(canvas.toDataURL("image/png"));
    })();
    return () => {
      cancelled = true;
    };
  }, [prediction.type, score, challengeUrl, humanFailed]);

  const download = () => {
    if (!png) return;
    const a = document.createElement("a");
    a.href = png;
    a.download = `kimi-doppelganger-${prediction.type}.png`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex flex-col bg-black/95 px-6 pt-10 pb-8"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.35em] text-zinc-500 uppercase">Share Card</span>
        <button type="button" onClick={onClose} className="min-h-[44px] px-3 text-[13px] text-zinc-400">
          关闭
        </button>
      </div>

      <div className="mt-4 flex flex-1 items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="max-h-full w-auto max-w-full rounded-lg border border-zinc-900"
        />
      </div>

      <button
        type="button"
        onClick={download}
        disabled={!png}
        className="mt-5 min-h-[52px] w-full rounded-full bg-zinc-50 text-[15px] font-medium text-zinc-950 disabled:opacity-40"
      >
        保存分享卡
      </button>
      <p className="mt-3 text-center text-[11px] text-zinc-600">
        长按图片也可以直接保存 / 转发到小红书、朋友圈、微信群
      </p>
    </motion.div>
  );
}
