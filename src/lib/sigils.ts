import type { PersonalityTypeId } from "./types";

/**
 * Abstract monochrome sigils for the 7 Doppelgänger types.
 * Kimi design language: black / white / thin lines / dots / geometry.
 * No cartoon illustration — each sigil is a minimal glyph.
 * Shared between the React result page and the canvas share card.
 */

const C = "#f5f5f4";
const DIM = "#8a8a8a";

const SIGILS: Record<PersonalityTypeId | "HUMAN", string> = {
  // echo of a person — solid self, dotted ghost
  GHOST: `
    <circle cx="38" cy="50" r="16" fill="none" stroke="${C}" stroke-width="2"/>
    <circle cx="62" cy="50" r="16" fill="none" stroke="${DIM}" stroke-width="2" stroke-dasharray="3 5"/>
    <circle cx="38" cy="50" r="3" fill="${C}"/>`,
  // almost-full clock arc — the missing quarter is "not now"
  LATE: `
    <path d="M 50 26 A 24 24 0 1 1 26 50" fill="none" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="22" r="3" fill="${DIM}"/>
    <path d="M 50 38 L 50 52 L 62 58" fill="none" stroke="${DIM}" stroke-width="2" stroke-linecap="round"/>`,
  // 3x3 grid + crosshair — everything under control
  CTRL: `
    <line x1="50" y1="14" x2="50" y2="86" stroke="${DIM}" stroke-width="1"/>
    <line x1="14" y1="50" x2="86" y2="50" stroke="${DIM}" stroke-width="1"/>
    <circle cx="32" cy="32" r="2.5" fill="${C}"/><circle cx="50" cy="32" r="2.5" fill="${C}"/><circle cx="68" cy="32" r="2.5" fill="${C}"/>
    <circle cx="32" cy="50" r="2.5" fill="${C}"/><circle cx="68" cy="50" r="2.5" fill="${C}"/>
    <circle cx="32" cy="68" r="2.5" fill="${C}"/><circle cx="50" cy="68" r="2.5" fill="${C}"/><circle cx="68" cy="68" r="2.5" fill="${C}"/>
    <circle cx="50" cy="50" r="9" fill="none" stroke="${C}" stroke-width="2"/>`,
  // scattered points, one jagged line survives
  CHAOS: `
    <circle cx="24" cy="30" r="2.5" fill="${DIM}"/>
    <circle cx="78" cy="24" r="2.5" fill="${DIM}"/>
    <circle cx="68" cy="78" r="2.5" fill="${DIM}"/>
    <circle cx="30" cy="72" r="2.5" fill="${DIM}"/>
    <polyline points="22,62 40,38 52,58 66,30 80,56" fill="none" stroke="${C}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  // checklist — the plan itself is the satisfaction
  PLAN: `
    <rect x="22" y="26" width="8" height="8" fill="none" stroke="${C}" stroke-width="2"/>
    <rect x="22" y="46" width="8" height="8" fill="none" stroke="${C}" stroke-width="2"/>
    <rect x="22" y="66" width="8" height="8" fill="none" stroke="${C}" stroke-width="2"/>
    <line x1="38" y1="30" x2="78" y2="30" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
    <line x1="38" y1="50" x2="70" y2="50" stroke="${DIM}" stroke-width="2" stroke-linecap="round"/>
    <line x1="38" y1="70" x2="62" y2="70" stroke="${DIM}" stroke-width="2" stroke-linecap="round"/>
    <path d="M 24 30 L 26.5 32.5 L 30 28" fill="none" stroke="${C}" stroke-width="1.6" stroke-linecap="round"/>`,
  // protagonist — a center with orbits
  MAIN: `
    <circle cx="50" cy="50" r="7" fill="${C}"/>
    <ellipse cx="50" cy="50" rx="30" ry="12" fill="none" stroke="${DIM}" stroke-width="1.5" transform="rotate(-24 50 50)"/>
    <ellipse cx="50" cy="50" rx="30" ry="12" fill="none" stroke="${C}" stroke-width="1.5" transform="rotate(28 50 50)"/>
    <circle cx="74" cy="32" r="2.5" fill="${C}"/>`,
  // quiet frame, small self, floating danmaku
  NPC: `
    <rect x="18" y="22" width="64" height="56" rx="4" fill="none" stroke="${C}" stroke-width="2"/>
    <circle cx="34" cy="62" r="4" fill="${C}"/>
    <line x1="52" y1="36" x2="70" y2="36" stroke="${DIM}" stroke-width="2" stroke-linecap="round"/>
    <line x1="58" y1="46" x2="72" y2="46" stroke="${DIM}" stroke-width="2" stroke-linecap="round"/>
    <line x1="48" y1="56" x2="62" y2="56" stroke="${DIM}" stroke-width="2" stroke-linecap="round"/>`,
  // unclonable — a broken ring, a signal escaping through the gap
  HUMAN: `
    <path d="M 70.8 38 A 24 24 0 1 0 70.8 62" fill="none" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
    <polyline points="66,46 76,40 73,52 83,47" fill="none" stroke="${DIM}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="2.5" fill="${C}"/>`,
};

export type SigilType = PersonalityTypeId | "HUMAN";

export function sigilSvg(type: SigilType, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${SIGILS[type]}</svg>`;
}

export function sigilDataUrl(type: SigilType, size: number): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(sigilSvg(type, size))}`;
}
