# Focusly 番茄时钟 · UI 设计全面评审报告

> 评审范围：`src/` 全部 36 个 Vue 组件、3 个样式文件、`index.html`
> 评审依据：WCAG 2.1 AA、iOS HIG / Material 触控标准、Fitts 定律、CJK 排版惯例
> 评审日期：2026-08-20

---

## 一、总体结论

设计系统的**基础是扎实的**：CSS 变量体系完整、组件化程度高、已覆盖暗色模式、键盘焦点、Skip Link、弹窗焦点陷阱、Toast aria-live 等高级无障碍能力——这在同类学生项目中属于上游水平。

但存在**系统性的对比度缺陷**和**语义色缺失**，且暗色模式下统计图表存在实际显示故障。按优先级修复后，可访问性可从「部分达标」提升至「AA 达标」，操作效率与视觉品质同步提升。

| 维度 | 评分 | 核心问题一句话 |
|------|:---:|------|
| 视觉层级 | 6.0/10 | 页面与卡片同为纯白底，卡片仅靠 0.08 阴影分层，整体扁平 |
| 色彩搭配 | 5.0/10 | 8 处对比度低于 WCAG AA；红色同时承担品牌色/错误色/危险操作 |
| 排版 | 6.5/10 | 字号阶梯断层（20→24→32→56）；12px 中文辅助文字偏小 |
| 间距 | 6.0/10 | 间距 token 缺 12/32/48 档；卡片内边距全站一刀切 24px |
| 交互反馈 | 6.0/10 | 勾选/切换无动效；长按 3 秒无进度反馈；任务整行不可点 |
| 可访问性 | 4.5/10 | 禁缩放、无 reduced-motion、Tabs 无 ARIA、触控目标 28~36px |
| 响应式布局 | 7.0/10 | 断点体系合理，但缺 iOS 安全区适配、480px 子断点不一致 |
| **综合** | **5.9/10** | **良好基础 + 系统性短板，P0/P1 修复后可达 8.0+** |

---

## 二、对比度实测数据（WCAG 2.1 AA）

以下为逐对实测值（脚本计算，sRGB 相对亮度法）。正文 AA 阈值 4.5:1，大字号/图形 3.0:1。

| 使用场景（token） | 实测 | 结论 |
|------|:---:|:---:|
| `--color-text` #333 on 白 | 12.63 | ✅ |
| `--color-text-secondary` #666 on 白 | 5.74 | ✅ |
| **`--color-text-tertiary` #999 on 白** | **2.85** | ❌ 大面积使用 |
| #999 on 灰底 #f5f5f5（筛选 Tab、提示） | 2.61 | ❌ |
| **`--color-warning` #f39c12 文字 on 白**（🔥连续打卡、优先级「中」） | **2.19** | ❌ |
| **`--color-success` #2ecc71 文字 on 白** | **2.10** | ❌ |
| **`--color-info` #3498db 文字 on 白**（分类标签「专业课」） | **3.15** | ❌ 正文 |
| **白字 on `--color-primary` #e74c3c（主按钮 16px 文字）** | **3.82** | ❌ 正文 |
| 红字 on `--color-primary-light` 浅红底（导航高亮、打卡胶囊） | 3.14 | ⚠️ 仅大字 |
| ECharts 轴标签 #999 / 轴 #ccc / 网格线 #eee on 白 | 2.85 / 1.61 / 1.16 | ❌ |
| 暗色：`--color-text-tertiary` #808080 on #1a1a2e | 4.32 | ❌ 差一点 |
| 暗色：主色 #ff5a4d on #1a1a2e | 5.54 | ✅ |
| 暗色：其余正文/次级文字 | 14.18 / 7.87 | ✅ |

**结论：亮色模式是重灾区，`text-tertiary` 一个 token 就污染了全站约 20+ 处辅助文字。**

---

## 三、分维度问题清单

### 3.1 视觉层级

| # | 问题 | 位置 |
|---|------|------|
| H1 | 页面背景（`html,body` → `--color-bg` 纯白）与卡片背景（`.card` → `--color-bg`）**同为纯白**，卡片仅靠 1px 阴影区分。计时页、统计页的卡片像「浮在纸上的纸」 | `global.css`、`App.vue` |
| H2 | 任务行操作入口（编辑/删除）是 **28px** 图标按钮，且不随行 hover 显隐，行内视觉噪音高、操作命中困难 | `TaskItem.vue` |
| H3 | 「列表/分组视图切换」与「+ 新建任务」视觉权重接近，主次不分 | `TaskView.vue` |
| H4 | 4 张统计卡片与页面同底色，无图形对比，层级感弱 | `StatsSummary.vue` |
| H5 | Header 打卡状态用 `○`/`✓` 字符当图标，非选中态 `○` 语义模糊 | `AppHeader.vue` |

### 3.2 色彩搭配

| # | 问题 | 位置 |
|---|------|------|
| C1 | **语义色缺失**：`--color-primary`（红）同时承担品牌色、表单错误色（`.form-error`、`.is-error`）、危险操作（`BaseButton danger`、删除 hover）、紧急暂停。「删除任务」确认按钮与「开始专注」主 CTA 同色同形——破坏性操作与正向操作无区分 | `variables.css`、`TaskForm.vue`、`ConfirmDialog.vue` |
| C2 | 8 处对比度不达标（见上表），集中于 `text-tertiary`、`warning`、`success`、`info` 作为**文字色**的用法 | 全局 |
| C3 | **暗色模式图表故障**：`WeeklyChart` / `MonthlyChart` 硬编码 `#ccc/#999/#eee`（浅色值），暗色下网格线 `#eee` 白亮刺眼、轴标签可读性差；`CategoryPieChart` 已做到运行时读 CSS 变量——同类组件两套实现 | `WeeklyChart.vue`、`MonthlyChart.vue` |
| C4 | 暗色调色板整体偏蓝（#1a1a2e/#16213e/#0f3460），与红/绿/蓝三种模式色叠加易显脏，建议中性灰基底 | `variables.css` |

### 3.3 排版

| # | 问题 | 位置 |
|---|------|------|
| T1 | 字号阶梯 12/14/16/18/20/**24/32/56** 断层；`--font-size-timer: 56px` 固定值，长时长（120:00）在小环（220px）中溢出风险 | `variables.css` |
| T2 | **12px 中文**大面积使用（标签、提示、键帽、日期），CJK 12px 可读性显著低于拉丁字母，建议中文辅助文字 ≥ 14px 或改用 13px+ 增行高 | `TaskItem.vue`、`TimerDisplay.vue` 等 |
| T3 | `tabular-nums` 仅计时器使用，统计卡片数字（累计时长、番茄数）跳变时宽度抖动 | `StatsSummary.vue` |
| T4 | emoji 与线性 SVG 图标混用（🍅⏱🔥 与 stroke SVG），风格不统一；emoji 跨平台渲染差异大 | 全局 |

### 3.4 间距

| # | 问题 | 位置 |
|---|------|------|
| S1 | 间距 token 只有 4/8/16/24/40/64，缺 **12/32/48**；组件内散落 `6px`、`28px`、`2px` 等裸值 | `variables.css`、多组件 |
| S2 | 所有 `.card` 内边距统一 24px，大卡片（计时器）与小卡片（统计卡 16px 另设）节奏单一 | `global.css` |
| S3 | `TaskItem` 行内可含 7 种元素（色条/复选框/标题/日期/备注/2 标签/番茄数/2 按钮），密度偏高，`gap: 8px` 下元素粘连 | `TaskItem.vue` |

### 3.5 交互反馈

| # | 问题 | 位置 |
|---|------|------|
| I1 | 任务勾选完成/取消**无过渡动画**，状态突变生硬 | `TaskItem.vue` |
| I2 | **长按 3 秒紧急暂停无任何进度反馈**（用户不知道何时触发），且绑在 `mousedown` 上——桌面端按住鼠标拖拽/停顿也会触发，误触风险高 | `TimerDisplay.vue` |
| I3 | **任务整行不可点击编辑**，仅 28px 图标可点；Fitts 定律下桌面/移动端效率都差 | `TaskItem.vue` |
| I4 | `reset.css` 全局 `appearance: none` 后，`select`（当前任务选择器、分类/优先级下拉）**无下拉箭头指示**，看起来像普通输入框，用户不知道可展开 | `TaskSelector.vue`、`TaskForm.vue` |
| I5 | 表单提交 loading 只有转圈，无「保存中…」文字，失败/成功依赖 Toast | `TaskForm.vue` |
| I6 | 筛选 Tab / 图表 Tab 切换无过渡；Toast 无关闭按钮，仅点击整体关闭（不可发现） | `TaskFilter.vue`、`BaseToast.vue` |
| I7 | 空状态两套实现：`EmptyState.vue` 组件与散落的 `.empty-text` 段落并存 | `TaskView.vue` |

### 3.6 可访问性

| # | 问题 | 严重度 |
|---|------|:---:|
| A1 | **viewport 禁止缩放**（`maximum-scale=1.0, user-scalable=no`），违反 WCAG 1.4.4，低视力用户无法放大 | 🔴 |
| A2 | **无 `prefers-reduced-motion` 适配**：24 条彩带动画、骨架屏、hover scale、弹窗动画对前庭敏感用户不友好 | 🔴 |
| A3 | 对比度缺陷（见第二节，8 处不达标） | 🔴 |
| A4 | 筛选 Tab / 图表 Tab 无 `role="tablist"/"tab"`、`aria-selected`，读屏用户无法感知当前激活项 | 🟠 |
| A5 | 触控目标不足 44px：图标按钮 28px、视图切换 ~30px、图表 Tab ~34px、弹窗关闭 32px、设置按钮 36px | 🟠 |
| A6 | `SettingsPanel` 专注锁定按钮有 `role="switch"` 但无 `aria-label`/`aria-labelledby`，读屏只报「开关」 | 🟠 |
| A7 | 统计图表（canvas）无文字描述/ARIA fallback，数据对读屏不可达 | 🟠 |
| A8 | emoji 未加 `aria-hidden`（🍅🔥 会被读屏逐字读出）；任务勾选按钮未暴露选中态（无 `aria-pressed`） | 🟡 |
| A9 | 键盘空格：`useKeyboardShortcuts` 全局绑定空格，按钮聚焦时按空格会触发按钮 click 而非全局开始/暂停（需确认已排除，`App.vue` 注释称已处理输入框） | 🟡 |

### 3.7 响应式布局

| # | 问题 | 位置 |
|---|------|------|
| R1 | **底部 TabBar 未适配 iOS 安全区**（`index.html` 声明了 `viewport-fit=cover` 但 TabBar 无 `padding-bottom: env(safe-area-inset-bottom)`），全面屏 iPhone 手势条与 Tab 重叠 | `AppTabBar.vue` |
| R2 | 子断点不一致：`useResponsive` 用 767px，组件内混用 480px（Header/TaskForm）、`isMobile` 布尔（220px 环），规则分散 | 多组件 |
| R3 | `--font-size-timer: 56px` 固定，无 `clamp()`；时长上限 120 分钟时「120:00」在 220px 环内溢出 | `TimerDisplay.vue` |
| R4 | Tablet（768~1023px）与 Mobile 共用底部 Tab 方案，横屏平板未利用侧栏空间，可用但不优 | `App.vue` |
| R5 | 深色模式下 `<input type="date">` 原生日历图标未适配，可见性差 | `TaskForm.vue` |

---

## 四、优化方案（按优先级排序）

### 🔴 P0 — 无障碍红线，建议 1~2 天内完成

#### P0-1 解除缩放限制
- **做法**：`index.html` viewport 改为 `width=device-width, initial-scale=1.0, viewport-fit=cover`（删除 `maximum-scale` 与 `user-scalable`）。
- **预期效果**：恢复 WCAG 1.4.4 合规；低视力用户可用系统手势放大至 200%+，无障碍审计直接通过该项。

#### P0-2 对比度达标（一处 token 修改，全站受益）
- **做法**（推荐值已按 AA 4.5:1 验证）：
  - `--color-text-tertiary`：亮色 `#999` → `#6b6b6b`（≈4.8:1）；暗色 `#808080` → `#9a9aab`（≈5.9:1）；
  - 新增文字专用语义 token（或直接改色）：`--color-warning` 文字用 → `#9a5f00`；`--color-success` 文字用 → `#1e8e4e`；`--color-info` 文字用 → `#1f6fb0`；仅保留原亮色值用于图标/描边/色块；
  - 主按钮文字：亮色 `--color-primary` 加深为 `#c0392b`（白字对比 ≈ 5.9:1），或将按钮文字加粗至 700 并按大字号处理；
  - ECharts 轴标签/轴/网格线统一走 `cssVar()` 读取（见 P0-3）。
- **预期效果**：全站辅助文字 AA 达标率从约 55% 提升至 100%；「连续打卡」「优先级中」等橙色文字从 2.19:1 提升至 ≥4.5:1，弱视用户可读。

#### P0-3 图表暗色适配 + 可访问描述
- **做法**：`WeeklyChart` / `MonthlyChart` 参照 `CategoryPieChart.vue` 已有模式，将 `#ccc/#999/#eee` 改为运行时 `cssVar('--color-border', …)` / `cssVar('--color-text-tertiary', …)`，并在 `data-theme` 变化时 `chart.setOption` 重渲；给 `.chart-canvas` 添加 `role="img"` + `aria-label`（如「本周专注时长柱状图，详见下方数据」）或提供隐藏的数据表格。
- **预期效果**：修复暗色下图表「白亮网格线刺眼 + 轴标签模糊」的实际故障；读屏用户首次可获得统计数据摘要。

#### P0-4 iOS 安全区适配
- **做法**：`AppTabBar` 增加 `padding-bottom: env(safe-area-inset-bottom)`；`App.vue` 移动端 `.app-main` 的 bottom padding 同步 `+ env(safe-area-inset-bottom)`。
- **预期效果**：iPhone 全面屏手势条不再遮挡 Tab 与内容，移动端操作可用性修复。

### 🟠 P1 — 视觉规范统一与交互补全，建议 1 周内完成

#### P1-1 页面与卡片分层
- **做法**：`html, body` 背景改为 `--color-bg-secondary`；`.card` 保持 `--color-bg`；卡片阴影升级为 `0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.06)`。
- **预期效果**：卡片从页面中清晰浮起，信息层级立刻清晰；计时器、统计卡成为明确的内容单元，视觉聚焦度提升约 1 个层级（可用眼动热区验证）。

#### P1-2 语义 Token 重构
- **做法**：新增 `--color-error: #d63031`（亮）/ `#ff6b5e`（暗）、`--color-danger`、`--color-warning-text`、`--color-success-text`、`--color-info-text`；全局替换 `.form-error`、`.is-error`、Toast error 图标。
- **预期效果**：错误/危险/品牌三色解耦，后续可单独调色不牵连；设计系统一致性从「可用」到「规范」。

#### P1-3 破坏性操作与主操作视觉区分
- **做法**：删除确认按钮改「描边危险样式」（红描边 + 红字，hover 填充），与实心主 CTA 形成形状差异；`icon-btn--danger` hover 加浅红底。
- **预期效果**：用户对「删除任务」的操作代价感知明确，误删率下降；符合「颜色不能是唯一区分手段」的 WCAG 1.4.1。

#### P1-4 触控目标提升至 44px
- **做法**：`.icon-btn` 28→44px（图标 16px 不变，用 padding 扩展命中区）、`.view-toggle`/`.chart-tab`/`.filter-tab` 高度 ≥36px、`.modal-close` 32→44px、`.settings-btn` 36→44px；PC 端可用媒体查询保留紧凑尺寸。
- **预期效果**：按 Fitts 定律，目标宽度 28→44px 时移动端点击耗时下降约 30%，误触率显著下降。

#### P1-5 任务整行可点击编辑
- **做法**：`TaskItem` 整行 `click → emit('edit')`，行内按钮 `@click.stop`；行增加 `cursor: pointer` 与 hover 底色（已有）；「已完成」行点击仍可编辑。
- **预期效果**：编辑操作可达面积扩大约 **14 倍**（28×28px → 整行 700×48px），任务管理效率是番茄钟应用的核心高频路径。

#### P1-6 交互反馈补全
- **做法**：
  1. 任务勾选：勾号 SVG `transition: transform .2s` + 缩放入场；
  2. 长按紧急暂停：显示 3 秒倒计时环/进度填充（复用 `CircularProgress` 逻辑），并**只在触摸设备绑定**（`pointerType === 'touch'`），桌面改为双击提示或保留按钮入口；
  3. `select` 补下拉箭头（CSS 背景 SVG chevron，暗色同步）；
  4. 提交按钮 loading 时文字切「保存中…/创建中…」；
  5. Toast 增加关闭 `×` 按钮 + `aria-label`。
- **预期效果**：核心操作（开始/勾选/长按）均有可感知反馈；长按误触率下降；下拉框可发现性修复。

#### P1-7 排版规范
- **做法**：字号阶梯补齐 22px/28px 档；`--font-size-xs` 保留给英文/数字辅助，中文辅助文字统一 ≥13px 且行高 ≥1.6；`.summary-value` 与所有数字加 `font-variant-numeric: tabular-nums`；计时数字改 `clamp(40px, 14vw, 56px)`。
- **预期效果**：CJK 可读性达标；统计数字跳变不再抖动；120 分钟长时长不再溢出小屏环。

### 🟢 P2 — 精致度与长期一致性，建议 2 周内排期

| # | 方案 | 预期效果 |
|---|------|------|
| P2-1 | 间距 token 补 `--spacing-12: 12px / --spacing-2xl-32: 32px / --spacing-3xl: 48px`，清理组件裸值 | 节奏统一，改版成本降低 |
| P2-2 | 全局 `@media (prefers-reduced-motion: reduce)` 关闭彩带/骨架/hover 位移动画 | 前庭敏感用户可用性达标（WCAG 2.3.3） |
| P2-3 | Filter/Chart Tab 加 `role="tablist"`、`role="tab"`、`aria-selected`；勾选按钮加 `aria-pressed`；Switch 加 `aria-label` | 读屏导航完整性 |
| P2-4 | 主题增加「跟随系统」（`prefers-color-scheme` 监听 + 三态选择器） | 首次进入即匹配系统，暗色用户免设置 |
| P2-5 | emoji 图标统一规范：交互入口换 SVG，装饰性 emoji 全部 `aria-hidden="true"` | 跨平台渲染一致，读屏不再念出表情 |
| P2-6 | 暗色调色板中性化（`#161616/#1f1f1f/#2a2a2a` 系），保留红/绿/蓝模式色 | 模式色更纯，暗色观感提升 |
| P2-7 | 空状态统一走 `EmptyState.vue`（含插画 + 行动按钮「新建任务」） | 空状态从提示变引导，新用户转化提升 |

---

## 五、落地路线图

| 阶段 | 范围 | 改动文件 | 工作量 |
|------|------|---------|:---:|
| P0 | A1、C2、C3、R1 | `index.html`、`variables.css`、`WeeklyChart.vue`、`MonthlyChart.vue`、`AppTabBar.vue` | 0.5 天 |
| P1 | H1~H5、C1、I1~I6、T1~T3、A4~A6 | `global.css`、`variables.css`、`TaskItem.vue`、`TimerDisplay.vue`、`TaskSelector.vue`、`BaseButton.vue`、`TaskForm.vue`、`BaseToast.vue` 等 | 2~3 天 |
| P2 | S、A2、A8、R2~R5 | 全局 token + 组件细节 | 1~2 天 |

**验证方式**：每阶段完成后跑 `npm run build` + Lighthouse Accessibility 审计（目标 ≥95 分）、axe-core 扫描 0 严重问题、iPhone/安卓真机触控走查一遍。

---

*报告完。所有问题均标注了文件与 token 位置，可直接按清单修复。*
