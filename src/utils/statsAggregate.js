/**
 * 统计聚合纯函数（热力图 / 高效时段）。
 * @module utils/statsAggregate
 * @description 无框架/浏览器依赖，供 stats store 与单元测试共用。
 */

/**
 * 本地日期格式化 YYYY-MM-DD
 * @param {Date} d
 * @returns {string}
 */
export function formatDateLocal(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 计算热力图数据（近 N 月逐日，空日填 0）。
 * @param {object[]} checkins - 打卡记录（date/totalMinutes）
 * @param {number} [months=12]
 * @param {Date} [now=new Date()]
 * @returns {Array<[string, number]>} [date, minutes]
 */
export function computeHeatmap(checkins, months = 12, now = new Date()) {
  const map = new Map((checkins || []).map((c) => [c.date, c.totalMinutes || 0]))
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const result = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const d = formatDateLocal(cursor)
    result.push([d, map.get(d) || 0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

/**
 * 计算高效时段（按会话 startedAt 小时聚合，排除 skip/abort）。
 * @param {object[]} sessions - 会话（startedAt/durationMinutes/completed）
 * @returns {{ buckets: Array<{hour:number, minutes:number, count:number}>, peak: number|null }}
 */
export function computePeakHours(sessions) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({
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
  let peak = null
  let maxMinutes = 0
  buckets.forEach((b) => {
    if (b.minutes > maxMinutes) {
      maxMinutes = b.minutes
      peak = b.hour
    }
  })
  return { buckets, peak: maxMinutes > 0 ? peak : null }
}

/**
 * 计算日报数据（某日指标 + 任务分布）。
 * @param {string} dateStr - YYYY-MM-DD
 * @param {object[]} checkins - 打卡记录
 * @param {object[]} sessions - 会话（含 taskId/taskTitle）
 * @returns {{ date:string, pomodoroCount:number, totalMinutes:number, completedTasks:number, taskDistribution:Array }}
 */
export function computeDaily(dateStr, checkins, sessions) {
  const checkin = (checkins || []).find((c) => c && c.date === dateStr) || {}
  // 当日完成的有效专注会话
  const focusSessions = (sessions || []).filter(
    (s) =>
      s &&
      s.type === 'focus' &&
      s.completed !== false &&
      formatDateLocal(new Date(s.startedAt)) === dateStr
  )
  const taskMap = new Map()
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
    const t = taskMap.get(id)
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

/**
 * 计算年报数据（某年 12 个月逐月）。
 * @param {number} year - 年份
 * @param {object[]} checkins - 打卡记录
 * @returns {Array<{month:string, focusMinutes:number, pomodoroCount:number}>}
 */
export function computeYearly(year, checkins) {
  const result = []
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

/**
 * 生成高效时段建议文案。
 * @param {Array<{hour:number}>} buckets - 24 小时桶
 * @param {number|null} peak - 峰值小时
 * @returns {string}
 */
export function buildPeakAdvice(buckets, peak) {
  if (peak === null || peak === undefined) return ''
  const end = (peak + 1) % 24
  const startStr = `${String(peak).padStart(2, '0')}:00`
  const endStr = `${String(end).padStart(2, '0')}:00`
  return `你的高效时段是 ${startStr} - ${endStr}，建议把重要任务排在此时段，效率更高。`
}

export default { computeHeatmap, computePeakHours, computeDaily, computeYearly, buildPeakAdvice, formatDateLocal }
