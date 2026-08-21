/**
 * 页面标题实时更新
 * @module composables/useDocumentTitle
 * @description 计时中更新 document.title 为 "MM:SS | Focusly 模式"，结束后恢复
 */

import { secondsToMMSS } from '@/utils/format'
import { TIMER_MODE } from '@/utils/constants'
import type { TimerMode } from '@/types'

/** 默认标题 */
const DEFAULT_TITLE = 'Focusly 番茄时钟'

/** 模式标题后缀 */
const MODE_SUFFIX: Record<TimerMode, string> = {
  [TIMER_MODE.FOCUS]: '专注中',
  [TIMER_MODE.SHORT_BREAK]: '短休中',
  [TIMER_MODE.LONG_BREAK]: '长休中',
}

/** 文档标题组合式函数 */
export function useDocumentTitle() {
  /** 更新标题为剩余时间显示 */
  function updateTitle(remainingSeconds: number, mode: TimerMode): void {
    const mmss = secondsToMMSS(remainingSeconds)
    const suffix = MODE_SUFFIX[mode] || '专注中'
    document.title = `${mmss} | Focusly ${suffix}`
  }

  /** 恢复默认标题 */
  function restoreTitle(): void {
    document.title = DEFAULT_TITLE
  }

  return { updateTitle, restoreTitle }
}

export default useDocumentTitle
