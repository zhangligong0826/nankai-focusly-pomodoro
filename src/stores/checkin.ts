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
import { mergeTodayCheckin, computeStreak, computeLongestStreak, type CheckinRecord } from '@/utils/checkin'
import { idbGet, idbSet } from '@/utils/indexedDB'
import { LS_KEY } from '@/utils/constants'

export const useCheckinStore = defineStore('checkin', () => {
  /** 全部打卡记录 */
  const checkins = ref<CheckinRecord[]>([])
  /** 今日打卡记录（null=未打卡） */
  const todayCheckin = ref<CheckinRecord | null>(null)
  /** 是否已初始化 */
  const inited = ref(false)

  /** 今日是否已打卡 */
  const todayChecked = computed(() => !!todayCheckin.value)

  /** 今日番茄数 */
  const todayPomodoroCount = computed(() => todayCheckin.value?.pomodoroCount || 0)

  /** 今日专注分钟数 */
  const todayMinutes = computed(() => todayCheckin.value?.totalMinutes || 0)

  /** 当前连续打卡天数（今日未打卡则从昨日起算，给当天宽限） */
  const streak = computed(() =>
    computeStreak(checkins.value.map((c) => c.date), getTodayStr())
  )

  /** 最长连续打卡天数 */
  const longestStreak = computed(() =>
    computeLongestStreak(checkins.value.map((c) => c.date))
  )

  /** 刷新今日打卡缓存 */
  function refreshToday() {
    const today = getTodayStr()
    todayCheckin.value =
      checkins.value.find((c) => c.date === today) || null
  }

  /** 初始化：IndexedDB 优先 → API 刷新 */
  async function init() {
    const cached = await idbGet<CheckinRecord[]>(LS_KEY.CHECKINS, [])
    if (Array.isArray(cached)) {
      checkins.value = cached
      refreshToday()
    }
    try {
      const res = await checkinApi.getTodayCheckin()
      if (res && res.checked && !todayCheckin.value) {
        const today = getTodayStr()
        const newCheckin: CheckinRecord = {
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

  /** 持久化到 IndexedDB */
  function persist() {
    idbSet(LS_KEY.CHECKINS, checkins.value)
  }

  /** 触发打卡：按 date 去重，已存在则累加 */
  async function checkin(durationMinutes: number): Promise<CheckinRecord> {
    const today = getTodayStr()
    const existing = checkins.value.find((c) => c.date === today)
    let result: CheckinRecord
    if (existing) {
      existing.pomodoroCount = (existing.pomodoroCount || 0) + 1
      existing.totalMinutes = (existing.totalMinutes || 0) + durationMinutes
      result = { ...existing }
    } else {
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
    try {
      const apiRes = await checkinApi.createCheckin({ durationMinutes })
      if (apiRes) {
        const t = checkins.value.find((c) => c.date === today)
        if (t && apiRes.pomodoroCount !== undefined) {
          Object.assign(t, mergeTodayCheckin(t, apiRes as CheckinRecord))
          refreshToday()
          persist()
        }
      }
    } catch (_) {
      showToast('网络异常，打卡已离线保存', 'warning')
    }
    return result
  }

  /** 获取指定日期范围打卡记录 */
  function fetchRange(startDate: string, endDate: string): CheckinRecord[] {
    return checkins.value.filter(
      (c) => c.date >= startDate && c.date <= endDate
    )
  }

  /** 获取某日打卡 */
  function getByDate(dateStr: string): CheckinRecord | null {
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
