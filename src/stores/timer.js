/**
 * 计时器 Store（核心状态机 + 全生命周期 + deadline 计时 + 刷新恢复）
 * @module stores/timer
 * @description idle→running→paused→running/complete→idle；complete() 触发
 *   记录会话→更新任务消耗→触发打卡→声音/通知/Toast→切换模式→每日目标判定
 *
 * 计时采用「绝对截止时间戳」模式（deadlineAt），不依赖 setInterval 每秒减一，
 * 避免后台标签页节流导致的计时漂移；状态持久化到 localStorage，刷新后可恢复。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingsStore } from './settings'
import { useTaskStore } from './task'
import { useCheckinStore } from './checkin'
import { useGardenStore } from './garden'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { showToast } from '@/composables/useToast'
import { useSound } from '@/composables/useSound'
import { useNotification } from '@/composables/useNotification'
import { useDocumentTitle } from '@/composables/useDocumentTitle'
import { generateUUID } from '@/utils/uuid'
import { getTodayStr } from '@/utils/date'
import { computeRemaining, computeDeadline } from '@/utils/timer'
import { idbGet, idbSet } from '@/utils/indexedDB'
import {
  TIMER_MODE,
  TIMER_STATUS,
  SESSION_TYPE,
  LS_KEY,
  FOCUS_LOCK_MODE,
} from '@/utils/constants'

/** 模块级（非响应式）：定时器 id 与本次会话的截止时间戳 */
let intervalId = null
let deadlineAt = null

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
  /** 本次专注的意图（P1-3，开始前填写，空串=未填） */
  const intent = ref('')
  /** 待反思的会话 id（P1-3，专注正常完成后触发反思弹窗） */
  const pendingReflectionId = ref(null)

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
    deadlineAt = null
  }

  /**
   * 重置剩余时间为当前模式初始值
   */
  function resetRemaining() {
    remainingSeconds.value = totalSeconds.value
  }

  /**
   * 持久化计时器状态（用于刷新恢复）
   */
  function persistState() {
    storage.setItem(LS_KEY.TIMER_STATE, {
      mode: mode.value,
      status: status.value,
      remainingSeconds: remainingSeconds.value,
      deadlineAt,
      currentRound: currentRound.value,
      totalRounds: totalRounds.value,
      boundTaskId: boundTaskId.value,
      focusLock: settingsStore.settings.focusLock,
      savedAt: Date.now(),
    })
  }

  /**
   * 清除持久化的计时器状态（完成/重置后）
   */
  function clearPersistedState() {
    storage.removeItem(LS_KEY.TIMER_STATE)
  }

  /**
   * 每秒 tick：基于 deadline 重算剩余时间（不依赖 tick 次数）
   */
  function tick() {
    const remaining = deadlineAt ? computeRemaining(deadlineAt) : remainingSeconds.value
    remainingSeconds.value = remaining
    // 实时更新页面标题
    title.updateTitle(remainingSeconds.value, mode.value)
    // 归零即完成
    if (remaining <= 0) {
      clearTimer()
      complete(false)
    }
  }

  /**
   * 开始计时
   * @param {string} [focusIntent=''] - 本次专注意图（P1-3）
   */
  function start(focusIntent = '') {
    // 防叠加：先清除已有定时器
    clearTimer()
    // 记录本次意图（仅专注模式）
    if (mode.value === TIMER_MODE.FOCUS) {
      intent.value = (focusIntent || '').trim()
    }
    // 重新读取配置轮数
    totalRounds.value = settingsStore.config.longBreakInterval || 4
    // 应用异步初始化尚未完成时，仍保证从当前模式的完整时长开始。
    if (remainingSeconds.value <= 0) resetRemaining()
    deadlineAt = computeDeadline(remainingSeconds.value)
    status.value = TIMER_STATUS.RUNNING
    persistState()
    intervalId = setInterval(tick, 1000)
  }

  /**
   * 暂停
   */
  function pause() {
    // 先按 deadline 校准剩余秒数，再停表
    if (deadlineAt) {
      remainingSeconds.value = computeRemaining(deadlineAt)
    }
    clearTimer()
    status.value = TIMER_STATUS.PAUSED
    persistState()
  }

  /**
   * 继续
   */
  function resume() {
    if (status.value !== TIMER_STATUS.PAUSED) return
    clearTimer()
    deadlineAt = computeDeadline(remainingSeconds.value)
    status.value = TIMER_STATUS.RUNNING
    persistState()
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
    clearPersistedState()
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

    // 1. 记录 FocusSession（写入 IndexedDB，统计来源）
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
      intent: completedType === SESSION_TYPE.FOCUS ? intent.value : '',
      rating: null,
      reflection: '',
    }
    const sessions = await idbGet(LS_KEY.SESSIONS, [])
    sessions.push(session)
    await idbSet(LS_KEY.SESSIONS, sessions)

    // 1.1 专注正常完成：触发反思弹窗（P1-3）
    if (completedType === SESSION_TYPE.FOCUS && !skipped) {
      pendingReflectionId.value = session.id
    }
    // 意图在本次会话记录后清空
    intent.value = ''

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
      // 专注完成：养成物成长/解锁对账（P1-1）
      try {
        useGardenStore().reconcile()
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
    clearPersistedState()

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
   * 中止当前专注（P1-6 强锁离开 / 刷新恢复判定为强锁中断）
   * @description 与 skip/complete 的区别：明确标记 aborted:true，
   *   不 checkin、不加番茄、不反思、不庆祝、不 autoStart；
   *   供养成物判定枯萎、供统计排除。
   * @param {string} [reason=''] - 中止原因（如 '强锁离开'）
   */
  async function abort(reason = '') {
    if (status.value !== TIMER_STATUS.RUNNING) return
    clearTimer()
    const completedType = mode.value
    const elapsedMinutes = Math.max(
      0,
      Math.round((totalSeconds.value - remainingSeconds.value) / 60)
    )

    // 记录一个 aborted 会话（供统计/养成物判定，不计入有效专注）
    const session = {
      id: generateUUID(),
      taskId: boundTaskId.value || null,
      startedAt: Date.now() - elapsedMinutes * 60 * 1000,
      endedAt: Date.now(),
      durationMinutes: elapsedMinutes,
      type: completedType,
      completed: false,
      aborted: true,
      abortReason: reason,
      intent: intent.value,
      rating: null,
      reflection: '',
    }
    const sessions = await idbGet(LS_KEY.SESSIONS, [])
    sessions.push(session)
    await idbSet(LS_KEY.SESSIONS, sessions)

    intent.value = ''
    status.value = TIMER_STATUS.IDLE
    resetRemaining()
    title.restoreTitle()
    clearPersistedState()

    // 强锁离开导致养成物枯萎（P1-1）
    if (completedType === SESSION_TYPE.FOCUS) {
      try {
        useGardenStore().wilt(reason || '专注中断')
      } catch (_) {
        /* ignore */
      }
    }

    showToast(reason ? `已${reason}，本次专注未计入` : '本次专注已中止', 'warning')
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

  /**
   * 保存专注反思（P1-3）：打分 + 文字写回对应 session
   * @param {number|null} rating - 目标达成度 1-5
   * @param {string} reflection - 反思文字
   */
  async function saveReflection(rating, reflection = '') {
    const id = pendingReflectionId.value
    if (!id) return
    pendingReflectionId.value = null
    try {
      const sessions = await idbGet(LS_KEY.SESSIONS, [])
      const idx = sessions.findIndex((s) => s && s.id === id)
      if (idx !== -1) {
        sessions[idx] = {
          ...sessions[idx],
          rating: rating ?? null,
          reflection: (reflection || '').trim(),
        }
        await idbSet(LS_KEY.SESSIONS, sessions)
      }
    } catch (_) {
      /* 反思保存失败不阻塞主流程 */
    }
  }

  /** 关闭反思弹窗（不保存） */
  function dismissReflection() {
    pendingReflectionId.value = null
  }

  /**
   * 初始化：加载配置 + 绑定任务 + 重置剩余时间 + 刷新恢复
   */
  function init() {
    totalRounds.value = settingsStore.config.longBreakInterval || 4
    boundTaskId.value = storage.getItem(LS_KEY.CURRENT_TASK, null)

    // 刷新恢复：若存在上次未完成的计时状态则恢复
    const saved = storage.getItem(LS_KEY.TIMER_STATE, null)
    if (saved && typeof saved === 'object') {
      mode.value = saved.mode || TIMER_MODE.FOCUS
      currentRound.value = saved.currentRound || 1
      totalRounds.value = saved.totalRounds || totalRounds.value
      boundTaskId.value = saved.boundTaskId ?? boundTaskId.value

      if (saved.status === TIMER_STATUS.RUNNING && saved.deadlineAt) {
        // 运行中恢复：按 deadline 重算，已过期则补结算
        const remaining = computeRemaining(saved.deadlineAt)
        deadlineAt = saved.deadlineAt
        if (remaining <= 0) {
          remainingSeconds.value = 0
          status.value = TIMER_STATUS.RUNNING
          // 强锁中断的专注（关页后 deadline 过期）应判定为 abort，而非正常完成
          if (
            saved.focusLock === FOCUS_LOCK_MODE.HARD &&
            saved.mode === TIMER_MODE.FOCUS
          ) {
            abort('强锁中断')
          } else {
            complete(false)
          }
        } else {
          remainingSeconds.value = remaining
          status.value = TIMER_STATUS.RUNNING
          intervalId = setInterval(tick, 1000)
          title.updateTitle(remainingSeconds.value, mode.value)
        }
        return
      }

      if (saved.status === TIMER_STATUS.PAUSED) {
        // 暂停中恢复：保持暂停与剩余秒数
        remainingSeconds.value =
          saved.remainingSeconds ?? totalSeconds.value
        status.value = TIMER_STATUS.PAUSED
        return
      }
    }

    // 无待恢复状态：回到默认
    mode.value = TIMER_MODE.FOCUS
    status.value = TIMER_STATUS.IDLE
    currentRound.value = 1
    resetRemaining()
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
    intent,
    pendingReflectionId,
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
    abort,
    setConfig,
    bindTask,
    getElapsedMinutes,
    clearPhaseReminder,
    saveReflection,
    dismissReflection,
    checkDailyGoal,
  }
})

export default useTimerStore
