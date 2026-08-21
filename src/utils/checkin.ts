/**
 * 打卡纯函数（供 Store 与单元测试共用）
 * @module utils/checkin
 * @description 合并当日累计 + 连续/最长连续打卡天数计算，全部无副作用
 */
import { addDays, diffDays } from './date.ts'

/** 打卡记录结构 */
export interface CheckinRecord {
  date: string
  pomodoroCount?: number
  totalMinutes?: number
  firstCheckinAt?: number
}

/** 合并本地与远端的当日打卡累计值（远端可提升，绝不降低本地已持久化值） */
export function mergeTodayCheckin(
  local: CheckinRecord,
  remote: CheckinRecord
): CheckinRecord {
  return {
    ...local,
    ...remote,
    date: local.date,
    firstCheckinAt: local.firstCheckinAt || remote.firstCheckinAt,
    pomodoroCount: Math.max(
      Number(local.pomodoroCount) || 0,
      Number(remote.pomodoroCount) || 0
    ),
    totalMinutes: Math.max(
      Number(local.totalMinutes) || 0,
      Number(remote.totalMinutes) || 0
    ),
  }
}

/** 计算当前连续打卡天数（今日未打卡则从昨日起算，给当天宽限） */
export function computeStreak(dates: string[], today: string): number {
  if (!Array.isArray(dates) || dates.length === 0) return 0
  const set = new Set(dates)
  let cursor = set.has(today) ? today : addDays(today, -1)
  let count = 0
  while (set.has(cursor)) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

/** 计算最长连续打卡天数 */
export function computeLongestStreak(dates: string[]): number {
  if (!Array.isArray(dates) || dates.length === 0) return 0
  const sorted = [...new Set(dates)].sort()
  let max = 1
  let cur = 1
  for (let i = 1; i < sorted.length; i++) {
    if (diffDays(sorted[i], sorted[i - 1]) === 1) {
      cur++
      if (cur > max) max = cur
    } else {
      cur = 1
    }
  }
  return max
}

export default { mergeTodayCheckin, computeStreak, computeLongestStreak }
