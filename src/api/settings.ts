/**
 * 应用设置 API
 * @module api/settings
 * @description GET/PUT /api/settings
 */

import { request } from './index'

/** 获取应用设置 */
export function getSettings(): Promise<any> {
  return request.get('/settings')
}

/** 更新应用设置 */
export function updateSettings(data: Record<string, unknown>): Promise<any> {
  return request.put('/settings', data)
}

export default { getSettings, updateSettings }
