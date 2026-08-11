import type { OptionKey } from "./types";

/**
 * Kimi's per-question "作案理由" — why it predicted that option.
 * Static per (question, option); shown at reveal regardless of MATCH/MISS.
 * Perceived accuracy lives here: even a miss should feel insightful.
 */
const REASONING: Record<string, Record<OptionKey, string>> = {
  q7: {
    A: "你对别人的好消息一向消化得很好——至少表面上是。",
    B: "不想面对的东西，你的处理方式一向是：划走，不存在。",
    C: "你不是嫉妒，你是立刻把不甘心换算成了行动计划。",
    D: "赞是你点的，emo 也是你应得的。体面和不爽你都要。",
  },
  q8: {
    A: "你的购物车不是购物车，是冷静期收容所。",
    B: "深夜、冲动、「量身定做」——这三个词凑一起，你扛不住的。",
    C: "你买的从来不是东西，是「我没被坑」的确定感。",
    D: "「快劝我」翻译过来就是「快推我一把」。我太懂这个暗号了。",
  },
  q9: {
    A: "你的原则是：可以输，但不能被误会。当场必须说清楚。",
    B: "正面冲突不是你的战场，表情包是你的防弹衣。",
    C: "台面上你让它过去，台面下你一定要把话说开。",
    D: "你不解释，但你的小本本记得比谁都清楚。",
  },
  q10: {
    A: "尴尬回忆杀对你依然有效，你的防御系统只会强制关机。",
    B: "别人的深夜回放是尴尬，你的深夜回放是错题本。",
    C: "你已经能和过去的自己笑着和解了，这很难得。",
    D: "同样的片子放了太多年，你已经看麻了。",
  },
};

export function demoReasoning(questionId: string, pick: OptionKey): string {
  return REASONING[questionId]?.[pick] ?? "直觉，加上一点计算。";
}

export function buildDemoReasoning(
  predictions: Record<string, OptionKey>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [qid, pick] of Object.entries(predictions)) {
    out[qid] = demoReasoning(qid, pick);
  }
  return out;
}
