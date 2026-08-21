# 架构决策记录（ADR）

> 记录 Focusly 番茄时钟的关键架构决策，说明「为什么这么选」。供后续维护者理解设计意图。

---

## ADR-1：计时器采用 deadline 绝对时间模式

**决策**：剩余时间由 `remaining = ceil((deadlineAt - now) / 1000)` 计算，而非每秒递减计数器。

**理由**：
- 浏览器后台标签页会节流 `setInterval`，递减计数器会漂移、丢失进度
- deadline 模式以时间戳为唯一真相，刷新恢复时按 deadline 重算即可，天然抗节流

**代价**：需要持久化 `deadlineAt` 时间戳，并处理「刷新时已过期」的补结算逻辑。

---

## ADR-2：存储分层 —— IndexedDB + localStorage

**决策**：打卡记录（checkins）、专注会话（sessions）存 IndexedDB；设置、任务、养成物等小对象存 localStorage。

**理由**：
- 打卡/会话是持续增长的大块历史数据，localStorage 有 5MB 上限
- IndexedDB 异步、无容量压力；设置/任务是高频读写的轻量对象，localStorage 同步读写更简单

**代价**：引入异步读写（`idbGet`/`idbSet`），需处理旧数据迁移。

---

## ADR-3：hash 路由模式

**决策**：使用 `createWebHashHistory` 而非 history 模式。

**理由**：项目部署在 GitHub Pages 子路径（`/nankai-focusly-pomodoro/`），hash 模式无需服务端 rewrite 配置即可刷新不 404。

---

## ADR-4：无真实后端，API 层 = Mock + 本地兜底

**决策**：API 层用 axios 封装，开发期由 `vite-plugin-mock` 拦截 `/api/*`，生产期指向 Apifox Mock；所有写操作失败时降级到 localStorage/IndexedDB 离线保存。

**理由**：课程作业/演示场景无后端部署条件，Mock + 兜底保证「打开即用、离线不丢」。

**代价**：社交等需实时通道的功能只能纯前端模拟（见 ADR-6）。

---

## ADR-5：TypeScript 渐进迁移策略

**决策**：核心逻辑层（utils/composables/api/stores）全量迁 `.ts`，`.vue` 组件渐进加 `lang="ts"`；开启 `allowImportingTsExtensions`。

**理由**：
- 核心逻辑是类型安全收益最大的部分，也是单测覆盖的部分
- 组件层类型注解成本高、收益递减，渐进推进控制风险

**技术约束**：Node 22 `node --test` 不支持 `.js → .ts` 扩展名映射，被测试链路触及的 `.ts` 文件内部互引必须写显式 `.ts` 扩展名。

---

## ADR-6：社交功能纯前端模拟

**决策**：匿名自习室、好友榜用 mock 数据 + localStorage 持久化 seed 模拟；分享卡片用 html2canvas 真实生成图片。

**理由**：无后端（见 ADR-4），社交实时性无法真实实现；用确定性 seed 保证「同一用户刷新后数据稳定」，模拟出真实感。

**代价**：无跨设备真实同步，属于演示级实现。

---

## ADR-7：测试策略 —— node --test + Playwright

**决策**：纯函数单测用 Node 内置 `node --test`（零依赖）；核心主流程用 Playwright E2E。不引入 Vitest。

**理由**：
- 纯函数单测用内置 test runner 即可，避免额外依赖与配置
- Playwright 覆盖「开始→完成→打卡→统计」主流程，保证端到端可用

---

## ADR-8：PDF/分享图用 html2canvas 栅格化

**决策**：PDF 周报、分享卡片用 html2canvas 截图 DOM 模板，再嵌入 jspdf 或直接下载 PNG；依赖动态 import。

**理由**：视觉还原度高，中文经栅格化嵌入绕开字体嵌入问题；动态 import 避免大依赖进首屏。

**技术约束**：html2canvas 不支持 CSS 变量，模板必须用字面量颜色。
