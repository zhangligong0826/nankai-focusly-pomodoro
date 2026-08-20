/**
 * Axios 实例 + 拦截器 + 请求取消
 * @module api/index
 * @description ① baseURL /api，10s 超时 ② 响应拦截器解包 res.data.data，code!==0 抛业务错误 ③ 取消器工厂
 */

import axios from 'axios'
import { API_CODE } from '@/utils/constants'

/**
 * Axios 实例
 * @type {import('axios').AxiosInstance}
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================== 请求拦截器 ====================
request.interceptors.request.use(
  (config) => {
    // 可附加 token / loading 状态（此处预留）
    return config
  },
  (error) => Promise.reject(error)
)

// ==================== 响应拦截器 ====================
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 非标准响应（如直接返回数组）直接透传
    if (res === null || typeof res !== 'object' || Array.isArray(res)) {
      return res
    }
    // 统一响应格式 { code, data, message }
    if (typeof res.code !== 'undefined') {
      if (res.code === API_CODE.SUCCESS) {
        return res.data
      }
      // 业务错误：抛出，携带 message
      const err = new Error(res.message || '请求失败')
      err.code = res.code
      err.business = true
      return Promise.reject(err)
    }
    return res
  },
  (error) => {
    // 网络错误 / 超时 / HTTP 错误
    const normalized = new Error(
      error.code === 'ECONNABORTED'
        ? '请求超时，请检查网络'
        : error.response
          ? `请求失败（${error.response.status}）`
          : '网络异常，请稍后重试'
    )
    normalized.original = error
    normalized.timeout = error.code === 'ECONNABORTED'
    return Promise.reject(normalized)
  }
)

/**
 * 创建 AbortController，用于取消重复请求（定时器叠加场景）
 * @returns {{ signal: AbortSignal, cancel: Function }}
 */
function createCancelToken() {
  const controller = new AbortController()
  return {
    signal: controller.signal,
    cancel: (reason = 'cancelled') => {
      try {
        controller.abort(reason)
      } catch (_) {
        /* noop */
      }
    },
  }
}

/**
 * 安全请求包装：捕获错误并返回 null，便于 store 走 LocalStorage 兜底
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<{ ok: boolean, data: T|null, error: Error|null }>}
 */
async function safeRequest(promise) {
  try {
    const data = await promise
    return { ok: true, data, error: null }
  } catch (error) {
    return { ok: false, data: null, error }
  }
}

export { request, createCancelToken, safeRequest }
export default request
