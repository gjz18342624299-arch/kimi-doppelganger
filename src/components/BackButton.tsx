"use client";

/**
 * Back-to-previous-question affordance, top-left above the progress line.
 * Only used in the learning phase — prediction rounds never go back,
 * because Kimi's pick is revealed there and re-answering would be cheating.
 */
export default function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <div className="px-6 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="flex min-h-[36px] items-center gap-1.5 text-[12px] tracking-wider text-zinc-500 transition-colors active:text-zinc-300"
      >
        <span aria-hidden className="text-[14px] leading-none">←</span>
        上一题
      </button>
    </div>
  );
}
