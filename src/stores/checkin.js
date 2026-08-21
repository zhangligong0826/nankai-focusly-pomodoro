/**
 * 打卡 Store
 * @module stores/checkin
 * @description 按 date 去重累加 + 连续打卡天数（streak）计算
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import checkinApi from '@/api/checkin'
import { showToast } from '@/composables/useToast'
import { getTodayStr } from '@/utils/date'
import { mergeTodayCheckin, computeStreak, computeLongestStreak } from '@/utils/checkin'
import { idbGet, idbSet } from '@/utils/indexedDB'
import { LS_KEY } from '@/utils/constants'

export const useCheckinStore = defineStore('checkin', () => {
  /** 全部打卡记录 */
  const checkins = ref([])
  /** 今日打卡记录（null=未打卡） */
  const todayCheckin = ref(null)
  /** 是否已初始化 */
  const inited = ref(false)

  /** 今日是否已打卡 */
  const todayChecked = computed(() => !!todayCheckin.value)

  /** 今日番茄数 */
  const todayPomodoroCount = computed(() => todayCheckin.value?.pomodoroCount || 0)

  /** 今日专注分钟数 */
  const todayMinutes = computed(() => todayCheckin.value?.totalMinutes || 0)

  /**
   * 当前连续打卡天数（今日未打卡则从昨日起算，给当天宽限）
   * @returns {number}
   */
  const streak = computed(() =>
    computeStreak(checkins.value.map((c) => c.date), getTodayStr())
  )

  /**
   * 最长连续打卡天数
   * @returns {number}
   */
  const longestStreak = computed(() =>
    computeLongestStreak(checkins.value.map((c) => c.date))
  )

  /**
   * 刷新今日打卡缓存
   */
  function refreshToday() {
    const today = getTodayStr()
    todayCheckin.value =
      checkins.value.find((c) => c.date === today) || null
  }

  /**
   * 初始化：IndexedDB 优先 → API 刷新
   */
  async function init() {
    const cached = await idbGet(LS_KEY.CHECKINS, [])
    if (Array.isArray(cached)) {
      checkins.value = cached
      refreshToday()
    }
    try {
      const res = await checkinApi.getTodayCheckin()
      if (res && res.checked && !todayCheckin.value) {
        // API 有今日数据但本地没有 → 同步
        const today = getTodayStr()
        const newCheckin = {
          date: today,
          firstCheckinAt: Date.now(),
          pomodoroCount: res.pomodoroCount || 0,
          totalMinutes: res.totalMinutes || 0,
        }
        checkins.value.push(newCheckin)
        refreshToday()
        persist()
      }
    } catch (_) {
      /* 本地已加载 */
    }
    inited.value = true
  }

  /**
   * 持久化到 IndexedDB
   */
  function persist() {
    idbSet(LS_KEY.CHECKINS, checkins.value)
  }

  /**
   * 触发打卡：按 date 去重，已存在则累加
   * @param {number} durationMinutes - 本次专注时长
   * @returns {object} 今日 Checkin
   */
  async function checkin(durationMinutes) {
    const today = getTodayStr()
    const existing = checkins.value.find((c) => c.date === today)
    let result
    if (existing) {
      // 当日重复：累加
      existing.pomodoroCount += 1
      existing.totalMinutes += durationMinutes
      result = { ...existing }
    } else {
      // 首次打卡
      result = {
        date: today,
        firstCheckinAt: Date.now(),
        pomodoroCount: 1,
        totalMinutes: durationMinutes,
      }
      checkins.value.push(result)
    }
    refreshToday()
    persist()
    // API 同步
    try {
      const apiRes = await checkinApi.createCheckin({ durationMinutes })
      if (apiRes) {
        // 用 API 返回校正（保持与服务端一致）
        const t = checkins.value.find((c) => c.date === today)
        if (t && apiRes.pomodoroCount !== undefined) {
          // 不能用较小的远端累计覆盖本地离线数据（例如 Mock 服务重启后）。
          Object.assign(t, mergeTodayCheckin(t, apiRes))
          refreshToday()
          persist()
        }
      }
    } catch (_) {
      showToast('网络异常，打卡已离线保存', 'warning')
    }
    return result
  }

  /**
   * 获取指定日期范围打卡记录
   * @param {string} startDate
   * @param {string} endDate
   * @returns {object[]}
   */
  function fetchRange(startDate, endDate) {
    return checkins.value.filter(
      (c) => c.date >= startDate && c.date <= endDate
    )
  }

  /**
   * 获取某日打卡
   * @param {string} dateStr
   * @returns {object|null}
   */
  function getByDate(dateStr) {
    return checkins.value.find((c) => c.date === dateStr) || null
  }

  return {
    checkins,
    todayCheckin,
    inited,
    todayChecked,
    todayPomodoroCount,
    todayMinutes,
    streak,
    longestStreak,
    init,
    checkin,
    fetchRange,
    getByDate,
    refreshToday,
  }
})

export default useCheckinStore
