/**
 * 养成物 Store（P1-1）
 * @module stores/garden
 * @description 虚拟花园：专注时长驱动植株成长（GROWTH_STAGES），
 *   连续打卡解锁品种（GARDEN_SPECIES），强锁离开/断签导致枯萎。
 *   持久化到 localStorage（小对象），不入 IndexedDB 迁移。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useCheckinStore } from './checkin'
import { LS_KEY, GROWTH_STAGES, GARDEN_SPECIES } from '@/utils/constants'

export const useGardenStore = defineStore('garden', () => {
  const storage = useLocalStorage()

  /** 植株状态 */
  interface PlantState {
    speciesId: string
    wilted: boolean
    wiltedAt: number | null
    reason?: string
  }

  /** 已解锁品种 id 列表 */
  const unlocked = ref<string[]>(['sprout'])
  /** 当前植株 */
  const plant = ref<PlantState>({ speciesId: 'sprout', wilted: false, wiltedAt: null })
  /** 累计收获次数（开花后结算） */
  const harvestedCount = ref(0)
  /** 上次结算时的连续打卡天数 */
  const lastStreak = ref(0)
  /** 解锁庆祝触发计数（GardenCelebration 订阅） */
  const unlockTrigger = ref(0)
  /** 是否已初始化 */
  const inited = ref(false)

  /** 累计专注分钟数（来自打卡记录） */
  const totalMinutes = computed(() => {
    const checkins = useCheckinStore().checkins
    return checkins.reduce((sum, c) => sum + (c.totalMinutes || 0), 0)
  })

  /** 当前成长阶段 */
  const stage = computed(() => {
    const m = totalMinutes.value
    let cur = GROWTH_STAGES[0]
    for (const s of GROWTH_STAGES) {
      if (m >= s.minMinutes) cur = s
    }
    return cur
  })

  /** 成长进度（到下一阶段的 0-1） */
  const progress = computed(() => {
    const m = totalMinutes.value
    const idx = GROWTH_STAGES.findIndex((s) => s.stage === stage.value.stage)
    const next = GROWTH_STAGES[idx + 1]
    if (!next) return 1
    const curMin = stage.value.minMinutes
    return Math.min(1, Math.max(0, (m - curMin) / (next.minMinutes - curMin)))
  })

  /** 当前应展示的品种（按连续打卡取最高已解锁） */
  const currentSpecies = computed(() => {
    const streak = useCheckinStore().streak
    // 已解锁品种按 minStreak 降序，取第一个 streak 达标的
    const candidates = GARDEN_SPECIES.filter(
      (s) => unlocked.value.includes(s.id) && streak >= s.minStreak
    ).sort((a, b) => b.minStreak - a.minStreak)
    return candidates[0] || GARDEN_SPECIES[0]
  })

  /** 是否枯萎 */
  const isWilted = computed(() => !!plant.value.wilted)

  /** 下一阶段标签（用于展示"还差 X 分钟"） */
  const nextStage = computed(() => {
    const idx = GROWTH_STAGES.findIndex((s) => s.stage === stage.value.stage)
    return GROWTH_STAGES[idx + 1] || null
  })

  /**
   * 持久化
   */
  function persist() {
    storage.setItem(LS_KEY.GARDEN, {
      unlocked: unlocked.value,
      plant: plant.value,
      harvestedCount: harvestedCount.value,
      lastStreak: lastStreak.value,
    })
  }

  /**
   * 初始化：加载本地数据（无则用默认）
   */
  function init() {
    const saved = storage.getItem<Record<string, unknown> | null>(LS_KEY.GARDEN, null)
    if (saved && typeof saved === 'object') {
      const savedUnlocked = saved.unlocked as string[] | undefined
      if (Array.isArray(savedUnlocked) && savedUnlocked.length) {
        unlocked.value = savedUnlocked
      }
      const savedPlant = saved.plant as Record<string, unknown> | undefined
      if (savedPlant && typeof savedPlant === 'object') {
        plant.value = { ...plant.value, ...savedPlant } as typeof plant.value
      }
      harvestedCount.value = Number(saved.harvestedCount) || 0
      lastStreak.value = Number(saved.lastStreak) || 0
    }
    inited.value = true
  }

  /**
   * 对账：重算成长阶段 + 检测断签/品种解锁。
   * 在打卡数据变化后调用（专注完成、刷新启动时）。
   */
  function reconcile() {
    const checkinStore = useCheckinStore()
    const streak = checkinStore.streak

    // 品种解锁检测
    const newly = GARDEN_SPECIES.filter(
      (s) => streak >= s.minStreak && !unlocked.value.includes(s.id)
    )
    if (newly.length > 0) {
      unlocked.value = [...unlocked.value, ...newly.map((s) => s.id)]
      unlockTrigger.value += 1
      persist()
    }

    // 断签检测：连续打卡归零且有历史 → 枯萎
    if (streak === 0 && lastStreak.value > 0 && !plant.value.wilted) {
      wilt('连续打卡中断')
    }

    lastStreak.value = streak
    persist()
  }

  /**
   * 枯萎
   * @param {string} reason
   */
  function wilt(reason = '') {
    plant.value = { ...plant.value, wilted: true, wiltedAt: Date.now(), reason }
    persist()
  }

  /**
   * 复活（重新开始，重置为种子阶段的新植株）
   */
  function revive() {
    plant.value = { speciesId: currentSpecies.value.id, wilted: false, wiltedAt: null }
    persist()
  }

  /** 清除解锁庆祝触发 */
  function clearUnlockTrigger() {
    unlockTrigger.value = 0
  }

  return {
    unlocked,
    plant,
    harvestedCount,
    lastStreak,
    unlockTrigger,
    inited,
    totalMinutes,
    stage,
    progress,
    currentSpecies,
    isWilted,
    nextStage,
    init,
    reconcile,
    wilt,
    revive,
    clearUnlockTrigger,
  }
})

export default useGardenStore
