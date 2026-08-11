"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GameShell from "@/components/GameShell";
import { track } from "@/lib/analytics";

/**
 * Landing — extremely restrained. No nav, no rules, no card grid.
 * KIMI · DOPPELGÄNGER EXPERIMENT · one CTA.
 */
export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    track("landing_view");
  }, []);

  return (
    <GameShell>
      <div className="flex h-full flex-col px-8 pt-10 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-baseline justify-between"
        >
          <span className="text-[13px] font-semibold tracking-[0.35em] text-zinc-50">KIMI</span>
          <span className="text-[9px] tracking-[0.3em] text-zinc-600 uppercase">
            Doppelgänger Experiment
          </span>
        </motion.div>

        <div className="mt-20">
          {["Kimi", "is trying", "to become", "you."].map((line, i) => (
            <motion.h1
              key={line}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.6 }}
              className={`text-[52px] leading-[1.05] font-bold tracking-tight ${
                i === 3 ? "text-zinc-50" : "text-zinc-300"
              }`}
            >
              {line}
            </motion.h1>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-10 space-y-1 text-[14px] leading-relaxed text-zinc-500"
        >
          <p>给我 6 道题认识你。</p>
          <p>然后，给我 4 道题证明。</p>
        </motion.div>

        {/* restrained abstract visual: dot sphere + ripple rings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="relative mx-auto mt-12 h-36 w-36"
          aria-hidden
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 38% 32%, #2a2a2a 0%, #101010 55%, #050505 100%)",
              border: "1px solid #1f1f1f",
            }}
          />
          {[0, 1].map((i) => (
            <div
              key={i}
              className="ripple-ring absolute inset-0 rounded-full border border-zinc-800"
              style={{ animationDelay: `${i * 1.6}s` }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] tracking-[0.4em] text-zinc-600 uppercase">scanning</span>
          </div>
        </motion.div>

        <div className="mt-auto">
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            onClick={() => {
              track("test_start");
              router.push("/play");
            }}
            className="min-h-[56px] w-full rounded-full bg-zinc-50 text-[16px] font-medium text-zinc-950"
          >
            开始克隆 →
          </motion.button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="mt-4 text-center text-[10px] tracking-[0.25em] text-zinc-600 uppercase"
          >
            No login. · No download. · 2 min.
          </motion.p>
        </div>
      </div>
    </GameShell>
  );
}
