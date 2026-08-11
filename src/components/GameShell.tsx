"use client";

import type { ReactNode } from "react";

/**
 * GameShell — the phone-proportioned stage.
 * Mobile: full viewport. Desktop: centered phone frame on pure black.
 */
export default function GameShell({ children }: { children: ReactNode }) {
  return <div className="game-shell noise">{children}</div>;
}
