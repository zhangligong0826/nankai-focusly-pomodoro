/**
 * 计时器 Store（核心状态机 + 全生命周期）
 * @module stores/timer
 * @description idle→running→paused→running/complete→idle；complete() 触发
 *   记录会话→更新任务消耗→触发打卡→声音/通知/Toast→切换模式→每日目标判定
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingsStore } from './settings'
import { useTaskStore } from './task'
import { useCheckinStore } from './checkin'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { showToast } from '@/composables/useToast'
import { useSound } from '@/composables/useSound'
import { useNotification } from '@/composables/useNotification'
import { useDocumentTitle } from '@/composables/useDocumentTitle'
import { generateUUID } from '@/utils/uuid'
import { getTodayStr } from '@/utils/date'
import {
  TIMER_MODE,
  TIMER_STATUS,
  SESSION_TYPE,
  LS_KEY,
} from '@/utils/constants'

/** 模块级（非响应式）：定时器 id 与本次会话起始时间 */
let intervalId = null

export const useTimerStore = defineStore('timer', () => {
  const storage = useLocalStorage()
  const settingsStore = useSettingsStore()
  const title = useDocumentTitle()
  const sound = useSound()
  const notify = useNotification()

  /** 当前计时模式 */
  const mode = ref(TIMER_MODE.FOCUS)
  /** 运行状态 */
  const status = ref(TIMER_STATUS.IDLE)
  /** 剩余秒数 */
  const remainingSeconds = ref(0)
  /** 当前轮次（1-N） */
  const currentRound = ref(1)
  /** 长休间隔轮数（来自 config） */
  const totalRounds = ref(4)
  /** 当前绑定的任务 ID */
  const boundTaskId = ref(null)

  /** 阶段切换提醒（BreakReminder 订阅）{ from, to, skipped } */
  const phaseReminder = ref(null)
  /** 每日目标达成触发计数（DailyGoalCelebration 订阅） */
  const celebrationTrigger = ref(0)
  /** 最近一次完成信息 */
  const lastComplete = ref(null)

  /**
   * 当前模式总秒数
   */
  const totalSeconds = computed(() => {
    const cfg = settingsStore.config
    const map = {
      [TIMER_MODE.FOCUS]: cfg.focusDuration,
      [TIMER_MODE.SHORT_BREAK]: cfg.shortBreakDuration,
      [TIMER_MODE.LONG_BREAK]: cfg.longBreakDuration,
    }
    return (map[mode.value] || cfg.focusDuration) * 60
  })

  /** 进度百分比 0-1（用于环形进度条） */
  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return Math.min(1, Math.max(0, 1 - remainingSeconds.value / totalSeconds.value))
  })

  /** 是否运行中 */
  const isRunning = computed(() => status.value === TIMER_STATUS.RUNNING)

  /**
   * 清除定时器
   */
  function clearTimer() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  /**
   * 重置剩余时间为当前模式初始值
   */
  function resetRemaining() {
    remainingSeconds.value = totalSeconds.value
  }

  /**
   * 初始化：加载配置 + 绑定任务 + 重置剩余时间
   */
  function init() {
    totalRounds.value = settingsStore.config.longBreakInterval || 4
    boundTaskId.value = storage.getItem(LS_KEY.CURRENT_TASK, null)
    mode.value = TIMER_MODE.FOCUS
    status.value = TIMER_STATUS.IDLE
    currentRound.value = 1
    resetRemaining()
  }

  /**
   * 每秒 tick：减 1，归零则完成
   */
  function tick() {
    if (remainingSeconds.value <= 0) {
      clearTimer()
      complete(false)
      return
    }
    remainingSeconds.value -= 1
    // 实时更新页面标题
    title.updateTitle(remainingSeconds.value, mode.value)
  }

  /**
   * 开始计时
   */
  function start() {
    // 防叠加：先清除已有定时器
    clearTimer()
    // 重新读取配置轮数
    totalRounds.value = settingsStore.config.longBreakInterval || 4
    status.value = TIMER_STATUS.RUNNING
    intervalId = setInterval(tick, 1000)
  }

  /**
   * 暂停
   */
  function pause() {
    clearTimer()
    status.value = TIMER_STATUS.PAUSED
  }

  /**
   * 继续
   */
  function resume() {
    if (status.value !== TIMER_STATUS.PAUSED) return
    clearTimer()
    status.value = TIMER_STATUS.RUNNING
    intervalId = setInterval(tick, 1000)
  }

  /**
   * 重置到当前模式初始值
   */
  function reset() {
    clearTimer()
    status.value = TIMER_STATUS.IDLE
    resetRemaining()
    title.restoreTitle()
  }

  /**
   * 跳过当前阶段（不计为完成）
   */
  function skip() {
    clearTimer()
    complete(true)
  }

  /**
   * 完成：记录 session → 更新任务 → 触发打卡 → 提醒 → 切换模式
   * @param {boolean} [skipped=false] - 是否手动跳过
   */
  async function complete(skipped = false) {
    clearTimer()
    const cfg = settingsStore.config
    const completedType = mode.value
    const elapsedMinutes = Math.max(
      0,
      Math.round((totalSeconds.value - remainingSeconds.value) / 60)
    )

    // 1. 记录 FocusSession（写入 LS，统计来源）
    const session = {
      id: generateUUID(),
      taskId: boundTaskId.value || null,
      taskTitle: boundTaskId.value
        ? useTaskStore().getTaskById(boundTaskId.value)?.title
        : undefined,
      startedAt: Date.now() - elapsedMinutes * 60 * 1000,
      endedAt: Date.now(),
      durationMinutes: elapsedMinutes,
      type: completedType,
      completed: !skipped,
    }
    const sessions = storage.getItem(LS_KEY.SESSIONS, [])
    sessions.push(session)
    storage.setItem(LS_KEY.SESSIONS, sessions)

    // 2. 仅 focus 会话更新任务消耗 + 触发打卡
    if (completedType === SESSION_TYPE.FOCUS && !skipped) {
      // 更新任务消耗
      if (boundTaskId.value) {
        try {
          await useTaskStore().incrementPomodoro(boundTaskId.value)
        } catch (_) {
          /* ignore */
        }
      }
      // 触发打卡
      try {
        await useCheckinStore().checkin(elapsedMinutes || cfg.focusDuration)
      } catch (_) {
        /* ignore */
      }
    }

    // 3. 三重提醒（声音 / 通知 / Toast）
    if (!skipped) {
      const isFocus = completedType === SESSION_TYPE.FOCUS
      if (cfg.soundEnabled) sound.playDing(0.6)
      if (cfg.notificationEnabled) {
        notify.showNotification(
          isFocus ? '专注完成！' : '休息结束',
          isFocus ? '辛苦啦，休息一下吧~' : '继续专注，加油！'
        )
      }
      showToast(
        isFocus ? '专注完成！休息一下吧~' : '休息结束，继续专注！',
        'success'
      )
    }

    // 4. 切换模式
    let nextMode
    let nextRound = currentRound.value
    if (completedType === SESSION_TYPE.FOCUS) {
      // 专注完成：判断是否进入长休
      if (currentRound.value >= totalRounds.value) {
        nextMode = TIMER_MODE.LONG_BREAK
        nextRound = 0 // 长休后归零
      } else {
        nextMode = TIMER_MODE.SHORT_BREAK
        nextRound = currentRound.value + 1
      }
    } else {
      // 休息完成 → 回到专注
      nextMode = TIMER_MODE.FOCUS
      if (completedType === SESSION_TYPE.LONG_BREAK) {
        nextRound = 1 // 长休后开启新一轮
      } else {
        nextRound = currentRound.value === 0 ? 1 : currentRound.value
      }
    }

    const fromMode = mode.value
    mode.value = nextMode
    currentRound.value = nextRound
    status.value = TIMER_STATUS.IDLE
    resetRemaining()
    title.restoreTitle()

    // 记录最近完成 + 阶段提醒
    lastComplete.value = { type: completedType, skipped, at: Date.now() }
    phaseReminder.value = { from: fromMode, to: nextMode, skipped }

    // 5. 每日目标判定（仅 focus 正常完成）
    if (completedType === SESSION_TYPE.FOCUS && !skipped) {
      checkDailyGoal()
    }

    // 6. 自动开始下一阶段
    const shouldAutoStart =
      (completedType === SESSION_TYPE.FOCUS && cfg.autoStartBreak) ||
      (completedType !== SESSION_TYPE.FOCUS && cfg.autoStartFocus)
    if (shouldAutoStart && !skipped) {
      // 稍延迟以让提醒弹窗显示
      setTimeout(() => {
        if (status.value === TIMER_STATUS.IDLE) start()
      }, 800)
    }
  }

  /**
   * 每日目标达成判定
   */
  function checkDailyGoal() {
    const checkinStore = useCheckinStore()
    const dailyGoal = settingsStore.settings.dailyGoal || 4
    const count = checkinStore.todayPomodoroCount
    const today = getTodayStr()
    const celebratedKey = LS_KEY.CELEBRATE_PREFIX + today
    const celebrated = storage.getItem(celebratedKey, false)
    if (count >= dailyGoal && !celebrated) {
      storage.setItem(celebratedKey, true)
      celebrationTrigger.value += 1
    }
  }

  /**
   * 更新配置（委托 settings store，共享引用）
   */
  async function setConfig(payload) {
    await settingsStore.updateConfig(payload)
    totalRounds.value = settingsStore.config.longBreakInterval || 4
    // 若空闲状态，重置剩余时间以应用新配置
    if (status.value === TIMER_STATUS.IDLE) resetRemaining()
  }

  /**
   * 绑定当前任务
   */
  function bindTask(taskId) {
    boundTaskId.value = taskId
    storage.setItem(LS_KEY.CURRENT_TASK, taskId)
  }

  /**
   * 获取已专注分钟数（当前会话）
   */
  function getElapsedMinutes() {
    return Math.max(0, Math.round((totalSeconds.value - remainingSeconds.value) / 60))
  }

  /** 清除阶段提醒 */
  function clearPhaseReminder() {
    phaseReminder.value = null
  }

  return {
    mode,
    status,
    remainingSeconds,
    currentRound,
    totalRounds,
    boundTaskId,
    phaseReminder,
    celebrationTrigger,
    lastComplete,
    totalSeconds,
    progress,
    isRunning,
    init,
    start,
    pause,
    resume,
    reset,
    skip,
    complete,
    tick,
    setConfig,
    bindTask,
    getElapsedMinutes,
    clearPhaseReminder,
    checkDailyGoal,
  }
})

export default useTimerStore
