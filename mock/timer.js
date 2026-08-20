/**
 * 计时器配置 Mock
 * @module mock/timer
 * @description GET/PUT /api/timer/config，内存单例配置
 */

import { DEFAULT_TIMER_CONFIG } from '../src/utils/constants'

/** 内存配置（单例） */
let configStore = { ...DEFAULT_TIMER_CONFIG }

export default [
  {
    url: '/api/timer/config',
    method: 'get',
    timeout: 200,
    response: () => {
      return {
        code: 0,
        data: { ...configStore },
        message: 'success',
      }
    },
  },
  {
    url: '/api/timer/config',
    method: 'put',
    timeout: 200,
    response: ({ body }) => {
      configStore = { ...configStore, ...(body || {}) }
      return {
        code: 0,
        data: { ...configStore },
        message: '配置已更新',
      }
    },
  },
]
