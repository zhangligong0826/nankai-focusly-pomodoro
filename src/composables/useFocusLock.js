/**
 * 专注锁定（P1-5）
 * @module composables/useFocusLock
 * @description focus+running 状态下监听 visibilitychange/blur，切走时弹窗警告；
 *   提供「紧急暂停」入口：长按计时器 3 秒 或 快捷键 Ctrl/Cmd+P 强制暂停
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useTimerStore } from '@/stores/timer'
import { useSettingsStore } from '@/stores/settings'
import { showToast } from '@/composables/useToast'
import { TIMER_MODE, TIMER_STATUS, FOCUS_LOCK_MODE } from '@/utils/constants'

/** 警告弹窗可见性（供 FocusLockWarning 组件订阅，全局单例） */
const warningVisible = ref(false)

/**
 * 专注锁定组合式函数（应在 App.vue 调用以全局生效）
 * @returns {{ isActive: import('vue').Ref<boolean>, warningVisible: import('vue').Ref<boolean>, dismissWarning: Function, emergencyPause: Function }}
 */
export function useFocusLock() {
  const timerStore = useTimerStore()
  const settingsStore = useSettingsStore()
  const isActive = ref(false)
  let locked = false

  /** 是否应处于锁定态：focus 模式 + running + 开启锁定（非 off） */
  function shouldLock() {
    return (
      settingsStore.settings.focusLock !== FOCUS_LOCK_MODE.OFF &&
      timerStore.mode === TIMER_MODE.FOCUS &&
      timerStore.status === TIMER_STATUS.RUNNING
    )
  }

  /** 是否强锁 */
  function isHardLock() {
    return settingsStore.settings.focusLock === FOCUS_LOCK_MODE.HARD
  }

  function sync() {
    const next = shouldLock()
    isActive.value = next
    if (next && !locked) {
      locked = true
      window.addEventListener('visibilitychange', onVisibilityChange)
      window.addEventListener('blur', onBlur)
    } else if (!next && locked) {
      locked = false
      window.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    }
  }

  /** 触发锁定违规处理：强锁→abort，软提醒→弹窗 */
  function onViolation() {
    if (!shouldLock()) return
    if (isHardLock()) {
      // 强锁：离开即中止（幂等由 abort 内部 status 判断保证）
      timerStore.abort('强锁离开')
    } else {
      warningVisible.value = true
    }
  }

  function onVisibilityChange() {
    if (document.hidden && shouldLock()) {
      onViolation()
    }
  }

  function onBlur() {
    if (shouldLock()) {
      // blur 触发较敏感，延迟检测避免误报
      setTimeout(() => {
        if (shouldLock()) onViolation()
      }, 200)
    }
  }

  /** 关闭警告 */
  function dismissWarning() {
    warningVisible.value = false
  }

  /** 紧急暂停（长按 / Ctrl+P 触发） */
  function emergencyPause() {
    timerStore.pause()
    isActive.value = false
    warningVisible.value = false
    showToast('已紧急暂停计时', 'info')
  }

  /** 键盘 Ctrl/Cmd + P 强制暂停 */
  function onKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      if (shouldLock() || timerStore.status === TIMER_STATUS.RUNNING) {
        e.preventDefault()
        emergencyPause()
      }
    }
  }

  watch(
    () => [timerStore.mode, timerStore.status, settingsStore.settings.focusLock],
    sync,
    { immediate: false }
  )

  onMounted(() => {
    sync()
    window.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    if (locked) {
      window.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    }
    window.removeEventListener('keydown', onKeydown)
  })

  return { isActive, warningVisible, dismissWarning, emergencyPause }
}

export { warningVisible }
export default useFocusLock
