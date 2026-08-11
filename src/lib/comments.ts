/**
 * Local preset comment pools for MATCH / MISS.
 * Never call an API for these — pick locally.
 */

export const MATCH_COMMENTS = [
  "这题不难。",
  "和我算的一样。",
  "你比你自己以为的好懂。",
  "下一题也一样。",
  "这不是猜，是计算。",
];

export const MISS_COMMENTS = [
  "行。",
  "你比我想象得麻烦一点。",
  "这题算你的。",
  "有点意思。",
  "我记下了。",
];

export function pickComment(pool: string[], seedIndex: number): string {
  return pool[Math.abs(seedIndex) % pool.length];
}
