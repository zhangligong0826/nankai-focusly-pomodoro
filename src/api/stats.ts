/**
 * 统计 API
 * @module api/stats
 * @description GET /api/stats/{weekly,monthly,summary,streak}
 */

import { request } from './index'

/** 获取周专注数据 */
export function getWeeklyStats(weekStart: string): Promise<any> {
  return request.get('/stats/weekly', { params: { weekStart } })
}

/** 获取月专注数据 */
export function getMonthlyStats(month: string): Promise<any> {
  return request.get('/stats/monthly', { params: { month } })
}

/** 获取累计汇总 */
export function getSummary(): Promise<any> {
  return request.get('/stats/summary')
}

/** 获取连续打卡天数 */
export function getStreak(): Promise<any> {
  return request.get('/stats/streak')
}

/** 获取热力图数据 */
export function getHeatmap(): Promise<any> {
  return request.get('/stats/heatmap')
}

/** 获取高效时段 */
export function getPeakHours(): Promise<any> {
  return request.get('/stats/peak-hours')
}

/** 获取日报 */
export function getDaily(date: string): Promise<any> {
  return request.get('/stats/daily', { params: { date } })
}

/** 获取年报 */
export function getYearly(year: number): Promise<any> {
  return request.get('/stats/yearly', { params: { year } })
}

export default { getWeeklyStats, getMonthlyStats, getSummary, getStreak, getHeatmap, getPeakHours, getDaily, getYearly }
