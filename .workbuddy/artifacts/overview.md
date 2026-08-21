# P1 差异化功能落地（第一批）· 任务总览

## 完成内容
按 P1 建议先做顺序，完成成本最低、差异化最明显的三项。

## P1-3 意图设定 + 结束反思闭环 ✅
- **开始前**：点击「开始专注」先弹意图输入（可选填写，可跳过），确认后开始
- **结束后**：专注正常完成弹反思（1-5 星打分 + 反思文字），写回 session
- 改动：`stores/timer.js`（intent/pendingReflectionId/saveReflection）、新增 `IntentDialog.vue`/`ReflectionDialog.vue`、`TimerControls.vue`、`App.vue`

## P1-4 任务估时 + 番茄绑定强化 ✅
- 任务卡显示「⏱ 约 X 分钟」（剩余番茄 × 单番茄时长）
- 计时页绑定任务后显示「还需约 X」
- 改动：`TaskItem.vue`、`TimerDisplay.vue`

## P1-5 白噪音场景化 + 每日金句 ✅
- 白噪音从单选扩为**多场景叠加混音**（雨声/海浪/森林/咖啡馆）
- 每日金句卡片按日期轮换（10 条金句库）
- 改动：`composables/useSound.js`（多场景 Map 混音）、`WhiteNoisePlayer.vue`、`constants.js`、`settings.js`、新增 `DailyQuote.vue`、`TimerView.vue`

## 验证结果
- build 0 错误 / type-check exit 0 / test 47/47
- 浏览器实测全部通过：金句显示、意图弹窗、任务估时、白噪音多选混音（localStorage 确认 `whiteNoise:["rain","waves"]`）

## 待办（P1 剩余三项）
- P1-2 热力图（中成本）
- P1-1 可视化养成物（高成本，最重磅）
- P1-6 锁机分级（中成本）
