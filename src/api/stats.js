/**
 * 统计 API
 * @module api/stats
 * @description GET /api/stats/{weekly,monthly,summary,streak}
 */

import { request } from './index'

/**
 * 获取周专注数据
 * @param {string} weekStart - YYYY-MM-DD
 * @returns {Promise<Array>} StatsDataItem[]
 */
export function getWeeklyStats(weekStart) {
  return request.get('/stats/weekly', { params: { weekStart } })
}

/**
 * 获取月专注数据
 * @param {string} month - YYYY-MM
 * @returns {Promise<Array>} StatsDataItem[]
 */
export function getMonthlyStats(month) {
  return request.get('/stats/monthly', { params: { month } })
}

/**
 * 获取累计汇总
 * @returns {Promise<object>} StatsSummary
 */
export function getSummary() {
  return request.get('/stats/summary')
}

/**
 * 获取连续打卡天数
 * @returns {Promise<{ currentStreak: number, longestStreak: number }>}
 */
export function getStreak() {
  return request.get('/stats/streak')
}

export default { getWeeklyStats, getMonthlyStats, getSummary, getStreak }
