import type {
  LearningAnswers,
  OptionKey,
  PersonalityTypeId,
  PredictResponse,
} from "./types";
import { PERSONALITY_TYPES, isValidTypeId, TYPE_IDS } from "./personalityTypes";
import { buildDemoReasoning } from "./reasoning";

/* ------------------------------------------------------------------ */
/* DEMO_MODE — deterministic prediction engine.                        */
/* Used when MOONSHOT_API_KEY is missing or the API call fails.        */
/* Never expose "mock / fake AI" wording in the UI.                    */
/* ------------------------------------------------------------------ */

/** Answer → type affinity weights. */
const TYPE_WEIGHTS: Record<string, Partial<Record<PersonalityTypeId, number>>> = {
  "q1:A": { CTRL: 1, NPC: 1 },
  "q1:B": { NPC: 2 },
  "q1:C": { MAIN: 1, CHAOS: 1 },
  "q1:D": { GHOST: 3 },
  "q2:A": { PLAN: 2 },
  "q2:B": { LATE: 2, PLAN: 1 },
  "q2:C": { LATE: 1, CHAOS: 1 },
  "q2:D": { LATE: 2, GHOST: 1 },
  "q3:A": { GHOST: 1, LATE: 1 },
  "q3:B": { CTRL: 2 },
  "q3:C": { CHAOS: 2, MAIN: 1 },
  "q3:D": { CHAOS: 1, CTRL: 1 },
  "q4:A": { NPC: 2, CTRL: 1 },
  "q4:B": { NPC: 1 },
  "q4:C": { MAIN: 2 },
  "q4:D": { NPC: 2, GHOST: 1 },
  "q5:A": { PLAN: 1, CTRL: 1 },
  "q5:B": { CHAOS: 2, MAIN: 1 },
  "q5:C": { PLAN: 1, MAIN: 1 },
  "q5:D": { CTRL: 2 },
};

function clamp(v: number, min = 42, max = 97): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

/** Small deterministic hash so equal answers with different free text still differ slightly. */
function textHash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export function demoPredict(
  answers: LearningAnswers,
  freeText: string
): Omit<PredictResponse, "sessionId"> {
  const q1 = answers.q1 ?? "A";
  const q2 = answers.q2 ?? "B";
  const q3 = answers.q3 ?? "A";
  const q4 = answers.q4 ?? "A";
  const q5 = answers.q5 ?? "C";

  /* ---- multi-signal trait scoring (all 5 answers + free text) ---- */
  const text = freeText || "";
  const textProcr = /明天|以后|下次|一会|等会|再说|开始/.test(text) ? 1 : 0;

  const ghost = (q1 === "D" ? 3 : 0) + (q3 === "A" ? 1 : 0) + (q4 === "D" ? 1 : 0);
  const procr =
    (q2 === "B" ? 2 : q2 === "D" ? 2 : q2 === "C" ? 1 : 0) + textProcr;
  const impul = (q3 === "C" ? 2 : q3 === "D" ? 1 : 0) + (q5 === "B" ? 2 : 0);
  const ctrl = (q5 === "D" ? 2 : 0) + (q3 === "B" ? 2 : 0) + (q4 === "A" ? 1 : 0);
  const sens = (q1 === "B" ? 2 : q1 === "A" ? 1 : 0) + (q4 === "B" ? 1 : 0);
  const direct = (q1 === "C" ? 2 : 0) + (q4 === "C" ? 2 : 0);

  /* ---- blind predictions -------------------------------------------
   * Tuned toward what people actually do (not what they claim), so the
   * reveal lands as "真猜中了" far more often. Defaults fall back to
   * the statistically most common real-world answer for each scenario. */
  let q7: OptionKey = "D"; // 点个赞然后 emo — most common honest reaction
  if (ghost >= 4) q7 = "B"; // 回避型 → 划走当没看见
  else if (ctrl >= 3) q7 = "C"; // 掌控型 → 立刻盘算怎么追上
  else if (direct >= 3) q7 = "A"; // 主角型 → 真心为 TA 高兴

  let q8: OptionKey = "D"; // 发给朋友「快劝我」其实想被怂恿 — the nearly universal truth
  if (impul >= 3) q8 = "B"; // 冲动型 → 现在就买
  else if (ctrl >= 3) q8 = "A"; // 自控型 → 冷静三天
  else if (sens >= 3) q8 = "C"; // 高敏感 → 先搜智商税

  let q9: OptionKey = "B"; // 表情包装没看懂 — most common crowd behavior
  if (direct >= 3) q9 = "A"; // 直率 → 当场说清楚
  else if (sens >= 3) q9 = "D"; // 敏感 → 不解释但记很久
  else if (ctrl >= 4) q9 = "C"; // 掌控 → 私下找 TA 解释

  let q10: OptionKey = "A"; // 脚趾抠地强制转移 — the cringe default
  if (sens >= 3) q10 = "B"; // 高敏感 → 当场复盘补救
  else if (direct >= 3) q10 = "C"; // 自洽主角 → 笑出声
  else if (ghost >= 4) q10 = "D"; // 老幽灵 → 早就脱敏

  /* ---- doppelgänger type (unchanged weighted enum) ---- */
  const scores = new Map<PersonalityTypeId, number>(TYPE_IDS.map((t) => [t, 0]));
  const entries: [string, OptionKey][] = [
    ["q1", q1],
    ["q2", q2],
    ["q3", q3],
    ["q4", q4],
    ["q5", q5],
  ];
  for (const [qid, key] of entries) {
    const w = TYPE_WEIGHTS[`${qid}:${key}`];
    if (!w) continue;
    for (const [t, v] of Object.entries(w)) {
      scores.set(t as PersonalityTypeId, (scores.get(t as PersonalityTypeId) ?? 0) + (v ?? 0));
    }
  }
  let type: PersonalityTypeId = "GHOST";
  let best = -1;
  for (const t of TYPE_IDS) {
    const s = scores.get(t) ?? 0;
    if (s > best) {
      best = s;
      type = t;
    }
  }

  const h = textHash(text || "kimi");
  const stubborn = (q4 === "A" ? 88 : q4 === "D" ? 84 : q4 === "B" ? 55 : 34) + (h % 9);
  const procrastinate =
    (q2 === "B" ? 86 : q2 === "D" ? 82 : q2 === "C" ? 71 : 30) + textProcr * 4 + (h % 7);
  const impulsive =
    (q3 === "C" ? 83 : q3 === "D" ? 76 : q5 === "B" ? 68 : q5 === "C" ? 60 : 38) + (h % 8);

  const predictions = { q7, q8, q9, q10 };
  return {
    predictions,
    reasoning: buildDemoReasoning(predictions),
    type,
    observation: PERSONALITY_TYPES[type].observation,
    traits: [
      { label: "嘴硬", value: clamp(stubborn) },
      { label: "拖延", value: clamp(procrastinate) },
      { label: "临时起意", value: clamp(impulsive) },
    ],
    demoMode: true,
  };
}

/* ------------------------------------------------------------------ */
/* Validation / sanitization of ANY prediction payload (AI or demo).   */
/* Guarantees: predictions only for q7–q10, valid option keys,          */
/* type strictly from the allowed enum, traits clamped to 0–100.        */
/* ------------------------------------------------------------------ */

export function sanitizePrediction(
  raw: unknown,
  answers: LearningAnswers,
  freeText: string
): Omit<PredictResponse, "sessionId"> {
  const fallback = demoPredict(answers, freeText);
  if (!raw || typeof raw !== "object") return { ...fallback, demoMode: true };
  const obj = raw as Record<string, unknown>;

  const validKeys: OptionKey[] = ["A", "B", "C", "D"];
  const predictions: Record<string, OptionKey> = { ...fallback.predictions };
  const rawPred = obj.predictions as Record<string, unknown> | undefined;
  if (rawPred && typeof rawPred === "object") {
    for (const qid of ["q7", "q8", "q9", "q10"]) {
      const v = rawPred[qid];
      if (typeof v === "string" && validKeys.includes(v.toUpperCase() as OptionKey)) {
        predictions[qid] = v.toUpperCase() as OptionKey;
      }
    }
  }

  const type: PersonalityTypeId = isValidTypeId(obj.type)
    ? obj.type
    : typeof obj.type === "string" && isValidTypeId(obj.type.toUpperCase())
      ? (obj.type.toUpperCase() as PersonalityTypeId)
      : fallback.type;

  const observation =
    typeof obj.one_line_observation === "string" && obj.one_line_observation.trim().length > 0
      ? obj.one_line_observation.trim().slice(0, 120)
      : PERSONALITY_TYPES[type].observation;

  let traits: { label: string; value: number }[] = fallback.traits;
  const rawTraits = obj.traits as Record<string, unknown> | undefined;
  if (rawTraits && typeof rawTraits === "object") {
    const parsed = Object.entries(rawTraits)
      .filter(([k, v]) => typeof k === "string" && typeof v === "number")
      .slice(0, 4)
      .map(([label, v]) => ({
        label: label.slice(0, 8),
        value: Math.max(0, Math.min(100, Math.round(v as number))),
      }));
    if (parsed.length >= 3) traits = parsed;
  }

  // reasoning must correspond to the FINAL (sanitized) predictions;
  // if the AI gave a rationale for an option that got overridden, regenerate it.
  const reasoning: Record<string, string> = { ...fallback.reasoning };
  const rawReasoning = obj.reasoning as Record<string, unknown> | undefined;
  if (rawReasoning && typeof rawReasoning === "object") {
    for (const qid of ["q7", "q8", "q9", "q10"]) {
      const v = rawReasoning[qid];
      if (
        typeof v === "string" &&
        v.trim().length > 0 &&
        rawPred?.[qid] === predictions[qid] // only keep if its pick survived
      ) {
        reasoning[qid] = v.trim().slice(0, 60);
      }
    }
  }

  return { predictions, reasoning, type, observation, traits };
}
