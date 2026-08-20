/**
 * 计时引擎（薄封装）
 * @module composables/useTimerEngine
 * @description 包装 TimerStore，提供组件绑定的计算属性与生命周期清理；
 *   底层 setInterval / complete() 逻辑由 TimerStore 统一管理（store 单例，跨路由持久）
 */

import { computed } from 'vue'
import { useTimerStore } from '@/stores/timer'
import { secondsToMMSS } from '@/utils/format'
import { MODE_META } from '@/utils/constants'

/**
 * 计时引擎组合式函数
 * @returns {{ store: object, displayTime: import('vue').ComputedRef<string>, modeLabel: import('vue').ComputedRef<string>, modeColor: import('vue').ComputedRef<string>, progress: import('vue').ComputedRef<number> }}
 */
export function useTimerEngine() {
  const store = useTimerStore()

  /** 显示用 MM:SS */
  const displayTime = computed(() => secondsToMMSS(store.remainingSeconds))

  /** 当前模式标签 */
  const modeLabel = computed(() => MODE_META[store.mode]?.label || '专注中')

  /** 当前模式颜色 */
  const modeColor = computed(() => MODE_META[store.mode]?.color || 'var(--color-primary)')

  return {
    store,
    displayTime,
    modeLabel,
    modeColor,
    progress: computed(() => store.progress),
  }
}

export default useTimerEngine
