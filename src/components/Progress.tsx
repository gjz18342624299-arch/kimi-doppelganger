"use client";

/** Ultra-thin progress indicator. */
export default function Progress({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  return (
    <div className="px-6 pt-6">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
          {label}
        </span>
        <span className="text-[10px] tracking-[0.2em] text-zinc-500 tabular-nums">
          {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="progress-line mt-3">
        <span style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}
