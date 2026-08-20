/**
 * 打卡纯函数（供 Store 与单元测试共用）
 * @module utils/checkin
 * @description 合并当日累计 + 连续/最长连续打卡天数计算，全部无副作用
 */
import { addDays, diffDays } from './date.js'

/**
 * 合并本地与远端的当日打卡累计值。
 * 远端数据可补齐或提升本地数据，但绝不降低已经离线持久化的累计值。
 * @param {object} local - 本地记录
 * @param {object} remote - 远端记录
 * @returns {object} 合并结果
 */
export function mergeTodayCheckin(local, remote) {
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

/**
 * 计算当前连续打卡天数。
 * 今日未打卡则从昨日起算（不因"今天还没学"就断 streak）。
 * @param {string[]} dates - 打卡日期集合（YYYY-MM-DD）
 * @param {string} today - 今日日期（YYYY-MM-DD）
 * @returns {number} 连续天数
 */
export function computeStreak(dates, today) {
  if (!Array.isArray(dates) || dates.length === 0) return 0
  const set = new Set(dates)
  // 今日未打卡则从昨日起算（给当天宽限）
  let cursor = set.has(today) ? today : addDays(today, -1)
  let count = 0
  while (set.has(cursor)) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

/**
 * 计算最长连续打卡天数。
 * @param {string[]} dates - 打卡日期集合（YYYY-MM-DD）
 * @returns {number} 最长连续天数
 */
export function computeLongestStreak(dates) {
  if (!Array.isArray(dates) || dates.length === 0) return 0
  // 去重后按字典序（YYYY-MM-DD 字典序即时间序）
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
