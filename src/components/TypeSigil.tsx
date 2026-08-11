"use client";

import { useMemo } from "react";
import type { SigilType } from "@/lib/sigils";
import { sigilSvg } from "@/lib/sigils";

/** Abstract monochrome sigil for a Doppelgänger type (or the HUMAN hidden state). */
export default function TypeSigil({
  type,
  size = 96,
  className,
}: {
  type: SigilType;
  size?: number;
  className?: string;
}) {
  const svg = useMemo(() => sigilSvg(type, size), [type, size]);
  return (
    <span
      className={className}
      style={{ display: "inline-block", width: size, height: size }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
