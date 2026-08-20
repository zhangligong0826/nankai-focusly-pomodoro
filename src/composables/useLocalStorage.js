/**
 * LocalStorage 读写封装
 * @module composables/useLocalStorage
 * @description 统一 JSON 序列化 / 异常捕获 / 容量检测（QuotaExceededError 提示导出清理）
 */

import { LS_KEY } from '@/utils/constants'
import { showToast } from './useToast'

/**
 * LocalStorage 组合式函数
 * @returns {{ getItem: Function, setItem: Function, removeItem: Function, hasItem: Function }}
 */
export function useLocalStorage() {
  /**
   * 读取并反序列化
   * @param {string} key - LocalStorage 键名
   * @param {*} [defaultValue=null] - 默认值（读取失败/不存在时返回）
   * @returns {*} 解析后的值
   */
  function getItem(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? defaultValue : JSON.parse(raw)
    } catch (e) {
      console.error(`[LocalStorage] 读取 ${key} 失败:`, e)
      return defaultValue
    }
  }

  /**
   * 序列化并写入
   * @param {string} key
   * @param {*} value
   * @returns {boolean} 是否写入成功
   */
  function setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (e) {
      // 容量超限
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        showToast('存储空间已满，请导出数据后清理', 'error')
      }
      console.error(`[LocalStorage] 写入 ${key} 失败:`, e)
      return false
    }
  }

  /**
   * 删除指定 key
   * @param {string} key
   */
  function removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`[LocalStorage] 删除 ${key} 失败:`, e)
    }
  }

  /**
   * 是否存在指定 key
   * @param {string} key
   * @returns {boolean}
   */
  function hasItem(key) {
    try {
      return localStorage.getItem(key) !== null
    } catch (e) {
      return false
    }
  }

  return { getItem, setItem, removeItem, hasItem }
}

export default useLocalStorage
export { LS_KEY }
