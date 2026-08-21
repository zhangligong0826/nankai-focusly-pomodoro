/**
 * 社交 Store（P3 纯前端模拟）
 * @module stores/social
 * @description 匿名自习室陪学 + 好友专注时长榜；
 *   无真实后端，用 mock peers/friends + setInterval 模拟实时变化。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useCheckinStore } from './checkin'
import { generatePeers, generateFriends, getOrCreateSeed, type Peer, type Friend } from '@/utils/socialMock'
import { LS_KEY } from '@/utils/constants'

export const useSocialStore = defineStore('social', () => {
  const storage = useLocalStorage()
  const checkinStore = useCheckinStore()

  /** 匿名陪学 peers */
  const peers = ref<Peer[]>([])
  /** 好友列表（含本周分钟） */
  const friends = ref<Friend[]>([])
  /** 是否已加入自习室 */
  const isRoomJoined = ref(false)
  /** 模拟实时变化的定时器 */
  let timerId: ReturnType<typeof setInterval> | null = null

  /** seed（持久化保证刷新稳定） */
  const seed = ref(0)

  /** 我的今日专注分钟（同步 checkinStore） */
  const myMinutes = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    const c = checkinStore.checkins.find((x) => x.date === today)
    return c ? c.totalMinutes || 0 : 0
  })

  /** 我的本周专注分钟 */
  const myWeeklyMinutes = computed(() => {
    const now = new Date()
    const day = now.getDay() || 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - day + 1)
    const start = monday.toISOString().slice(0, 10)
    return checkinStore.checkins
      .filter((c) => c.date >= start)
      .reduce((sum, c) => sum + (c.totalMinutes || 0), 0)
  })

  /** 好友榜（好友 + 我，按本周分钟降序） */
  const leaderboard = computed(() => {
    const me = {
      id: 'me',
      name: '我',
      avatar: '⭐',
      weeklyMinutes: myWeeklyMinutes.value,
      isMe: true,
    }
    return [...friends.value, me].sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
  })

  /**
   * 初始化：加载 seed + 生成 mock 数据
   */
  function init() {
    seed.value = getOrCreateSeed(
      (k, d) => storage.getItem(k, d),
      (k, v) => storage.setItem(k, v),
      LS_KEY.SOCIAL_SEED
    )
    peers.value = generatePeers(seed.value, 8)
    friends.value = generateFriends(seed.value, 7)
  }

  /**
   * 加入自习室：启动定时器模拟他人状态变化
   */
  function joinRoom() {
    if (isRoomJoined.value) return
    isRoomJoined.value = true
    timerId = setInterval(() => {
      // 随机挑 1-2 个 peer 增加专注时长、翻转状态
      const updates = 1 + Math.floor(Math.random() * 2)
      for (let i = 0; i < updates; i++) {
        const idx = Math.floor(Math.random() * peers.value.length)
        const p = peers.value[idx]
        if (p) {
          p.focusMinutes += Math.floor(Math.random() * 5) + 1
          if (Math.random() > 0.7) p.studying = !p.studying
        }
      }
    }, 3000)
  }

  /**
   * 离开自习室：清除定时器
   */
  function leaveRoom() {
    isRoomJoined.value = false
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  return {
    peers,
    friends,
    isRoomJoined,
    myMinutes,
    myWeeklyMinutes,
    leaderboard,
    init,
    joinRoom,
    leaveRoom,
  }
})

export default useSocialStore
