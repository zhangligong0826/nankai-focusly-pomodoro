/**
 * 应用设置 API
 * @module api/settings
 * @description GET/PUT /api/settings
 */

import { request } from './index'

/**
 * 获取应用设置
 * @returns {Promise<object>} Settings
 */
export function getSettings() {
  return request.get('/settings')
}

/**
 * 更新应用设置
 * @param {object} data - 部分字段
 * @returns {Promise<object>} 完整 Settings
 */
export function updateSettings(data) {
  return request.put('/settings', data)
}

export default { getSettings, updateSettings }
