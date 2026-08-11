import type { Question } from "./types";

/**
 * Single source of truth for all 10 questions.
 * Q1–Q6: LEARNING PHASE · Q7–Q10: PREDICTION PHASE
 * Edit / reorder / A-B test here — components never hardcode questions.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q1",
    phase: "learning",
    kind: "choice",
    scenario: ["朋友：", "「在吗？」"],
    prompt: "你的第一反应？",
    options: [
      { key: "A", text: "他是不是要借钱" },
      { key: "B", text: "我是不是做错什么了" },
      { key: "C", text: "有屁快放" },
      { key: "D", text: "看到了，但精神上已经回复" },
    ],
  },
  {
    id: "q2",
    phase: "learning",
    kind: "choice",
    scenario: ["你收藏了一篇：", "《每天坚持这 5 件事，一年后你会感谢自己》"],
    prompt: "第二天你：",
    options: [
      { key: "A", text: "真的开始做" },
      { key: "B", text: "收藏≈完成" },
      { key: "C", text: "转发给朋友，然后两个人一起不做" },
      { key: "D", text: "已经忘了自己收藏过" },
    ],
  },
  {
    id: "q3",
    phase: "learning",
    kind: "choice",
    scenario: ["周五晚上。", "你已经洗完澡，躺在床上。", "朋友：「出来喝酒。」"],
    prompt: "你：",
    swipeHint: true,
    options: [
      { key: "A", text: "谁都别想让我起来" },
      { key: "B", text: "先问都有谁" },
      { key: "C", text: "十分钟后见" },
      { key: "D", text: "嘴上拒绝，五分钟后开始换衣服" },
    ],
  },
  {
    id: "q4",
    phase: "learning",
    kind: "choice",
    scenario: ["你明显不开心。", "别人问：", "「你是不是不开心？」"],
    prompt: "你：",
    options: [
      { key: "A", text: "没有啊" },
      { key: "B", text: "有一点" },
      { key: "C", text: "直接说发生了什么" },
      { key: "D", text: "哈哈哈哈没事" },
    ],
  },
  {
    id: "q5",
    phase: "learning",
    kind: "choice",
    scenario: ["两个选择：", "A：很稳定，但有点无聊。", "B：很刺激，但结果未知。"],
    prompt: "你通常：",
    options: [
      { key: "A", text: "直接选稳定" },
      { key: "B", text: "直接选刺激" },
      { key: "C", text: "分析很久，最后靠感觉" },
      { key: "D", text: "问遍所有朋友，最后还是自己选" },
    ],
  },
  {
    id: "q6",
    phase: "learning",
    kind: "freetext",
    scenario: [],
    prompt: "写一句你最经常骗自己的话。",
    placeholder: "明天一定开始。",
    maxLength: 40,
  },
  {
    id: "q7",
    phase: "prediction",
    kind: "choice",
    scenario: ["一个和你起点差不多的人，", "突然晒出了你最想要的东西。"],
    prompt: "你的第一反应？",
    options: [
      { key: "A", text: "真心为 TA 高兴" },
      { key: "B", text: "手指划过，当没看见" },
      { key: "C", text: "立刻开始盘算自己怎么追上" },
      { key: "D", text: "点个赞，然后放下手机 emo 一会" },
    ],
  },
  {
    id: "q8",
    phase: "prediction",
    kind: "choice",
    scenario: ["深夜刷到一个「简直为你量身定做」的东西。", "不便宜，但也不是买不起。"],
    prompt: "你：",
    options: [
      { key: "A", text: "加入购物车，冷静三天再说" },
      { key: "B", text: "现在就买，快乐不等人" },
      { key: "C", text: "先去搜「这东西是不是智商税」" },
      { key: "D", text: "发给朋友说「快劝我」，其实想被怂恿" },
    ],
  },
  {
    id: "q9",
    phase: "prediction",
    kind: "choice",
    scenario: ["群里有人曲解了你的话，", "还在阴阳怪气。", "其他人都在围观。"],
    prompt: "你：",
    options: [
      { key: "A", text: "当场说清楚，一句都不能忍" },
      { key: "B", text: "发个表情包，假装没看懂" },
      { key: "C", text: "私下找 TA 解释" },
      { key: "D", text: "不解释，但这事会记很久" },
    ],
  },
  {
    id: "q10",
    phase: "prediction",
    kind: "choice",
    scenario: ["深夜，大脑突然开始回放：", "你几年前做过的尴尬事。", "高清。无码。带音效。"],
    prompt: "你：",
    options: [
      { key: "A", text: "脚趾抠地，强制自己想点别的" },
      { key: "B", text: "当场复盘：那时候该怎么补救" },
      { key: "C", text: "笑出声，那时候是真离谱" },
      { key: "D", text: "面无表情划过，早就脱敏了" },
    ],
  },
];

export const LEARNING_QUESTIONS = QUESTIONS.filter((q) => q.phase === "learning");
export const PREDICTION_QUESTIONS = QUESTIONS.filter((q) => q.phase === "prediction");

export function getQuestion(id: string): Question {
  const q = QUESTIONS.find((item) => item.id === id);
  if (!q) throw new Error(`Unknown question: ${id}`);
  return q;
}
