/**
 * 常量定义 - 枚举 / 默认值 / LocalStorage Key / 颜色 / API 码
 * @module utils/constants
 * @description 全局共享常量，所有模块通过此文件引用，禁止裸值散落
 */

// ==================== 枚举类型 ====================

/** 任务状态 */
export const TASK_STATUS = Object.freeze({
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
})

/** 任务优先级（P1-2） */
export const PRIORITY = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
})

/** 任务分类（P1-1） */
export const TASK_CATEGORY = Object.freeze({
  PROFESSIONAL: 'professional',
  ENGLISH: 'english',
  RESEARCH: 'research',
  OTHER: 'other',
})

/** 计时模式 */
export const TIMER_MODE = Object.freeze({
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
})

/** 计时器运行状态 */
export const TIMER_STATUS = Object.freeze({
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
})

/** 会话类型 */
export const SESSION_TYPE = Object.freeze({
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
})

/** 主题模式（P1-9） */
export const THEME = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
})

/** 专注锁定级别（P1-6） */
export const FOCUS_LOCK_MODE = Object.freeze({
  OFF: 'off',
  SOFT: 'soft',
  HARD: 'hard',
})

/** 白噪音类型（P1-4 增强：多场景可叠加混音） */
export const NOISE_TYPE = Object.freeze({
  NONE: 'none',
  RAIN: 'rain',
  WAVES: 'waves',
  FOREST: 'forest',
  CAFE: 'cafe',
})

// ==================== 默认值 ====================

/**
 * 默认计时器配置
 * @type {import('../types').TimerConfig}
 */
export const DEFAULT_TIMER_CONFIG = Object.freeze({
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationEnabled: true,
  autoStartBreak: false,
  autoStartFocus: false,
})

/**
 * 默认应用设置
 * @type {import('../types').Settings}
 */
export const DEFAULT_SETTINGS = Object.freeze({
  theme: THEME.SYSTEM,
  whiteNoise: [], // 白噪音场景数组（多选混音）
  whiteNoiseVolume: 0.5,
  dailyGoal: 4,
  focusLock: FOCUS_LOCK_MODE.OFF,
})

// ==================== LocalStorage Key ====================

export const LS_KEY = Object.freeze({
  TIMER_CONFIG: 'focusly_timer_config',
  TASKS: 'focusly_tasks',
  CHECKINS: 'focusly_checkins',
  SESSIONS: 'focusly_sessions',
  SETTINGS: 'focusly_settings',
  CURRENT_TASK: 'focusly_current_task',
  THEME: 'focusly_theme',
  TIMER_STATE: 'focusly_timer_state',
  NOTIFICATION_ASKED: 'focusly_notification_asked',
  CELEBRATE_PREFIX: 'focusly_celebrated_',
  GARDEN: 'focusly_garden',
})

// ==================== 元信息（标签 / 颜色） ====================

/** 任务分类元信息：标签 + 颜色（文字场景用 -text 变体保证 AA 对比度） */
export const CATEGORY_META = Object.freeze({
  [TASK_CATEGORY.PROFESSIONAL]: { label: '专业课', color: 'var(--color-info-text)' },
  [TASK_CATEGORY.ENGLISH]: { label: '英语', color: 'var(--color-success-text)' },
  [TASK_CATEGORY.RESEARCH]: { label: '科研', color: 'var(--color-category-research)' },
  [TASK_CATEGORY.OTHER]: { label: '其他', color: 'var(--color-text-tertiary)' },
})

/** 优先级元信息：标签 + 颜色 + 权重（用于排序） */
export const PRIORITY_META = Object.freeze({
  [PRIORITY.HIGH]: { label: '高', color: 'var(--color-error)', weight: 0 },
  [PRIORITY.MEDIUM]: { label: '中', color: 'var(--color-warning-text)', weight: 1 },
  [PRIORITY.LOW]: { label: '低', color: 'var(--color-text-tertiary)', weight: 2 },
})

/** 计时模式元信息：标签 + 颜色 */
export const MODE_META = Object.freeze({
  [TIMER_MODE.FOCUS]: { label: '专注中', color: 'var(--color-focus)' },
  [TIMER_MODE.SHORT_BREAK]: { label: '短休中', color: 'var(--color-short-break)' },
  [TIMER_MODE.LONG_BREAK]: { label: '长休中', color: 'var(--color-long-break)' },
})

/** 白噪音元信息：标签 + 图标标识 */
export const NOISE_META = Object.freeze({
  [NOISE_TYPE.NONE]: { label: '关闭', icon: 'off' },
  [NOISE_TYPE.RAIN]: { label: '雨声', icon: '🌧' },
  [NOISE_TYPE.WAVES]: { label: '海浪', icon: '🌊' },
  [NOISE_TYPE.FOREST]: { label: '森林', icon: '🌲' },
  [NOISE_TYPE.CAFE]: { label: '咖啡馆', icon: '☕' },
})

/** 每日专注金句（P1-5，按日期取模轮换） */
export const DAILY_QUOTES = Object.freeze([
  '专注是把时间变成作品的能力。',
  '种一棵树最好的时间是十年前，其次是现在。',
  '你不需要很厉害才能开始，但需要开始才能很厉害。',
  '深度工作 1 小时，胜过心不在焉 3 小时。',
  '把大目标切成小番茄，一口一口吃掉它。',
  '今天的专注，是明天的底气。',
  '少即是多：一次只做好一件事。',
  '自律不是束缚，而是自由。',
  '每一次专注，都是与未来的自己击掌。',
  '别高估一天能做的，别低估一年能做的。',
])

// ==================== 养成物（P1-1） ====================

/** 成长阶段（按累计专注分钟数阈值） */
export const GROWTH_STAGES = Object.freeze([
  { stage: 'seed', label: '种子', minMinutes: 0 },
  { stage: 'sprout', label: '发芽', minMinutes: 60 },
  { stage: 'seedling', label: '幼苗', minMinutes: 180 },
  { stage: 'plant', label: '成株', minMinutes: 360 },
  { stage: 'bloom', label: '开花', minMinutes: 600 },
])

/** 养成物品种（连续打卡天数解锁） */
export const GARDEN_SPECIES = Object.freeze([
  { id: 'sprout', name: '小绿芽', minStreak: 0 },
  { id: 'tomato', name: '番茄苗', minStreak: 3 },
  { id: 'sunflower', name: '向日葵', minStreak: 7 },
])

// ==================== API 码 ====================

/** 统一响应码 */
export const API_CODE = Object.freeze({
  SUCCESS: 0,
  BAD_REQUEST: 1,
  NOT_FOUND: 2,
  SERVER_ERROR: 500,
})

// ==================== 路由 / 导航 ====================

/** 底部/侧边导航项 */
export const NAV_ITEMS = Object.freeze([
  { name: 'timer', label: '计时', path: '/', icon: 'timer' },
  { name: 'tasks', label: '任务', path: '/tasks', icon: 'task' },
  { name: 'stats', label: '统计', path: '/stats', icon: 'stats' },
])

// ==================== 校验边界 ====================

export const LIMITS = Object.freeze({
  TITLE_MAX: 50,
  NOTE_MAX: 200,
  POMODORO_MIN: 1,
  POMODORO_MAX: 20,
  FOCUS_MIN: 1,
  FOCUS_MAX: 120,
  SHORT_BREAK_MIN: 1,
  SHORT_BREAK_MAX: 30,
  LONG_BREAK_MIN: 1,
  LONG_BREAK_MAX: 60,
  INTERVAL_MIN: 2,
  INTERVAL_MAX: 8,
  DAILY_GOAL_MIN: 1,
  DAILY_GOAL_MAX: 20,
  VOLUME_MIN: 0,
  VOLUME_MAX: 1,
})

/** 里程碑文案阈值（连续打卡天数） */
export const STREAK_MILESTONES = Object.freeze([3, 7, 14, 30, 60, 100])
