import type { PersonalityType, PersonalityTypeId } from "./types";

/**
 * Fixed enum of Doppelgänger types.
 * The AI (or DEMO_MODE engine) may ONLY choose from this list —
 * free-form invention of new types is not allowed.
 */
export const PERSONALITY_TYPES: Record<PersonalityTypeId, PersonalityType> = {
  GHOST: {
    id: "GHOST",
    nameZh: "幽灵",
    subtitle: "精神上已经回复所有消息型",
    observation: "你不是没有行动。很多时候，你只是已经在脑子里把整件事做完了。",
  },
  LATE: {
    id: "LATE",
    nameZh: "鸽王",
    subtitle: "什么都会做，只是不是现在型",
    observation: "你的计划从不缺席，只是总是迟到。收藏夹知道你说过的每一句「明天」。",
  },
  CTRL: {
    id: "CTRL",
    nameZh: "掌控",
    subtitle: "嘴上说随便，实际必须掌控型",
    observation: "你说「都行」的时候，心里已经排除了九个选项。剩下那个，必须是你选的。",
  },
  CHAOS: {
    id: "CHAOS",
    nameZh: "混沌",
    subtitle: "没有计划，但总能活下来型",
    observation: "你不做计划，因为计划限制了你临场的发挥。奇怪的是，每次居然都接住了。",
  },
  PLAN: {
    id: "PLAN",
    nameZh: "计划通",
    subtitle: "做计划本身就已经很满足型",
    observation: "计划写完的那一刻，你在心里已经完成了它。执行，是另一个平行宇宙的事。",
  },
  MAIN: {
    id: "MAIN",
    nameZh: "主角",
    subtitle: "默认自己是故事主角型",
    observation: "你把每一次犹豫都活成悬念，每一次出场都自带配乐。剧情需要，你会出手。",
  },
  NPC: {
    id: "NPC",
    nameZh: "路人",
    subtitle: "表面平静，内心弹幕很多型",
    observation: "你的脸上写着「没事」，你的内心已经发了三百条弹幕，并且逐条点了个赞。",
  },
};

export const TYPE_IDS = Object.keys(PERSONALITY_TYPES) as PersonalityTypeId[];

/** The hidden state when prediction score <= 1 */
export const HUMAN_TYPE = {
  id: "HUMAN" as const,
  nameZh: "人类",
  subtitle: "克隆失败 · 你目前仍然不可预测",
};

export function isValidTypeId(value: unknown): value is PersonalityTypeId {
  return typeof value === "string" && TYPE_IDS.includes(value as PersonalityTypeId);
}
