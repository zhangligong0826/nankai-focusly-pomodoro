# Focusly 番茄时钟

> 专注学习打卡工具 · 为研究生与大学生自习人群打造

一款集番茄计时、任务管理、专注养成、数据复盘、轻社交于一体的轻量化单页 Web 应用。极简、无广告、打开即用。

## ✨ 核心功能

- **🍅 番茄专注计时**：自定义时长、自动循环、三重提醒、deadline 精确计时（后台不漂移）
- **📝 学习任务管理**：增删改查、分类标签、优先级、番茄绑定、任务估时
- **📊 多级数据统计**：日/周/月/年报告、GitHub 风格热力图、高效时段建议、分类占比
- **🌱 专注养成物**：专注时长兑换虚拟花园成长，连续打卡解锁品种，中断导致枯萎
- **🎯 意图复盘闭环**：专注前设定目标，结束后反思打分
- **🔊 白噪音场景化**：雨声/海浪/森林/咖啡馆多场景混音 + 每日金句
- **🔒 锁机分级**：软提醒/强锁两级学霸模式
- **👥 轻社交**：匿名自习室陪学、好友专注时长榜
- **📤 数据导出**：学习周报 PDF、专注分享卡片、JSON/CSV
- **📱 PWA 支持**：可安装到主屏、离线可用、跟随系统深色模式

## 🛠 技术亮点

| 领域 | 技术 |
|------|------|
| 前端框架 | Vue 3（Composition API）+ TypeScript 渐进迁移 |
| 状态管理 | Pinia |
| 构建工具 | Vite 5 + PWA 插件 |
| 数据可视化 | ECharts 5（按需引入） |
| 存储 | IndexedDB（历史数据）+ localStorage（轻量对象）分层 |
| 导出 | html2canvas + jsPDF（动态 import 分包） |
| 测试 | Node test（纯函数单测）+ Playwright（E2E） |
| 工程化 | 架构决策文档 + GitHub Actions CI（build/test/type-check 门禁） |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4.21 | 核心框架（Composition API） |
| Vite | ^5.2.0 | 构建工具 + 开发服务器 |
| Pinia | ^2.1.7 | 状态管理 |
| Vue Router | ^4.3.0 | SPA 路由（hash 模式） |
| Axios | ^1.6.8 | HTTP 请求 + 拦截器 |
| ECharts | ^5.5.0 | 数据可视化 |
| vite-plugin-mock | ^3.0.2 | 本地 Mock 服务 |
| mockjs | ^1.1.0 | Mock 数据生成 |
| html2canvas | ^1.4.1 | 截图（PDF/分享图） |
| jsPDF | ^2.5.2 | PDF 生成 |
| TypeScript | ^5.7.3 | 类型检查（vue-tsc） |

## 环境要求

- Node.js ≥ 18
- npm ≥ 9（或 pnpm / yarn 等效）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（含本地 Mock，端口 5173）
npm run dev

# 构建生产产物
npm run build

# 本地预览构建产物
npm run preview
```

## 目录结构

```
focusly-pomodoro-timer/
├── index.html              # HTML 入口
├── package.json
├── vite.config.js
├── mock/                   # 本地 Mock（对齐 Apifox）
├── public/
│   ├── favicon.svg
│   └── sounds/             # 音频资源（提示音 / 白噪音占位）
└── src/
    ├── api/                # API 层（Axios 封装 + LocalStorage 兜底）
    ├── assets/             # 静态资源
    ├── components/         # 组件（common/timer/task/checkin/stats/settings）
    ├── composables/        # 组合式函数
    ├── router/             # 路由
    ├── stores/             # Pinia 状态管理
    ├── styles/             # 全局样式（variables/reset/global）
    ├── utils/              # 工具类
    ├── views/              # 页面级视图
    ├── App.vue
    └── main.js
```

## 数据与兜底策略

- **API 优先**：所有写操作先调用 Mock RESTful 接口
- **LocalStorage 兜底**：请求失败时离线写入，刷新不丢数据
- **Toast 提示**：异常时提示「网络异常，已离线保存」

LocalStorage 键名前缀统一为 `focusly_`。

## Mock 服务说明

- 开发期由 `vite-plugin-mock` 拦截 `/api/*` 请求，与 Apifox Mock 定义保持一致
- Mock 文件位于 `mock/` 目录，使用内存 Map 模拟 CRUD
- 生产期 `baseURL` 可指向 Apifox Mock 地址（本期无真实后端）

## GitHub Pages 部署

```bash
npm run build
# 将 dist/ 部署到 gh-pages 分支
# base 路径已配置为 /nankai-focusly-pomodoro/
```

## 功能清单

### P0 核心功能
- 番茄专注计时（自定义时长、开始/暂停/继续/重置/跳过、自动循环、三重提醒）
- 学习任务清单（增删改查、状态切换、绑定番茄、排序筛选）
- 每日学习打卡（完成番茄自动打卡、按日去重、首页状态展示）
- 数据可视化统计（周/月柱状图、累计指标卡片、ECharts 响应式）

### P1 增强功能
- 任务分类标签 / 优先级 / 日期分组
- 白噪音播放
- 专注锁定模式
- 连续打卡 Streak
- 每日目标与达成庆祝
- 数据导出（JSON / CSV）
- 深色模式

### P2 数据复盘
- 日/周/月/年多级报告
- 日历热力图 + 高效时段建议
- 学习周报 PDF 导出

### P3 社交
- 匿名自习室陪学
- 好友专注时长榜
- 专注分享卡片

### P4 工程化
- TypeScript 核心层迁移
- 测试金字塔（Node test + Playwright E2E）
- 架构决策文档 + CI 门禁

## 架构决策

关键设计决策记录于 [ARCHITECTURE-DECISIONS.md](./ARCHITECTURE-DECISIONS.md)，涵盖计时 deadline 模式、存储分层、hash 路由、Mock 策略、TS 渐进迁移、纯前端社交等。
