/** Haptics — guarded vibration patterns. Sound is intentionally not implemented (opt-in only). */

export function vibrateMatch(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(18);
  }
}

export function vibrateMiss(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([12, 40, 12]);
  }
}

export function vibratePress(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
}
