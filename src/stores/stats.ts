/**
 * 统计 Store
 * @module stores/stats
 * @description 周/月数据 + 累计汇总；优先用 LocalStorage 真实打卡数据聚合，API 兜底演示
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import statsApi from '@/api/stats'
import { idbGet } from '@/utils/indexedDB'
import {
  computeHeatmap,
  computePeakHours,
  computeDaily,
  computeYearly,
  buildPeakAdvice,
  type CheckinLike,
  type SessionLike,
  type HourBucket,
  type TaskDistribution,
  type YearlyItem,
} from '@/utils/statsAggregate'
import {
  getWeekStart,
  getMonthStr,
  getDaysInMonth,
  addDays,
  getTodayStr,
} from '@/utils/date'
import { LS_KEY } from '@/utils/constants'

/** 周/月数据项 */
export interface StatsDataItem {
  date: string
  focusMinutes: number
  pomodoroCount: number
}

/** 累计汇总 */
export interface StatsSummary {
  totalFocusMinutes: number
  totalPomodoros: number
  totalCheckinDays: number
  currentStreak: number
  longestStreak: number
}

/** 日报数据 */
export interface DailyReportData {
  date: string
  pomodoroCount: number
  totalMinutes: number
  completedTasks: number
  taskDistribution: TaskDistribution[]
}

export const useStatsStore = defineStore('stats', () => {
  /** 本周 7 天数据 */
  const weeklyData = ref<StatsDataItem[]>([])
  /** 本月每日数据 */
  const monthlyData = ref<StatsDataItem[]>([])
  /** 累计汇总 */
  const summary = ref<StatsSummary>({
    totalFocusMinutes: 0,
    totalPomodoros: 0,
    totalCheckinDays: 0,
    currentStreak: 0,
    longestStreak: 0,
  })
  /** 加载状态 */
  const isLoading = ref(false)
  /** 热力图数据（近 12 月逐日） */
  const heatmapData = ref<Array<[string, number]>>([])
  /** 高效时段数据 */
  const peakHours = ref<{ buckets: HourBucket[]; peak: number | null }>({ buckets: [], peak: null })
  /** 高效时段建议文案 */
  const peakAdvice = ref('')
  /** 日报数据 */
  const dailyData = ref<DailyReportData | null>(null)
  /** 年报数据（12 月） */
  const yearlyData = ref<YearlyItem[]>([])

  /** 从 IndexedDB 读取真实打卡记录 */
  async function loadRealCheckins(): Promise<CheckinLike[]> {
    const cached = await idbGet<CheckinLike[]>(LS_KEY.CHECKINS, [])
    return Array.isArray(cached) ? cached : []
  }

  /** 从 IndexedDB 读取专注会话 */
  async function loadRealSessions(): Promise<SessionLike[]> {
    const cached = await idbGet<SessionLike[]>(LS_KEY.SESSIONS, [])
    return Array.isArray(cached) ? cached : []
  }

  /** 计算累计汇总（真实数据） */
  function computeSummary(checkins: CheckinLike[]): StatsSummary {
    let totalFocusMinutes = 0
    let totalPomodoros = 0
    const dateSet = new Set<string>()
    checkins.forEach((c) => {
      totalFocusMinutes += c.totalMinutes || 0
      totalPomodoros += c.pomodoroCount || 0
      dateSet.add(c.date)
    })
    const sorted = [...dateSet].sort()
    let current = 0
    let longest = 0
    if (sorted.length) {
      const dates = new Set(sorted)
      let cursor = getTodayStr()
      if (!dates.has(cursor)) cursor = addDays(cursor, -1)
      while (dates.has(cursor)) {
        current++
        cursor = addDays(cursor, -1)
      }
      let run = 1
      longest = 1
      for (let i = 1; i < sorted.length; i++) {
        const d = diffDaysLocal(sorted[i], sorted[i - 1])
        if (d === 1) {
          run++
          if (run > longest) longest = run
        } else if (d === 0) {
          continue
        } else {
          run = 1
        }
      }
    }
    return {
      totalFocusMinutes,
      totalPomodoros,
      totalCheckinDays: dateSet.size,
      currentStreak: current,
      longestStreak: longest,
    }
  }

  /** 本地 diffDays（避免 import checkin store 造成耦合） */
  function diffDaysLocal(d1: string, d2: string): number {
    const a = new Date(d1 + 'T00:00:00').getTime()
    const b = new Date(d2 + 'T00:00:00').getTime()
    if (Number.isNaN(a) || Number.isNaN(b)) return 0
    return Math.round((a - b) / 86400000)
  }

  /** 计算周数据（真实） */
  function computeWeekly(weekStart: string, checkins: CheckinLike[]): StatsDataItem[] {
    const map = new Map(checkins.map((c) => [c.date, c]))
    const data: StatsDataItem[] = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      const c = map.get(date)
      data.push({
        date,
        focusMinutes: c ? c.totalMinutes || 0 : 0,
        pomodoroCount: c ? c.pomodoroCount || 0 : 0,
      })
    }
    return data
  }

  /** 计算月数据（真实） */
  function computeMonthly(month: string, checkins: CheckinLike[]): StatsDataItem[] {
    const map = new Map(checkins.map((c) => [c.date, c]))
    const [y, m] = month.split('-').map(Number)
    const days = getDaysInMonth(y, m)
    const data: StatsDataItem[] = []
    for (let i = 1; i <= days; i++) {
      const date = `${month}-${String(i).padStart(2, '0')}`
      const c = map.get(date)
      data.push({
        date,
        focusMinutes: c ? c.totalMinutes || 0 : 0,
        pomodoroCount: c ? c.pomodoroCount || 0 : 0,
      })
    }
    return data
  }

  /** 计算热力图数据 —— 委托 statsAggregate 纯函数 */
  function heatmapFrom(checkins: CheckinLike[]): Array<[string, number]> {
    return computeHeatmap(checkins, 12)
  }

  /** 计算高效时段 —— 委托 statsAggregate 纯函数 */
  function peakFrom(sessions: SessionLike[]): { buckets: HourBucket[]; peak: number | null } {
    return computePeakHours(sessions)
  }

  /** 获取累计汇总 */
  async function fetchSummary() {
    isLoading.value = true
    const real = computeSummary(await loadRealCheckins())
    try {
      const apiData = await statsApi.getSummary()
      summary.value = real.totalCheckinDays > 0 ? real : apiData || real
    } catch (_) {
      summary.value = real
    } finally {
      isLoading.value = false
    }
  }

  /** 获取周数据 */
  async function fetchWeekly(weekStart?: string) {
    isLoading.value = true
    const ws = weekStart || getWeekStart()
    const real = computeWeekly(ws, await loadRealCheckins())
    try {
      const apiData = (await statsApi.getWeeklyStats(ws)) as StatsDataItem[]
      const hasReal = real.some((d) => d.focusMinutes > 0)
      weeklyData.value = hasReal ? real : apiData || real
    } catch (_) {
      weeklyData.value = real
    } finally {
      isLoading.value = false
    }
  }

  /** 获取月数据 */
  async function fetchMonthly(month?: string) {
    isLoading.value = true
    const mo = month || getMonthStr()
    const real = computeMonthly(mo, await loadRealCheckins())
    try {
      const apiData = (await statsApi.getMonthlyStats(mo)) as StatsDataItem[]
      const hasReal = real.some((d) => d.focusMinutes > 0)
      monthlyData.value = hasReal ? real : apiData || real
    } catch (_) {
      monthlyData.value = real
    } finally {
      isLoading.value = false
    }
  }

  /** 获取热力图数据（近 12 月逐日） */
  async function fetchHeatmap() {
    isLoading.value = true
    const real = heatmapFrom(await loadRealCheckins())
    try {
      const apiData = (await statsApi.getHeatmap()) as Array<[string, number]>
      const hasReal = real.some((d) => d[1] > 0)
      heatmapData.value = hasReal ? real : (Array.isArray(apiData) ? apiData : real)
    } catch (_) {
      heatmapData.value = real
    } finally {
      isLoading.value = false
    }
  }

  /** 获取高效时段数据 */
  async function fetchPeakHours() {
    isLoading.value = true
    const real = peakFrom(await loadRealSessions())
    try {
      const apiData = (await statsApi.getPeakHours()) as { buckets: HourBucket[]; peak: number | null }
      const hasReal = real.peak !== null
      peakHours.value = hasReal ? real : (apiData || real)
    } catch (_) {
      peakHours.value = real
    } finally {
      peakAdvice.value = buildPeakAdvice(peakHours.value.buckets || [], peakHours.value.peak)
      isLoading.value = false
    }
  }

  /** 获取日报数据 */
  async function fetchDaily(dateStr?: string) {
    isLoading.value = true
    const date = dateStr || getTodayStr()
    const real = computeDaily(date, await loadRealCheckins(), await loadRealSessions())
    try {
      const apiData = (await statsApi.getDaily(date)) as DailyReportData
      dailyData.value = real.totalMinutes > 0 ? real : (apiData || real)
    } catch (_) {
      dailyData.value = real
    } finally {
      isLoading.value = false
    }
  }

  /** 获取年报数据 */
  async function fetchYearly(year?: number) {
    isLoading.value = true
    const y = year || new Date().getFullYear()
    const real = computeYearly(y, await loadRealCheckins())
    try {
      const apiData = (await statsApi.getYearly(y)) as YearlyItem[]
      const hasReal = real.some((d) => d.focusMinutes > 0)
      yearlyData.value = hasReal ? real : (Array.isArray(apiData) ? apiData : real)
    } catch (_) {
      yearlyData.value = real
    } finally {
      isLoading.value = false
    }
  }

  /** 初始化：并行获取汇总 + 周 */
  async function init() {
    await Promise.all([fetchSummary(), fetchWeekly()])
  }

  return {
    weeklyData,
    monthlyData,
    summary,
    heatmapData,
    peakHours,
    peakAdvice,
    dailyData,
    yearlyData,
    isLoading,
    init,
    fetchSummary,
    fetchWeekly,
    fetchMonthly,
    fetchHeatmap,
    fetchPeakHours,
    fetchDaily,
    fetchYearly,
  }
})

export default useStatsStore
