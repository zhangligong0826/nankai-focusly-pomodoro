/**
 * 键盘快捷键管理（P2）
 * @module composables/useKeyboardShortcuts
 * @description 全局 keydown 监听，支持组合键（ctrl/cmd/shift/alt）；自动在卸载时清理
 */

import { onMounted, onUnmounted } from 'vue'

/**
 * 注册全局快捷键
 * @param {Object<string, Function>} shortcuts - { 'ctrl+p': handler, 'space': handler, ... }
 *   键名格式：修饰键 + '+' + 主键，如 'ctrl+p' / 'cmd+shift+n' / 'space' / '?'
 * @param {Object} [opts] - { disabled: Ref<boolean> } 可传入响应式开关
 */
export function useKeyboardShortcuts(shortcuts, opts = {}) {
  /**
   * 解析并匹配快捷键
   * @param {KeyboardEvent} e
   */
  function onKeydown(e) {
    // 输入框内不触发全局快捷键（避免干扰打字）
    const tag = e.target && e.target.tagName
    const editable =
      tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable
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
        // 未声明 ctrl 时，不允许 ctrl 按下
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
