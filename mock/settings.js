/**
 * 应用设置 Mock
 * @module mock/settings
 * @description GET/PUT /api/settings，内存单例
 */

import { DEFAULT_SETTINGS } from '../src/utils/constants'

/** 内存设置（单例） */
let settingsStore = { ...DEFAULT_SETTINGS }

export default [
  {
    url: '/api/settings',
    method: 'get',
    timeout: 200,
    response: () => {
      return { code: 0, data: { ...settingsStore }, message: 'success' }
    },
  },
  {
    url: '/api/settings',
    method: 'put',
    timeout: 200,
    response: ({ body }) => {
      settingsStore = { ...settingsStore, ...(body || {}) }
      return { code: 0, data: { ...settingsStore }, message: '设置已更新' }
    },
  },
]
