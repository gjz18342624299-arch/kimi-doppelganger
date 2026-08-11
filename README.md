# Kimi Doppelgänger 「Kimi 偷了一个我」

Mobile-first AI Social Game + Kimi 用户增长实验。

> Kimi 只认识你 6 道题。它能比认识你很多年的朋友更懂你吗？

核心增长路径：**PLAY → PROVE → SHARE → CLONE → UNLOCK → RETURN**

---

## 启动

```bash
npm install
npm run dev        # http://localhost:3000（可用 -- --port 7100 指定端口）
```

生产构建：

```bash
npm run build && npm start
```

## 配置 Moonshot / Kimi API

复制 `.env.example` 为 `.env.local` 并填写：

```
MOONSHOT_API_KEY=sk-...
# MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
# MOONSHOT_MODEL=kimi-k2.6（默认；kimi-k2.x 为推理模型，代码已自动用 reasoning_effort:"none" 压低延迟）
NEXT_PUBLIC_KIMI_DEEP_LINK=https://www.kimi.com/
```

API Key 只在 Server-side API Route（`src/server/moonshot.ts`）使用，不会进入前端 Bundle。

## DEMO_MODE

未配置 `MOONSHOT_API_KEY` 或 API 请求失败时，游戏自动切换到 **DEMO_MODE** 确定性预测引擎
（`src/lib/prediction.ts`，代码内已明确标注），完整流程依然可以玩。
UI 中不会出现任何"假 AI / Mock"字样。

AI 调用纪律：

- 每个创建分身的新用户：**1 次**核心 AI 调用（Q6 完成后一次性生成 Q7–Q10 盲预测）
- 好友 Challenge：**0 次** AI 调用
- MATCH / MISS：本地计算；评论：本地预设文案池
- 预测生成后立即保存，用户作答后**绝不重新生成** —— Blind Prediction 是真实的

## 数据

Demo 使用文件型 JSON 存储（`data/sessions.json` / `data/challenges.json`，见 `src/server/store.ts`），
可直接替换为 Supabase / SQLite。数据结构：

- `Session`：session_id / created_at / answers_q1_q6 / free_text_q6 / predictions_q7_q10 / answers_q7_q10 / prediction_score / doppelganger_type / traits / observation
- `Challenge`：challenge_id / owner_session_id / friend_answers / friend_score / created_at

好友打开 Challenge 时，API 只返回公开视图（owner type / score），**绝不泄露**原用户答案与 Kimi 预测。

## 埋点（`src/lib/analytics.ts`，预留）

`landing_view` `test_start` `learning_question_answered` `learning_complete`
`prediction_locked` `prediction_answered` `prediction_match` `test_complete`
`result_share_click` `challenge_open` `challenge_complete` `friend_start_own_test`
`unlock_doppelganger_click` `kimi_redirect_click`

## 增长指标定义

| 指标 | 定义 |
| --- | --- |
| Activation | Test Start → Test Complete |
| Aha | 用户至少完成一次 Blind Prediction Reveal |
| Viral | Result → Challenge Open |
| Viral Conversion | Challenge Complete → Start Own Test |
| Kimi Conversion | Result → Unlock Doppelgänger |
| Deep Activation（未来） | 进入 Kimi 后完成第一个真实 Doppelgänger Task |

## 未来 Kimi 产品能力（本 Demo 不伪造）

- **Unlock Doppelgänger**：Bottom Sheet + 记忆交接已实现：点击「在 Kimi 中唤醒我的分身」
  自动复制**分身档案**（6 道题真实答案 + Q6 原话 + 人格类型 + Traits + LIKE ME / BETTER ME
  规则，见 `src/lib/doppelgangerPrompt.ts`），跳转 Kimi 后粘贴发送即可恢复全部记忆；
  另提供「复制分身档案」与「导出 Context JSON」两个兜底入口。
  Deep Link 配置位：`NEXT_PUBLIC_KIMI_DEEP_LINK`（若 URL 含 `{q}` 占位符，会替换为
  URL 编码的分身档案，便于未来接入 Kimi 官方预填能力）。
- **LIKE ME**：按照我的性格、表达方式和决策习惯思考。
- **BETTER ME**：理解我的偏好，但帮我避免拖延 / 冲动 / 情绪化 / 重复犯错。

## 结构

```
src/
  app/
    page.tsx                 # Landing
    play/page.tsx            # 主游戏（State Machine 驱动）
    challenge/[id]/page.tsx  # 好友挑战
    api/predict              # 唯一 AI 调用入口（含 DEMO_MODE fallback）
    api/session/[id]         # 保存 Q7–Q10 真实答案与分数
    api/challenge[...]       # 创建 / 读取 / 结算挑战
  components/                # GameShell / Progress / QuestionCard / OptionButton /
                             # LearningQuestion / FreeTextQuestion / TrainingTransition /
                             # PredictionQuestion / ScoreBoard / ResultCard / ShareCard /
                             # ChallengeIntro / ChallengeGame / ChallengeResult / UnlockSheet
  hooks/useGame.ts           # 游戏状态机
  lib/                       # questions（题目配置化）/ personalityTypes（7 型枚举）/
                             # prediction（DEMO 引擎 + AI 输出清洗）/ comments / api /
                             # analytics / storage / vibrate / types
  server/                    # moonshot（服务端 AI）/ store（JSON 存储）
```

题目全部配置化在 `src/lib/questions.ts`，可自由改题 / 调序 / 扩题库 / A/B Test。
人格类型是固定枚举（GHOST / LATE / CTRL / CHAOS / PLAN / MAIN / NPC），AI 输出经
`sanitizePrediction` 严格清洗，禁止自由创造新类型。
