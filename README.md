# Focusly 番茄时钟

> 专注学习打卡工具 · 为研究生与大学生自习人群打造

一款集番茄计时、学习任务管理、每日打卡、数据统计于一体的轻量化单页 Web 应用。极简、无广告、打开即用。

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

## 已知限制与 P2 路线图

- P2：用户登录与云端同步、学习周报 PDF、多端同步、好友打卡榜、自定义皮肤、拖拽排序
