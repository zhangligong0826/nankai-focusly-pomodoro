# Focusly UI 优化落地记录（2026-08-21）

> 依据《ui-review-report.md》评审结论，完成 P0 + P1 + P2 全部修改。
> 验证：构建 0 错误 / 单测 43/43 通过 / type-check exit 0 / 全站对比度实测 0 FAIL。

## 修改清单（按优先级）

### 🔴 P0 — 无障碍红线
| 项 | 改动 | 文件 |
|----|------|------|
| 解除缩放限制 | viewport 删除 `maximum-scale` / `user-scalable=no` | `index.html` |
| 对比度 token 重构 | `text-tertiary` #999→#6e6e6e（5.10:1）；新增 `-text` 文字档语义色（warning/success/info）、`--color-error`、`--color-action`（主按钮白字 5.44:1）、`--color-primary-text`（导航/Logo 6.62:1） | `variables.css` + 全站组件 |
| 图表暗色适配 | Weekly/Monthly 柱状图硬编码 `#ccc/#999/#eee` → 运行时 `cssVar()` 读取，监听主题切换重渲；三个图表全部加 `role="img"` + `aria-label` | `WeeklyChart.vue`、`MonthlyChart.vue`、`CategoryPieChart.vue` |
| iOS 安全区 | TabBar 与主内容区加 `env(safe-area-inset-bottom)` | `AppTabBar.vue`、`App.vue` |

### 🟠 P1 — 视觉规范与交互
| 项 | 改动 | 文件 |
|----|------|------|
| 页面/卡片分层 | body 底色改 `--color-bg-secondary`，白色卡片浮起；阴影升级双层 | `global.css` |
| 危险操作区分 | BaseButton danger 改描边红样式（形状+颜色双重区分）；icon-btn--danger hover 加浅红底 | `BaseButton.vue`、`TaskItem.vue` |
| 44px 触控目标 | `--touch-target-min: 44px` token；icon-btn/modal-close/settings-btn/tab/switch 触屏放大（`pointer: coarse`），PC 保持紧凑 | 多组件 |
| 任务整行可点编辑 | TaskItem 整行 click → 编辑，行内按钮 `stop` 冒泡 | `TaskItem.vue` |
| 交互反馈 | 勾选勾号弹入动画；长按紧急暂停改仅触摸设备 + 3 秒进度条提示；select 全局补下拉箭头（SVG data-URI，暗色适配）；提交按钮「保存中…」文字；Toast 加关闭按钮 | `TaskItem.vue`、`TimerDisplay.vue`、`global.css`、`TaskForm.vue`、`BaseToast.vue` |
| 排版 | 计时字号改 `clamp(40px,13vw,56px)`；`.tnum` 等宽数字类应用于统计/番茄计数 | `variables.css`、`StatsSummary.vue` 等 |

### 🟢 P2 — 精致度与一致性
| 项 | 改动 | 文件 |
|----|------|------|
| 间距 token | 补 `--spacing-12/32/48`，替换组件裸值 | `variables.css` 等 |
| reduced-motion | 全局 `@media (prefers-reduced-motion: reduce)` 关闭动画 | `global.css` |
| Tab ARIA | 筛选/图表 Tab 加 `role=tablist/tab` + `aria-selected`；白噪音选项加 `aria-pressed`；全部 switch 补 `aria-label`；表单 label 全部 `for` 关联 | `TaskFilter.vue`、`StatsView.vue`、`WhiteNoisePlayer.vue`、`TimerConfigForm.vue`、`SettingsPanel.vue` |
| 跟随系统主题 | 新增 `THEME.SYSTEM`，ThemeToggle 升级三态选择器（浅色/深色/跟随系统），监听系统变化自动切换；默认设置改 system | `constants.js`、`settings.js`、`ThemeToggle.vue` |
| emoji 治理 | 装饰性 emoji 全部 `aria-hidden` | 多组件 |
| 暗色中性化 | 暗色底改中性灰 `#1c1c22/#26262e/#30303a`，替代偏蓝调 | `variables.css` |
| 空状态统一 | TaskView 分组空态统一走 EmptyState（插画 + 行动按钮） | `TaskView.vue` |

## 最终对比度验收（实测 0 FAIL）
- 亮色：正文 12.63 / 次级 7.00 / 三级 5.10（灰底 4.68）/ 语义文字档 4.85~5.38 / 主按钮 5.44 / 导航高亮 5.45
- 深色：正文 14.09 / 次级 8.60 / 三级 6.12 / 语义文字档 6.07~9.56 / 主按钮 5.51

## 注意
- `--color-primary`（#e74c3c）保留为**图形/大字号专用**（3.82:1，AA 大字达标）；文字场景一律用 `--color-primary-text`。
- 长按紧急暂停桌面端已移除（有 Ctrl/Cmd+P 快捷键），提示文案仅触屏显示。
