/**
 * Toast 全局提示（模块级单例响应式）
 * @module composables/useToast
 * @description 任意模块（含 Pinia store）可调用 showToast 触发提示；BaseToast 组件订阅 toasts 渲染
 */

import { ref } from 'vue'

/** 类型 → 主题色映射键 */
export const TOAST_TYPE = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
})

/** 全局 toast 列表（单例） */
const toasts = ref([])

/** 自增 id */
let uid = 0

/**
 * 显示一条 Toast
 * @param {string} message - 提示文案
 * @param {string} [type='info'] - success | error | warning | info
 * @param {number} [duration=3000] - 自动消失毫秒
 * @returns {number} toast id
 */
function showToast(message, type = TOAST_TYPE.INFO, duration = 3000) {
  const id = ++uid
  toasts.value.push({ id, message, type, duration })
  // 自动消失
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

/**
 * 移除一条 Toast
 * @param {number} id
 */
function removeToast(id) {
  const idx = toasts.value.findIndex((t) => t.id === id)
  if (idx > -1) toasts.value.splice(idx, 1)
}

/**
 * Toast 组合式函数
 * @returns {{ toasts: import('vue').Ref, showToast: Function, removeToast: Function }}
 */
export function useToast() {
  return { toasts, showToast, removeToast }
}

export { showToast, removeToast }
export default useToast
