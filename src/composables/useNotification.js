/**
 * 浏览器通知（Notification API）
 * @module composables/useNotification
 * @description 权限申请 / 通知展示，含权限降级处理（未授权时降级为仅 Toast+声音）
 */

import { useLocalStorage } from './useLocalStorage'
import { LS_KEY } from '@/utils/constants'

/** 模块级去重：同标题在时间窗内不重复弹（P2-4） */
let lastNotif = { title: '', at: 0 }
const DEDUP_WINDOW = 3000 // 3 秒

/**
 * 通知组合式函数
 * @returns {{ requestPermission: Function, showNotification: Function, permission: Function }}
 */
export function useNotification() {
  const storage = useLocalStorage()

  /**
   * 是否支持 Notification
   * @returns {boolean}
   */
  function isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window
  }

  /**
   * 获取当前权限状态
   * @returns {'default'|'granted'|'denied'|'unsupported'}
   */
  function permission() {
    if (!isSupported()) return 'unsupported'
    return Notification.permission
  }

  /**
   * 申请通知权限
   * @returns {Promise<'default'|'granted'|'denied'|'unsupported'>}
   */
  async function requestPermission() {
    if (!isSupported()) return 'unsupported'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'
    try {
      const result = await Notification.requestPermission()
      // 记录已询问过，避免重复弹窗
      storage.setItem(LS_KEY.NOTIFICATION_ASKED, true)
      return result
    } catch (e) {
      console.warn('[Notification] 申请权限失败:', e)
      return 'denied'
    }
  }

  /**
   * 是否已询问过权限（用于避免首次重复弹窗引导）
   * @returns {boolean}
   */
  function hasAsked() {
    return storage.getItem(LS_KEY.NOTIFICATION_ASKED, false) === true
  }

  /**
   * 展示桌面通知（权限未授予时静默降级）
   * @param {string} title - 通知标题
   * @param {string} [body=''] - 通知正文
   * @param {string} [icon=''] - 图标 URL
   * @returns {boolean} 是否成功展示
   */
  function showNotification(title, body = '', icon = '') {
    if (!isSupported() || Notification.permission !== 'granted') {
      return false
    }
    // 去重：同标题 3 秒内不重复弹（连续完成两个番茄的场景）
    const now = Date.now()
    if (title === lastNotif.title && now - lastNotif.at < DEDUP_WINDOW) {
      return false
    }
    lastNotif = { title, at: now }
    try {
      const n = new Notification(title, {
        body,
        icon: icon || undefined,
        tag: 'focusly-timer',
        // renotify: true,
      })
      // 5 秒后自动关闭（部分浏览器不支持 close，忽略错误）
      setTimeout(() => {
        try {
          n.close()
        } catch (_) {
          /* noop */
        }
      }, 5000)
      return true
    } catch (e) {
      console.warn('[Notification] 展示失败:', e)
      return false
    }
  }

  return { requestPermission, showNotification, permission, isSupported, hasAsked }
}

export default useNotification
