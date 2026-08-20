# Focusly 番茄时钟 — 综合改进任务（P0→P1→P2）

请按以下优先级顺序执行全部改进项，每项完成后执行 `npm run build` 验证。

---

## P0：代码质量修复（3处，立即执行）

### 1. 修复 useSound.js 冗余代码

**文件**：`src/composables/useSound.js` 第54-56行

当前对同一 oscillator 重复设置 880Hz，属无效操作：
```js
// 修复前（删除这行）
osc.frequency.setValueAtTime(880, now) // A5 更清脆
// 二次谐波增加厚度
osc.frequency.setValueAtTime(880, now)   // ← 冗余，删除此行
```

**修复**：删除第56行重复的 `osc.frequency.setValueAtTime(880, now)`。
若意图为二次谐波，应改为 `osc2.frequency.setValueAtTime(880 * 2, now)` 并创建第二个 oscillator。

### 2. 修复 TaskForm.vue 备注校验不可达 + 错误展示缺失

**文件**：`src/components/task/TaskForm.vue`

**问题**：
- `errors` reactive 对象未预声明 `note` 字段
- 模板中备注 textarea 旁无错误展示元素（title 和 plannedPomodoros 有 `.field-error` 但 note 没有）
- 虽然 `maxlength="200"` 使分支不可达，但代码不一致

**修复**：
```js
// 1. 预声明 note 字段
const errors = reactive({
  title: '',
  plannedPomodoros: '',
  note: ''  // ← 新增
})

// 2. validate() 中备注校验与错误展示一致
function validate() {
  let valid = true
  errors.title = errors.plannedPomodoros = errors.note = ''  // ← 清空 note 错误

  if (!title.trim()) {
    errors.title = '请输入任务名称'
    valid = false
  }
  if (!plannedPomodoros || plannedPomodoros < 1) {
    errors.plannedPomodoros = '请输入预计番茄数'
    valid = false
  }
  // 新增：备注超长校验（虽然 maxlength 限制，但校验逻辑应保持完整）
  if (note && note.length > 200) {
    errors.note = '备注最长200字'
    valid = false
  }
  return valid
}
```

```html
<!-- 3. 模板中添加错误展示 -->
<div class="form-row">
  <label>备注</label>
  <textarea v-model="note" maxlength="200" placeholder="可选..." rows="3"></textarea>
  <span v-if="errors.note" class="field-error">{{ errors.note }}</span>  <!-- ← 新增 -->
</div>
```

### 3. 修复 constants.js 硬编码颜色

**文件**：`src/utils/constants.js` 第115行 + `src/styles/variables.css`

**问题**：`[TASK_CATEGORY.RESEARCH]: { label: '科研', color: '#9b59b6' }` 使用硬编码裸值，违反 CSS 变量规范。

**修复**：

```css
/* variables.css 的 :root 中新增 */
:root {
  /* ... 现有变量 ... */
  --color-category-research: #9b59b6;
}

:root[data-theme='dark'] {
  /* ... 现有变量 ... */
  --color-category-research: #bb8fce;  /* 深色模式下略亮 */
}
```

```js
// constants.js 中修改
[TASK_CATEGORY.RESEARCH]: { label: '科研', color: 'var(--color-category-research)' },
```

---

## P1：无障碍支持（a11y，2-3小时）

### 1. BaseModal.vue — 焦点管理（Focus Trap）

**文件**：`src/components/common/BaseModal.vue`

**要求**：
- 打开弹窗时，将焦点移入弹窗内容区（`ref` 引用 + `.focus()`）
- 关闭弹窗时，恢复焦点到触发按钮（通过 `document.activeElement` 保存）
- `Tab` 键在弹窗内循环（焦点在最后一个 focusable 元素时按 Tab 回到第一个）
- 添加 `aria-modal="true"` 到 `.modal-overlay`
- 添加 `tabindex="-1"` 到弹窗内容容器

### 2. App.vue — Skip Link + 主内容区域

**文件**：`src/App.vue` + `src/styles/global.css`

**要求**：
- 在 `<div :class="layoutClass">` 内部最前面添加 skip link：
  ```html
  <a href="#main-content" class="skip-link">跳到主内容</a>
  ```
- 给 `<main>` 元素添加 `id="main-content"` 和 `tabindex="-1"`
- 在 `global.css` 中添加 `.skip-link` 样式：默认 `visually-hidden`（绝对定位、clip），`:focus` 时显示在页面顶部

### 3. BaseToast.vue — 屏幕阅读器通知

**文件**：`src/components/common/BaseToast.vue`

**要求**：
- Toast 容器添加 `role="status"` 和 `aria-live="polite"`
- 错误类型（type='error'）Toast 使用 `aria-live="assertive"`
- 成功/信息类型使用 `aria-live="polite"`

### 4. TaskForm.vue — 表单标签关联

**文件**：`src/components/task/TaskForm.vue`

**要求**：
- 每个 `.form-row` 的 `<label>` 添加 `for` 属性，对应 `<input>`/`<textarea>`/`<select>` 添加 `id`
- 错误提示元素（`.field-error`）添加 `role="alert"`
- 示例：
  ```html
  <label for="task-title">任务名称</label>
  <input id="task-title" v-model="title" ... />
  <span v-if="errors.title" class="field-error" role="alert">{{ errors.title }}</span>
  ```

### 5. CircularProgress.vue — SVG 无障碍

**文件**：`src/components/timer/CircularProgress.vue`

**要求**：
- SVG 根元素添加 `role="img"`
- 添加动态 `aria-label`：`aria-label="专注进度 ${Math.round(progress * 100)}%"`
- 添加 `<title>` 子元素：`当前专注进度 ${Math.round(progress * 100)}%`
- 当计时完成时 `aria-label` 更新为 "专注完成！"

### 6. TimerDisplay.vue — 计时器状态

**文件**：`src/components/timer/TimerDisplay.vue`

**要求**：
- 时间文本容器添加 `role="timer"` 和 `aria-live="off"`（频繁更新不应触发读屏）
- 模式标签（"专注中"/"休息中"/"长休息中"）添加 `aria-live="polite"`
- 轮次指示器添加 `aria-label="当前第 ${currentRound} 轮，共 ${totalRounds} 轮"`

### 7. useFocusLock.js — 快捷键可发现性

**文件**：`src/composables/useFocusLock.js` + `src/components/settings/TimerConfigForm.vue`（或新建 ShortcutsPanel.vue）

**要求**：
- 在 App.vue 的专注锁定警告弹窗中添加快捷键提示：
  ```html
  <p>紧急暂停快捷键：<kbd>Ctrl</kbd>+<kbd>P</kbd>（Mac: <kbd>Cmd</kbd>+<kbd>P</kbd>）</p>
  ```
- 在设置页添加"快捷键"区块，列出所有可用快捷键
- 新建 `src/components/common/ShortcutsPanel.vue`（可选），按 `?` 键显示全局快捷键帮助

---

## P1：单元测试（Vitest + Vue Test Utils，4-6小时）

### 1. 安装依赖

```bash
npm install -D vitest @vue/test-utils jsdom @vitest/coverage-v8
```

### 2. 更新 package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 3. 创建测试配置

**文件**：`vitest.config.js`（与 vite.config.js 同级）

```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 4. 编写测试文件

#### 4.1 `tests/stores/timer.test.js` — 计时器状态机

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTimerStore } from '@/stores/timer'

describe('TimerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('start() 后状态变为 running，remainingSeconds 正确初始化', () => {
    const store = useTimerStore()
    store.start()
    expect(store.status).toBe('running')
    expect(store.remainingSeconds).toBe(store.config.focusDuration * 60)
  })

  it('pause() 后状态变为 paused，interval 被清除', () => {
    const store = useTimerStore()
    store.start()
    store.pause()
    expect(store.status).toBe('paused')
    // 验证 interval 已清除（可通过 tick 不再减时间来验证）
    const before = store.remainingSeconds
    vi.advanceTimersByTime(1000)
    expect(store.remainingSeconds).toBe(before)
  })

  it('resume() 恢复计时', () => {
    const store = useTimerStore()
    store.start()
    store.pause()
    store.resume()
    expect(store.status).toBe('running')
    vi.advanceTimersByTime(1000)
    expect(store.remainingSeconds).toBe(store.config.focusDuration * 60 - 1)
  })

  it('reset() 恢复到初始值', () => {
    const store = useTimerStore()
    store.start()
    vi.advanceTimersByTime(5000)
    store.reset()
    expect(store.status).toBe('idle')
    expect(store.remainingSeconds).toBe(store.config.focusDuration * 60)
  })

  it('skip() 切换到下一阶段', () => {
    const store = useTimerStore()
    store.start()
    store.skip()
    expect(store.mode).toBe('break')  // 或 'longBreak'
  })

  it('tick() 每秒减 1，归零时触发 complete()', () => {
    const store = useTimerStore()
    store.config = { focusDuration: 0, breakDuration: 5, longBreakDuration: 15, roundsBeforeLongBreak: 4 }
    store.start()
    vi.advanceTimersByTime(1000)
    expect(store.status).toBe('complete')
  })

  it('轮次循环：完成 N 轮后进入长休', () => {
    const store = useTimerStore()
    store.config = { focusDuration: 0, breakDuration: 5, longBreakDuration: 15, roundsBeforeLongBreak: 4 }
    // 模拟完成 4 轮
    for (let i = 0; i < 4; i++) {
      store.start()
      vi.advanceTimersByTime(1000)
      // 完成一轮...
    }
    // 第5轮开始时应为 longBreak
  })
})
```

#### 4.2 `tests/stores/task.test.js` — 任务 CRUD

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '@/stores/task'

describe('TaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('addTask() 创建任务并写入 LocalStorage', () => {
    const store = useTaskStore()
    const task = store.addTask({ title: '测试任务', plannedPomodoros: 3 })
    expect(task.title).toBe('测试任务')
    expect(store.tasks).toHaveLength(1)
    expect(localStorage.getItem('focusly_tasks')).toContain('测试任务')
  })

  it('updateTask() 更新字段', () => {
    const store = useTaskStore()
    const task = store.addTask({ title: '旧标题', plannedPomodoros: 1 })
    store.updateTask(task.id, { title: '新标题' })
    expect(store.tasks[0].title).toBe('新标题')
  })

  it('deleteTask() 删除任务', () => {
    const store = useTaskStore()
    const task = store.addTask({ title: '待删除', plannedPomodoros: 1 })
    store.deleteTask(task.id)
    expect(store.tasks).toHaveLength(0)
  })

  it('toggleStatus() 切换状态', () => {
    const store = useTaskStore()
    const task = store.addTask({ title: '测试', plannedPomodoros: 1 })
    store.toggleStatus(task.id)
    expect(task.status).toBe('completed')
  })

  it('incrementPomodoro() 番茄数 +1', () => {
    const store = useTaskStore()
    const task = store.addTask({ title: '测试', plannedPomodoros: 2 })
    store.incrementPomodoro(task.id)
    expect(task.completedPomodoros).toBe(1)
  })

  it('filteredTasks getter 按状态筛选', () => {
    const store = useTaskStore()
    store.addTask({ title: 'A', status: 'todo' })
    store.addTask({ title: 'B', status: 'completed' })
    store.filterStatus = 'completed'
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].title).toBe('B')
  })

  it('groupedTasks getter 按日期分组', () => {
    const store = useTaskStore()
    store.addTask({ title: '今日任务', deadline: new Date().toISOString().slice(0, 10) })
    store.addTask({ title: '无期限任务' })
    expect(store.groupedTasks.today).toHaveLength(1)
    expect(store.groupedTasks.unscheduled).toHaveLength(1)
  })
})
```

#### 4.3 `tests/stores/checkin.test.js` — 打卡与连续

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckinStore } from '@/stores/checkin'

describe('CheckinStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('checkin() 首次打卡创建记录', () => {
    const store = useCheckinStore()
    store.checkin(1)
    expect(store.checkins).toHaveLength(1)
    expect(store.checkins[0].count).toBe(1)
  })

  it('checkin() 同日重复打卡累加', () => {
    const store = useCheckinStore()
    store.checkin(1)
    store.checkin(2)
    expect(store.checkins).toHaveLength(1)
    expect(store.checkins[0].count).toBe(3)
  })

  it('streak getter 连续天数计算正确', () => {
    const store = useCheckinStore()
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    store.checkins = [
      { date: today, count: 1 },
      { date: yesterday, count: 1 }
    ]
    expect(store.streak).toBe(2)
  })

  it('longestStreak getter 最长连续天数', () => {
    const store = useCheckinStore()
    const d1 = new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10)
    const d2 = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10)
    const d3 = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    store.checkins = [
      { date: d1, count: 1 },
      { date: d2, count: 1 },
      { date: d3, count: 1 }
    ]
    expect(store.longestStreak).toBe(3)
  })
})
```

#### 4.4 `tests/utils/date.test.js` — 日期工具

```js
import { describe, it, expect } from 'vitest'
import { formatDate, getTodayStr, getWeekStart, getMonthStr, isSameDay, diffDays, addDays } from '@/utils/date'

describe('date utils', () => {
  it('formatDate 格式化日期', () => {
    expect(formatDate('2024-01-15')).toBe('2024年01月15日')
  })

  it('getTodayStr 返回今天 YYYY-MM-DD', () => {
    const today = getTodayStr()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('isSameDay 判断同一天', () => {
    expect(isSameDay('2024-01-15', '2024-01-15')).toBe(true)
    expect(isSameDay('2024-01-15', '2024-01-16')).toBe(false)
  })

  it('diffDays 计算天数差', () => {
    expect(diffDays('2024-01-15', '2024-01-18')).toBe(3)
  })

  it('addDays 日期加减', () => {
    expect(addDays('2024-01-15', 3)).toBe('2024-01-18')
  })
})
```

#### 4.5 `tests/utils/format.test.js` — 格式化工具

```js
import { describe, it, expect } from 'vitest'
import { secondsToMMSS, minutesToHHMM, formatNumber } from '@/utils/format'

describe('format utils', () => {
  it('secondsToMMSS 格式化秒数', () => {
    expect(secondsToMMSS(65)).toBe('01:05')
    expect(secondsToMMSS(0)).toBe('00:00')
    expect(secondsToMMSS(3661)).toBe('61:01')
  })

  it('minutesToHHMM 格式化分钟', () => {
    expect(minutesToHHMM(125)).toBe('2小时5分钟')
  })

  it('formatNumber 格式化数字', () => {
    expect(formatNumber(1234)).toBe('1,234')
  })
})
```

#### 4.6 `tests/composables/useLocalStorage.test.js` — LocalStorage 封装

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage } from '@/composables/useLocalStorage'

describe('useLocalStorage', () => {
  const { getItem, setItem } = useLocalStorage()

  beforeEach(() => {
    localStorage.clear()
  })

  it('getItem/setItem JSON 序列化', () => {
    setItem('test', { a: 1 })
    expect(getItem('test')).toEqual({ a: 1 })
  })

  it('读取不存在的 key 返回 defaultValue', () => {
    expect(getItem('nonexistent', 'default')).toBe('default')
  })

  it('损坏 JSON 返回 defaultValue', () => {
    localStorage.setItem('bad', 'not json')
    expect(getItem('bad', 'fallback')).toBe('fallback')
  })
})
```

**Mock 策略**：
- 使用 `vi.mock()` mock API 层（不发起真实请求）
- 使用 `vi.useFakeTimers()` 控制计时器
- jsdom 自带 `localStorage` mock

---

## P1：GitHub Pages 自动部署（15分钟）

**文件**：`.github/workflows/deploy.yml`（新建）

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**配置步骤**：
1. GitHub 仓库 Settings → Pages → Source 选择 "GitHub Actions"
2. vite.config.js 的 `base` 已配置为 `/nankai-focusly-pomodoro/`，无需修改
3. 部署后访问：https://zhangligong0826.github.io/nankai-focusly-pomodoro/

---

## P1：TypeScript 迁移（8-12小时，长期规划）

### 1. 安装依赖

```bash
npm install -D typescript @vitejs/plugin-vue-jsx vue-tsc
```

### 2. 创建 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "mock/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. 创建 `src/types/index.ts`

从架构文档提取所有 TypeScript 接口：

```ts
export enum TaskStatus { TODO = 'todo', IN_PROGRESS = 'in_progress', COMPLETED = 'completed' }
export enum Priority { HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }
export enum TaskCategory { STUDY = 'study', WORK = 'work', HEALTH = 'health', LIFE = 'life', RESEARCH = 'research' }
export enum TimerMode { FOCUS = 'focus', BREAK = 'break', LONG_BREAK = 'long_break' }
export enum TimerStatus { IDLE = 'idle', RUNNING = 'running', PAUSED = 'paused', COMPLETED = 'completed' }
export enum SessionType { FOCUS = 'focus', BREAK = 'break', LONG_BREAK = 'long_break' }
export enum Theme { LIGHT = 'light', DARK = 'dark' }
export enum NoiseType { NONE = 'none', RAIN = 'rain', CAFE = 'cafe' }

export interface TimerConfig {
  focusDuration: number
  breakDuration: number
  longBreakDuration: number
  roundsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  category: TaskCategory
  plannedPomodoros: number
  completedPomodoros: number
  deadline?: string
  createdAt: string
  updatedAt: string
}

export interface Checkin {
  date: string
  count: number
}

export interface FocusSession {
  id: string
  taskId?: string
  type: SessionType
  duration: number
  startedAt: string
  completedAt: string
}

export interface Settings {
  theme: Theme
  soundEnabled: boolean
  notificationEnabled: boolean
  dailyGoal: number
  focusLockEnabled: boolean
  whiteNoise: NoiseType
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface StatsSummary {
  totalFocusMinutes: number
  totalSessions: number
  completedTasks: number
  currentStreak: number
  longestStreak: number
}

export interface StatsDataItem {
  date: string
  focusMinutes: number
  sessions: number
}
```

### 4. 逐步迁移文件（按依赖顺序）

a) `src/types/index.ts` — 所有类型定义（上面已创建）
b) `src/utils/constants.ts` — 枚举 + 默认值，添加类型注解
c) `src/utils/*.ts` — date/uuid/format/export
d) `src/composables/*.ts` — 所有组合式函数
e) `src/api/*.ts` — Axios 封装（`AxiosResponse<T>`）
f) `src/stores/*.ts` — 5 个 Pinia stores（`defineStore` 泛型）
g) `src/components/**/*.vue` — `<script setup lang="ts">`
h) `src/views/*.vue` — `<script setup lang="ts">`
i) `mock/*.ts` — Mock 数据

### 5. 更新 package.json scripts

```json
{
  "scripts": {
    "type-check": "vue-tsc --noEmit"
  }
}
```

### 6. Vue 文件迁移示例

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@/types'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'update', id: string, data: Partial<Task>): void
}>()

const isEditing = ref(false)
</script>
```

迁移完成后 `npm run build` 和 `npm run type-check` 均需通过。

---

## P2：PWA 支持（1-2小时）

### 1. 安装依赖

```bash
npm install -D vite-plugin-pwa
```

### 2. 更新 `vite.config.js`

```js
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    viteMockServe({ ... }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'sounds/*.mp3'],
      manifest: {
        name: 'Focusly 番茄时钟',
        short_name: 'Focusly',
        description: '专注学习打卡工具',
        theme_color: '#E74C3C',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/nankai-focusly-pomodoro/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts' }
          }
        ]
      }
    })
  ]
})
```

### 3. 创建 PWA 图标

**文件**：`public/pwa-192x192.png` 和 `public/pwa-512x512.png`
- 使用番茄主题图标（红色圆形 + 白色时钟图标）
- 192x192 用于主屏图标，512x512 用于启动画面
- 可用在线工具生成：https://pwa-asset-generator.com/

### 4. `src/main.js` 注册 Service Worker

```js
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // 使用 Toast 提示用户刷新
    showToast('新版本可用，请刷新页面', 'info')
  },
  onOfflineReady() {
    showToast('已可离线使用', 'success')
  }
})
```

### 5. `index.html` 添加 PWA meta

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="/nankai-focusly-pomodoro/pwa-192x192.png">
```

构建后 `dist/` 应包含 `sw.js` 和 `manifest.webmanifest`。

---

## P2：性能优化（1-2小时）

### 1. 虚拟滚动（任务列表超过 50 条时）

```bash
npm install vue-virtual-scroller
```

在 `src/components/task/TaskList.vue` 中：

```vue
<template>
  <RecycleScroller
    v-if="tasks.length > 50"
    class="scroller"
    :items="filteredTasks"
    :item-size="72"
    key-field="id"
    v-slot="{ item }"
  >
    <TaskItem :task="item" ... />
  </RecycleScroller>
  <div v-else class="task-list">
    <TaskItem v-for="task in filteredTasks" :key="task.id" :task="task" ... />
  </div>
</template>
```

### 2. 图片懒加载

所有 `<img>` 标签添加 `loading="lazy"`：
```html
<img src="/nankai-focusly-pomodoro/empty-task.svg" loading="lazy" width="120" height="120" alt="暂无任务" />
```

### 3. 资源预加载

在 `index.html` 的 `<head>` 中添加：
```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
```

### 4. 打包分析（可选）

```bash
npm install -D rollup-plugin-visualizer
```

`vite.config.js`：
```js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // ... 其他插件
    visualizer({ open: false, filename: 'stats.html' })
  ]
})
```

`npm run build` 后生成 `stats.html` 分析包体积。

---

## P2：功能增强（3-6小时，按需）

### 1. 键盘快捷键面板

**文件**：`src/composables/useKeyboardShortcuts.js`（新建）

```js
import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts(shortcuts) {
  const handler = (e) => {
    for (const [keys, action] of Object.entries(shortcuts)) {
      const parts = keys.split('+').map(s => s.trim().toLowerCase())
      const key = parts.pop()
      const ctrl = parts.includes('ctrl') || parts.includes('cmd')
      const shift = parts.includes('shift')
      const alt = parts.includes('alt')

      if (e.key.toLowerCase() === key &&
          e.ctrlKey === ctrl &&
          e.shiftKey === shift &&
          e.altKey === alt) {
        e.preventDefault()
        action(e)
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
```

**文件**：`src/components/common/ShortcutsPanel.vue`（新建）

使用 `BaseModal` 内嵌表格展示所有快捷键：

```vue
<template>
  <BaseModal :visible="visible" @close="$emit('close')" title="快捷键帮助">
    <table class="shortcuts-table">
      <tr v-for="s in shortcuts" :key="s.keys">
        <td><kbd>{{ s.keys }}</kbd></td>
        <td>{{ s.description }}</td>
      </tr>
    </table>
  </BaseModal>
</template>

<script setup>
const shortcuts = [
  { keys: 'Space', description: '开始/暂停计时' },
  { keys: 'Ctrl + P', description: '紧急暂停专注' },
  { keys: 'Ctrl + N', description: '新建任务' },
  { keys: '1 / 2 / 3 / 4', description: '切换 Tab（计时/任务/统计/设置）' },
  { keys: '?', description: '显示快捷键帮助' }
]
</script>
```

在 `App.vue` 中注册全局快捷键：

```js
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const shortcuts = {
  '?': () => showShortcutsPanel.value = true,
  '1': () => router.push('/'),
  '2': () => router.push('/tasks'),
  '3': () => router.push('/stats'),
  '4': () => router.push('/settings')
}

useKeyboardShortcuts(shortcuts)
```

### 2. 数据导入

在 `src/components/settings/DataExportPanel.vue` 中添加：

```vue
<template>
  <div class="export-panel">
    <!-- 现有导出按钮 -->
    <button class="btn-secondary" @click="importData">
      <span>导入数据</span>
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useCheckinStore } from '@/stores/checkin'
import { useSettingsStore } from '@/stores/settings'
import { useLocalStorage } from '@/composables/useLocalStorage'

const fileInput = ref(null)
const taskStore = useTaskStore()
const checkinStore = useCheckinStore()
const settingsStore = useSettingsStore()
const { setItem } = useLocalStorage()

function importData() {
  fileInput.value.click()
}

function handleFileImport(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      // 验证格式
      if (!data.version || data.version !== 'focusly-1.0') {
        throw new Error('不兼容的数据格式')
      }

      // 选择性导入（用户可勾选）
      if (data.tasks) {
        setItem('focusly_tasks', data.tasks)
        taskStore.init()
      }
      if (data.checkins) {
        setItem('focusly_checkins', data.checkins)
        checkinStore.init()
      }
      if (data.settings) {
        setItem('focusly_settings', data.settings)
        settingsStore.init()
      }

      showToast('数据导入成功', 'success')
    } catch (err) {
      showToast('导入失败：' + err.message, 'error')
    }
  }
  reader.readAsText(file)
}
</script>
```

导出 JSON 时添加 `version: 'focusly-1.0'` 字段以支持导入验证。

### 3. 任务分类占比饼图

**文件**：`src/components/stats/CategoryPieChart.vue`（新建）

```vue
<template>
  <div ref="chartRef" class="category-pie-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useTaskStore } from '@/stores/task'
import { CATEGORY_META } from '@/utils/constants'

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const chartRef = ref(null)
const taskStore = useTaskStore()

let chartInstance = null

function initChart() {
  if (!chartRef.value) return

  const data = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const count = taskStore.tasks.filter(t => t.category === key && t.status === 'completed')
      .reduce((sum, t) => sum + t.completedPomodoros, 0)
    return { name: meta.label, value: count, itemStyle: { color: meta.color } }
  }).filter(d => d.value > 0)

  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 番茄 ({d}%)' },
    legend: { top: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
      labelLine: { show: false },
      data
    }]
  })
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

watch(() => taskStore.tasks, () => initChart(), { deep: true })
</script>
```

在 `StatsView.vue` 中添加饼图 Tab：

```vue
<template>
  <div class="stats-view">
    <div class="stats-tabs">
      <button :class="{ active: activeTab === 'weekly' }" @click="activeTab = 'weekly'">周统计</button>
      <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">月统计</button>
      <button :class="{ active: activeTab === 'category' }" @click="activeTab = 'category'">分类占比</button>
    </div>

    <WeeklyChart v-if="activeTab === 'weekly'" />
    <MonthlyChart v-if="activeTab === 'monthly'" />
    <CategoryPieChart v-if="activeTab === 'category'" />
  </div>
</template>
```

---

## 验证清单

每项修改后必须执行：
- [ ] `npm run build` — 0 错误
- [ ] 浏览器验证功能正常（`npm run dev`）
- [ ] 深色模式切换无异常
- [ ] 响应式布局（移动端/平板/桌面）正常

完成所有 P0 后提交一次 commit：`git commit -m "fix: 修复3处代码质量问题"`。
完成所有 P1 后提交一次 commit：`git commit -m "feat: 添加无障碍支持、单元测试、GitHub Actions部署"`。
完成所有 P2 后提交一次 commit：`git commit -m "feat: PWA支持、性能优化、功能增强"`。
最后 `git push` 到 GitHub。

---

## 文件修改汇总

| 优先级 | 文件/目录 | 动作 | 说明 |
|--------|-----------|------|------|
| P0 | `src/composables/useSound.js` | 修改 | 删除冗余 setValueAtTime |
| P0 | `src/components/task/TaskForm.vue` | 修改 | 预声明 note 字段 + 错误展示 |
| P0 | `src/utils/constants.js` | 修改 | 硬编码颜色 → CSS 变量 |
| P0 | `src/styles/variables.css` | 修改 | 新增 --color-category-research |
| P1 | `src/components/common/BaseModal.vue` | 修改 | 焦点管理（Focus Trap） |
| P1 | `src/App.vue` | 修改 | Skip Link + 主内容区域 |
| P1 | `src/components/common/BaseToast.vue` | 修改 | aria-live + role |
| P1 | `src/components/task/TaskForm.vue` | 修改 | for/id 关联 + role="alert" |
| P1 | `src/components/timer/CircularProgress.vue` | 修改 | role="img" + aria-label |
| P1 | `src/components/timer/TimerDisplay.vue` | 修改 | role="timer" + aria-live |
| P1 | `src/composables/useFocusLock.js` | 修改 | 快捷键提示 |
| P1 | `.github/workflows/deploy.yml` | 新建 | GitHub Actions 自动部署 |
| P1 | `vitest.config.js` | 新建 | 测试配置 |
| P1 | `tests/` | 新建 | 6 个测试文件 |
| P1 | `package.json` | 修改 | 添加 test scripts |
| P1 | `tsconfig.json` | 新建 | TypeScript 配置 |
| P1 | `src/types/index.ts` | 新建 | 类型定义 |
| P1 | `src/**/*.js` → `.ts` | 重命名 | 逐步迁移（长期） |
| P1 | `src/**/*.vue` | 修改 | `<script setup lang="ts">` |
| P2 | `vite.config.js` | 修改 | 添加 VitePWA 插件 |
| P2 | `public/pwa-192x192.png` | 新建 | PWA 图标 |
| P2 | `public/pwa-512x512.png` | 新建 | PWA 图标 |
| P2 | `src/main.js` | 修改 | 注册 Service Worker |
| P2 | `index.html` | 修改 | PWA meta |
| P2 | `src/components/task/TaskList.vue` | 修改 | 虚拟滚动（>50条） |
| P2 | `src/components/settings/DataExportPanel.vue` | 修改 | 数据导入 |
| P2 | `src/utils/export.js` | 修改 | 导出添加 version 字段 |
| P2 | `src/components/stats/CategoryPieChart.vue` | 新建 | 分类饼图 |
| P2 | `src/views/StatsView.vue` | 修改 | 添加分类 Tab |
| P2 | `src/composables/useKeyboardShortcuts.js` | 新建 | 快捷键管理 |
| P2 | `src/components/common/ShortcutsPanel.vue` | 新建 | 快捷键面板 |
| P2 | `src/App.vue` | 修改 | 注册全局快捷键 |
| P2 | `index.html` | 修改 | 预连接资源 |
| P2 | `vite.config.js` | 修改 | 添加 visualizer（可选） |
