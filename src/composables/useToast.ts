/**
 * Toast 全局提示（模块级单例响应式）
 * @module composables/useToast
 * @description 任意模块（含 Pinia store）可调用 showToast 触发提示；BaseToast 组件订阅 toasts 渲染
 */

import { ref } from 'vue'

/** Toast 类型 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/** 类型 → 主题色映射键 */
export const TOAST_TYPE = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const)

/** Toast 条目结构 */
export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
}

/** 全局 toast 列表（单例） */
const toasts = ref<ToastItem[]>([])

/** 自增 id */
let uid = 0

/** 显示一条 Toast */
function showToast(message: string, type: ToastType = TOAST_TYPE.INFO, duration = 3000): number {
  const id = ++uid
  toasts.value.push({ id, message, type, duration })
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

/** 移除一条 Toast */
function removeToast(id: number): void {
  const idx = toasts.value.findIndex((t) => t.id === id)
  if (idx > -1) toasts.value.splice(idx, 1)
}

/** Toast 组合式函数 */
export function useToast() {
  return { toasts, showToast, removeToast }
}

export { showToast, removeToast }
export default useToast
