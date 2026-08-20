/**
 * 统计 Store
 * @module stores/stats
 * @description 周/月数据 + 累计汇总；优先用 LocalStorage 真实打卡数据聚合，API 兜底演示
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import statsApi from '@/api/stats'
import { useLocalStorage } from '@/composables/useLocalStorage'
import {
  getWeekStart,
  getMonthStr,
  getDaysInMonth,
  addDays,
  getTodayStr,
} from '@/utils/date'
import { LS_KEY } from '@/utils/constants'

export const useStatsStore = defineStore('stats', () => {
  const storage = useLocalStorage()

  /** 本周 7 天数据 */
  const weeklyData = ref([])
  /** 本月每日数据 */
  const monthlyData = ref([])
  /** 累计汇总 */
  const summary = ref({
    totalFocusMinutes: 0,
    totalPomodoros: 0,
    totalCheckinDays: 0,
    currentStreak: 0,
    longestStreak: 0,
  })
  /** 加载状态 */
  const isLoading = ref(false)

  /**
   * 从 LocalStorage 读取真实打卡记录
   * @returns {object[]}
   */
  function loadRealCheckins() {
    const cached = storage.getItem(LS_KEY.CHECKINS, [])
    return Array.isArray(cached) ? cached : []
  }

  /**
   * 计算累计汇总（真实数据）
   * @param {object[]} checkins
   * @returns {object}
   */
  function computeSummary(checkins) {
    let totalFocusMinutes = 0
    let totalPomodoros = 0
    const dateSet = new Set()
    checkins.forEach((c) => {
      totalFocusMinutes += c.totalMinutes || 0
      totalPomodoros += c.pomodoroCount || 0
      dateSet.add(c.date)
    })
    // 连续打卡计算
    const sorted = [...dateSet].sort()
    let current = 0
    let longest = 0
    if (sorted.length) {
      // current：从今日/昨日起倒推
      const dates = new Set(sorted)
      let cursor = getTodayStr()
      if (!dates.has(cursor)) cursor = addDays(cursor, -1)
      while (dates.has(cursor)) {
        current++
        cursor = addDays(cursor, -1)
      }
      // longest
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
  function diffDaysLocal(d1, d2) {
    const a = new Date(d1 + 'T00:00:00').getTime()
    const b = new Date(d2 + 'T00:00:00').getTime()
    if (Number.isNaN(a) || Number.isNaN(b)) return 0
    return Math.round((a - b) / 86400000)
  }

  /**
   * 计算周数据（真实）
   * @param {string} weekStart
   * @param {object[]} checkins
   * @returns {object[]}
   */
  function computeWeekly(weekStart, checkins) {
    const map = new Map(checkins.map((c) => [c.date, c]))
    const data = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      const c = map.get(date)
      data.push({
        date,
        focusMinutes: c ? c.totalMinutes : 0,
        pomodoroCount: c ? c.pomodoroCount : 0,
      })
    }
    return data
  }

  /**
   * 计算月数据（真实）
   * @param {string} month - YYYY-MM
   * @param {object[]} checkins
   * @returns {object[]}
   */
  function computeMonthly(month, checkins) {
    const map = new Map(checkins.map((c) => [c.date, c]))
    const [y, m] = month.split('-').map(Number)
    const days = getDaysInMonth(y, m)
    const data = []
    for (let i = 1; i <= days; i++) {
      const date = `${month}-${String(i).padStart(2, '0')}`
      const c = map.get(date)
      data.push({
        date,
        focusMinutes: c ? c.totalMinutes : 0,
        pomodoroCount: c ? c.pomodoroCount : 0,
      })
    }
    return data
  }

  /**
   * 获取累计汇总
   */
  async function fetchSummary() {
    isLoading.value = true
    const real = computeSummary(loadRealCheckins())
    try {
      const apiData = await statsApi.getSummary()
      // 有真实数据则用真实，否则用 API 演示数据
      summary.value =
        real.totalCheckinDays > 0 ? real : apiData || real
    } catch (_) {
      summary.value = real
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取周数据
   * @param {string} [weekStart]
   */
  async function fetchWeekly(weekStart) {
    isLoading.value = true
    const ws = weekStart || getWeekStart()
    const real = computeWeekly(ws, loadRealCheckins())
    try {
      const apiData = await statsApi.getWeeklyStats(ws)
      const hasReal = real.some((d) => d.focusMinutes > 0)
      weeklyData.value = hasReal ? real : apiData || real
    } catch (_) {
      weeklyData.value = real
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取月数据
   * @param {string} [month]
   */
  async function fetchMonthly(month) {
    isLoading.value = true
    const mo = month || getMonthStr()
    const real = computeMonthly(mo, loadRealCheckins())
    try {
      const apiData = await statsApi.getMonthlyStats(mo)
      const hasReal = real.some((d) => d.focusMinutes > 0)
      monthlyData.value = hasReal ? real : apiData || real
    } catch (_) {
      monthlyData.value = real
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 初始化：并行获取汇总 + 周
   */
  async function init() {
    await Promise.all([fetchSummary(), fetchWeekly()])
  }

  return {
    weeklyData,
    monthlyData,
    summary,
    isLoading,
    init,
    fetchSummary,
    fetchWeekly,
    fetchMonthly,
  }
})

export default useStatsStore
