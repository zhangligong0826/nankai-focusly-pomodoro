/**
 * 键盘快捷键管理（P2）
 * @module composables/useKeyboardShortcuts
 * @description 全局 keydown 监听，支持组合键（ctrl/cmd/shift/alt）；自动在卸载时清理
 */

import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/** 快捷键配置：键名 → 处理函数 */
export type ShortcutMap = Record<string, (e: KeyboardEvent) => void>

/** 快捷键选项 */
export interface ShortcutOptions {
  disabled?: Ref<boolean>
}

/** 注册全局快捷键 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, opts: ShortcutOptions = {}) {
  /** 解析并匹配快捷键 */
  function onKeydown(e: KeyboardEvent) {
    // 输入框内不触发全局快捷键（避免干扰打字）
    const target = e.target as HTMLElement
    const tag = target && target.tagName
    const editable =
      tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
    if (editable) return

    if (opts.disabled && opts.disabled.value) return

    for (const [keys, handler] of Object.entries(shortcuts)) {
      const parts = keys.toLowerCase().split('+').map((s) => s.trim())
      const key = parts.pop()
      const ctrl = parts.includes('ctrl') || parts.includes('cmd') || parts.includes('meta')
      const shift = parts.includes('shift')
      const alt = parts.includes('alt')

      const pressedKey = (e.key || '').toLowerCase()
      const isMatch =
        pressedKey === key &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift &&
        e.altKey === alt &&
        (ctrl || !e.ctrlKey) &&
        (shift || !e.shiftKey) &&
        (alt || !e.altKey)

      if (isMatch) {
        e.preventDefault()
        handler(e)
        return
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}

export default useKeyboardShortcuts
