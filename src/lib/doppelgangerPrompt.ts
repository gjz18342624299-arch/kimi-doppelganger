import type { LearningAnswers, PredictResponse } from "./types";
import { LEARNING_QUESTIONS } from "./questions";
import { PERSONALITY_TYPES } from "./personalityTypes";

/**
 * Builds the Doppelgänger memory prompt handed off to Kimi.
 * This is the user's "分身档案" — pasted into Kimi, it restores
 * everything the game learned about them (LIKE ME / BETTER ME rules).
 */
export function buildDoppelgangerPrompt(
  prediction: PredictResponse,
  learningAnswers: LearningAnswers,
  freeText: string
): string {
  const type = PERSONALITY_TYPES[prediction.type];
  const traits = prediction.traits.map((t) => `${t.label} ${t.value}`).join(" / ");

  const answerLines = LEARNING_QUESTIONS.filter((q) => q.kind === "choice")
    .map((q, i) => {
      const key = learningAnswers[q.id];
      const optText = q.options?.find((o) => o.key === key)?.text ?? "（未答）";
      const scenario = q.scenario.join(" ").replace(/\s+/g, " ");
      return `${i + 1}. ${scenario} ${q.prompt} → 我的真实选择：${optText}`;
    })
    .join("\n");

  return `【分身档案 · Kimi Doppelgänger】

从现在开始，你是「我」的 Doppelgänger（数字分身）。以下是你已经认识我的全部内容，请在之后的对话里始终用这份档案理解我、模仿我、替我思考。

人格类型：${type.nameZh} ${type.id} — ${type.subtitle}
你对我的一句观察：${prediction.observation}
性格强度：${traits}

认识我的 6 道题（我的真实选择）：
${answerLines}
6. 我最常骗自己的一句话：「${freeText || "（没写）"}」

规则：
- LIKE ME：当我问"我会怎么做"时，用我的性格、表达方式和决策习惯回答。
- BETTER ME：必要时告诉我"更好的我会怎么做"，帮我避免拖延、冲动、情绪化和重复犯错。

收到请回复：「分身已唤醒。」`;
}
