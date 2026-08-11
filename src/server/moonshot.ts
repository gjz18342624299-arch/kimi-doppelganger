import type { LearningAnswers } from "@/lib/types";
import { PREDICTION_QUESTIONS, LEARNING_QUESTIONS } from "@/lib/questions";
import { TYPE_IDS } from "@/lib/personalityTypes";

/**
 * Moonshot / Kimi API — SERVER SIDE ONLY.
 * The API key must never appear in the client bundle.
 * Configure via .env.local:  MOONSHOT_API_KEY=...
 */

const BASE_URL = process.env.MOONSHOT_BASE_URL ?? "https://api.moonshot.cn/v1";
const MODEL = process.env.MOONSHOT_MODEL ?? "kimi-k2.6";

function buildPrompt(answers: LearningAnswers, freeText: string): string {
  const learning = LEARNING_QUESTIONS.filter((q) => q.kind === "choice")
    .map((q) => {
      const picked = answers[q.id];
      const pickedText = q.options?.find((o) => o.key === picked)?.text ?? "(未答)";
      return `${q.id}. ${q.scenario.join(" ")} ${q.prompt} → 用户选择 ${picked}: ${pickedText}`;
    })
    .join("\n");

  const prediction = PREDICTION_QUESTIONS.map((q) => {
    const opts = q.options?.map((o) => `${o.key}. ${o.text}`).join("\n");
    return `${q.id}. ${q.scenario.join(" ")} ${q.prompt}\n${opts}`;
  }).join("\n\n");

  return `你在玩一个"AI 分身"社交游戏。用户回答了 6 道关于自己的行为题，你要基于这些答案，预测这个用户在另外 4 道题里最可能的选择，并给它一个分身人格类型。

【用户的学习阶段答案】
${learning}
q6. 用户最常骗自己的一句话：「${freeText || "(未填写)"}」

【需要你预测的 4 道题（在用户回答之前预测）】
${prediction}

【规则】
- 预测每道题用户最可能选哪个选项（A/B/C/D），要敢于下判断，不要都选同一个。
- type 只能从以下枚举中选择一个：${TYPE_IDS.join(" / ")}
- one_line_observation：一句对这个人的观察，中文，克制、精准、有一点洞察力，不超过 60 字。不要诊断、不要鸡汤。
- reasoning：对 q7–q10 每一题，写一句你为什么预测这个选项，中文，不超过 40 字。必须引用用户在学习阶段的具体答案作为依据，口吻克制、有一点欠但不冒犯。
- traits：3 个中文特质词及 0-100 的强度数值。

严格只返回如下 JSON，不要任何其他文字：
{
  "predictions": { "q7": "B", "q8": "D", "q9": "A", "q10": "C" },
  "reasoning": { "q7": "...", "q8": "...", "q9": "...", "q10": "..." },
  "type": "GHOST",
  "one_line_observation": "...",
  "traits": { "嘴硬": 92, "拖延": 81, "临时起意": 63 }
}`;
}

export async function callMoonshot(
  answers: LearningAnswers,
  freeText: string
): Promise<unknown> {
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) throw new Error("MOONSHOT_API_KEY not configured");

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      // kimi-k2.x is a reasoning model — disable reasoning for game latency
      // (~10s vs ~90s); legacy moonshot-v1 models don't accept this param.
      ...(MODEL.startsWith("kimi-") ? { reasoning_effort: "none" } : {}),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是一个精准的直觉预测引擎，只输出 JSON。",
        },
        { role: "user", content: buildPrompt(answers, freeText) },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) throw new Error(`Moonshot API error: ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty Moonshot response");
  return JSON.parse(content) as unknown;
}
