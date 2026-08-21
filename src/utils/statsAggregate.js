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

export default { computeHeatmap, computePeakHours, formatDateLocal }
