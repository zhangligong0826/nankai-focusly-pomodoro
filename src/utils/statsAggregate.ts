/**
 * 统计聚合纯函数（热力图 / 高效时段）。
 * @module utils/statsAggregate
 * @description 无框架/浏览器依赖，供 stats store 与单元测试共用。
 */

/** 打卡记录（date/totalMinutes/pomodoroCount） */
export interface CheckinLike {
  date: string
  totalMinutes?: number
  pomodoroCount?: number
}

/** 专注会话（startedAt/durationMinutes/completed/type/taskId/taskTitle） */
export interface SessionLike {
  startedAt?: number
  durationMinutes?: number
  completed?: boolean
  type?: string
  taskId?: string | null
  taskTitle?: string
}

/** 高效时段桶 */
export interface HourBucket {
  hour: number
  minutes: number
  count: number
}

/** 本地日期格式化 YYYY-MM-DD */
export function formatDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 计算热力图数据（近 N 月逐日，空日填 0） */
export function computeHeatmap(
  checkins: CheckinLike[],
  months = 12,
  now = new Date()
): Array<[string, number]> {
  const map = new Map((checkins || []).map((c) => [c.date, c.totalMinutes || 0]))
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const result: Array<[string, number]> = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const d = formatDateLocal(cursor)
    result.push([d, map.get(d) || 0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

/** 计算高效时段（按会话 startedAt 小时聚合，排除 skip/abort） */
export function computePeakHours(sessions: SessionLike[]): {
  buckets: HourBucket[]
  peak: number | null
} {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    minutes: 0,
    count: 0,
  }))
  ;(sessions || []).forEach((s) => {
    if (!s || s.completed === false) return
    const ts = s.startedAt
    if (!ts) return
    const h = new Date(ts).getHours()
    if (h >= 0 && h < 24) {
      buckets[h].minutes += s.durationMinutes || 0
      buckets[h].count += 1
    }
  })
  let peak: number | null = null
  let maxMinutes = 0
  buckets.forEach((b) => {
    if (b.minutes > maxMinutes) {
      maxMinutes = b.minutes
      peak = b.hour
    }
  })
  return { buckets, peak: maxMinutes > 0 ? peak : null }
}

/** 任务分布项 */
export interface TaskDistribution {
  taskId: string
  title: string
  minutes: number
  count: number
}

/** 计算日报数据（某日指标 + 任务分布） */
export function computeDaily(
  dateStr: string,
  checkins: CheckinLike[],
  sessions: SessionLike[]
): {
  date: string
  pomodoroCount: number
  totalMinutes: number
  completedTasks: number
  taskDistribution: TaskDistribution[]
} {
  const checkin = (checkins || []).find((c) => c && c.date === dateStr) || ({} as CheckinLike)
  const focusSessions = (sessions || []).filter(
    (s) =>
      s &&
      s.type === 'focus' &&
      s.completed !== false &&
      formatDateLocal(new Date(s.startedAt || 0)) === dateStr
  )
  const taskMap = new Map<string, TaskDistribution>()
  focusSessions.forEach((s) => {
    const id = s.taskId || 'untracked'
    if (!taskMap.has(id)) {
      taskMap.set(id, {
        taskId: id,
        title: s.taskTitle || (id === 'untracked' ? '未绑定任务' : '未知任务'),
        minutes: 0,
        count: 0,
      })
    }
    const t = taskMap.get(id)!
    t.minutes += s.durationMinutes || 0
    t.count += 1
  })
  const taskDistribution = [...taskMap.values()].sort(
    (a, b) => b.minutes - a.minutes
  )
  return {
    date: dateStr,
    pomodoroCount: checkin.pomodoroCount || 0,
    totalMinutes: checkin.totalMinutes || 0,
    completedTasks: taskMap.size,
    taskDistribution,
  }
}

/** 年报月度项 */
export interface YearlyItem {
  month: string
  focusMinutes: number
  pomodoroCount: number
}

/** 计算年报数据（某年 12 个月逐月） */
export function computeYearly(year: number, checkins: CheckinLike[]): YearlyItem[] {
  const result: YearlyItem[] = []
  for (let m = 1; m <= 12; m++) {
    const month = `${year}-${String(m).padStart(2, '0')}`
    const monthCheckins = (checkins || []).filter((c) =>
      c && c.date ? c.date.startsWith(month) : false
    )
    result.push({
      month,
      focusMinutes: monthCheckins.reduce((sum, c) => sum + (c.totalMinutes || 0), 0),
      pomodoroCount: monthCheckins.reduce((sum, c) => sum + (c.pomodoroCount || 0), 0),
    })
  }
  return result
}

/** 生成高效时段建议文案 */
export function buildPeakAdvice(buckets: HourBucket[], peak: number | null): string {
  if (peak === null || peak === undefined) return ''
  const end = (peak + 1) % 24
  const startStr = `${String(peak).padStart(2, '0')}:00`
  const endStr = `${String(end).padStart(2, '0')}:00`
  return `你的高效时段是 ${startStr} - ${endStr}，建议把重要任务排在此时段，效率更高。`
}

export default { computeHeatmap, computePeakHours, computeDaily, computeYearly, buildPeakAdvice, formatDateLocal }
