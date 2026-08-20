/**
 * 全局类型定义
 * @module types
 * @description 全项目共享的 TypeScript 接口 / 枚举 / 类型别名；
 *   与 src/utils/constants.js 中的运行时枚举值保持一一对应
 */

// ==================== 枚举 ====================

/** 任务状态 */
export type TaskStatus = 'todo' | 'doing' | 'done'

/** 任务优先级 */
export type Priority = 'high' | 'medium' | 'low'

/** 任务分类 */
export type TaskCategory = 'professional' | 'english' | 'research' | 'other'

/** 计时模式 */
export type TimerMode = 'focus' | 'short_break' | 'long_break'

/** 计时器运行状态 */
export type TimerStatus = 'idle' | 'running' | 'paused'

/** 专注会话类型 */
export type SessionType = 'focus' | 'short_break' | 'long_break'

/** 主题模式 */
export type Theme = 'light' | 'dark'

/** 白噪音类型 */
export type NoiseType = 'none' | 'rain' | 'cafe' | 'silence'

/** 任务视图模式 */
export type TaskViewMode = 'list' | 'group'

/** 任务筛选条件 */
export type TaskFilter = 'all' | 'todo' | 'doing' | 'done'

// ==================== 核心实体 ====================

/** 计时器配置 */
export interface TimerConfig {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  soundEnabled: boolean
  notificationEnabled: boolean
  autoStartBreak: boolean
  autoStartFocus: boolean
}

/** 应用设置 */
export interface Settings {
  theme: Theme
  whiteNoise: NoiseType
  whiteNoiseVolume: number
  dailyGoal: number
  focusLock: boolean
}

/** 任务 */
export interface Task {
  id: string
  title: string
  note: string
  status: TaskStatus
  plannedPomodoros: number
  completedPomodoros: number
  category: TaskCategory
  priority: Priority
  dueDate: string | null
  createdAt: number
  updatedAt: number
  finishedAt: number | null
}

/** 每日打卡记录 */
export interface Checkin {
  date: string
  firstCheckinAt: number
  pomodoroCount: number
  totalMinutes: number
}

/** 专注会话记录 */
export interface FocusSession {
  id: string
  taskId: string | null
  taskTitle?: string
  startedAt: number
  endedAt: number
  durationMinutes: number
  type: SessionType
  completed: boolean
}

// ==================== API ====================

/** 统一 API 响应信封 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

/** 分页列表响应 */
export interface PagedList<T> {
  list: T[]
  total?: number
}

// ==================== 统计 ====================

/** 统计概览 */
export interface StatsSummary {
  totalFocusMinutes: number
  totalSessions: number
  completedTasks: number
  currentStreak: number
  longestStreak: number
}

/** 单日统计项 */
export interface StatsDataItem {
  date: string
  focusMinutes: number
  pomodoroCount: number
}

// ==================== 数据导出 ====================

/** 导出数据载荷（导入时校验版本） */
export interface ExportPayload {
  version: string
  exportedAt: string
  range: 'all' | 'month'
  timerConfig: TimerConfig
  settings: Settings
  tasks: Task[]
  checkins: Checkin[]
  sessions: FocusSession[]
}
